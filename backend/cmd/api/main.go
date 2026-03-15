package main

import (
	"database/sql"
	"net/http"
	"os"

	"connectrpc.com/connect"
	_ "github.com/lib/pq"
	"go.uber.org/zap"

	"github.com/km/ai-quiz/gen/quiz/v1/quizv1connect"
	"github.com/km/ai-quiz/gen/quiz/v2/quizv2connect"
	db "github.com/km/ai-quiz/internal/db/gen"
	"github.com/km/ai-quiz/internal/handler"
	"github.com/km/ai-quiz/internal/middleware"
	"github.com/km/ai-quiz/internal/repository"
	"github.com/km/ai-quiz/internal/usecase"
)

func main() {
	logger, err := zap.NewProduction()
	if err != nil {
		panic(err)
	}
	defer logger.Sync() //nolint:errcheck

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://postgres:postgres@localhost:5432/lifecycle_dev?sslmode=disable"
	}

	sqlDB, err := sql.Open("postgres", dsn)
	if err != nil {
		logger.Fatal("failed to open database", zap.Error(err))
	}
	defer sqlDB.Close()

	if err := sqlDB.Ping(); err != nil {
		logger.Fatal("failed to ping database", zap.Error(err))
	}

	queries := db.New(sqlDB)
	authUc := usecase.NewAuthUsecase(queries)
	profileUc := usecase.NewProfileUsecase(queries, authUc)
	authHTTP := handler.NewAuthHTTPHandler(authUc, logger)

	repo := repository.NewPostgresQuizRepository(sqlDB)
	uc := usecase.NewQuizUsecase(repo)
	quizHandler := handler.NewQuizHandler(uc, logger)
	v2uc := usecase.NewQuizV2Usecase(repo)
	quizV2Handler := handler.NewQuizV2Handler(v2uc, profileUc, logger)
	adminRepo := repository.NewPostgresAdminRepository(sqlDB)
	adminUc := usecase.NewAdminUsecase(sqlDB, adminRepo)
	adminHandler := handler.NewAdminHandler(adminUc, logger)

	mux := http.NewServeMux()
	authHTTP.Register(mux)
	path, h := quizv1connect.NewQuizServiceHandler(quizHandler)
	mux.Handle(path, h)
	v2path, v2h := quizv2connect.NewQuizServiceHandler(quizV2Handler)
	mux.Handle(v2path, v2h)
	adminPath, adminH := quizv2connect.NewAdminServiceHandler(
		adminHandler,
		connect.WithInterceptors(middleware.NewAdminBasicAuthInterceptor()),
	)
	mux.Handle(adminPath, adminH)

	cors := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Connect-Protocol-Version, Connect-Timeout-Ms")
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}
	addr := ":" + port
	logger.Info("server starting", zap.String("addr", addr))

	if err := http.ListenAndServe(addr, cors(mux)); err != nil {
		logger.Fatal("server error", zap.Error(err))
	}
}
