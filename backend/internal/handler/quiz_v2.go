package handler

import (
	"context"
	"errors"

	"connectrpc.com/connect"
	"github.com/google/uuid"
	"go.uber.org/zap"

	quizv2 "github.com/km/ai-quiz/gen/quiz/v2"
	"github.com/km/ai-quiz/internal/usecase"
)

// QuizV2Handler implements the Connect-RPC quiz.v2.QuizServiceHandler interface.
type QuizV2Handler struct {
	uc     usecase.QuizV2Usecase
	logger *zap.Logger
}

func NewQuizV2Handler(uc usecase.QuizV2Usecase, logger *zap.Logger) *QuizV2Handler {
	return &QuizV2Handler{uc: uc, logger: logger}
}

func (h *QuizV2Handler) ListCourses(
	ctx context.Context,
	_ *connect.Request[quizv2.ListCoursesRequest],
) (*connect.Response[quizv2.ListCoursesResponse], error) {
	h.logger.Info("v2.ListCourses called")

	resp, err := h.uc.ListCourses(ctx)
	if err != nil {
		h.logger.Error("v2.ListCourses failed", zap.Error(err))
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	return connect.NewResponse(resp), nil
}

func (h *QuizV2Handler) StartAttempt(
	ctx context.Context,
	req *connect.Request[quizv2.StartAttemptRequest],
) (*connect.Response[quizv2.StartAttemptResponse], error) {
	h.logger.Info("v2.StartAttempt called",
		zap.String("course_id", req.Msg.CourseId),
		zap.String("username", req.Msg.Username),
	)

	resp, err := h.uc.StartAttempt(ctx, req.Msg.CourseId, req.Msg.Username)
	if err != nil {
		h.logger.Error("v2.StartAttempt failed", zap.Error(err))
		return nil, connect.NewError(connect.CodeInvalidArgument, err)
	}
	return connect.NewResponse(resp), nil
}

func (h *QuizV2Handler) ListQuestions(
	ctx context.Context,
	req *connect.Request[quizv2.ListQuestionsRequest],
) (*connect.Response[quizv2.ListQuestionsResponse], error) {
	h.logger.Info("v2.ListQuestions called",
		zap.String("attempt_id", req.Msg.AttemptId),
		zap.String("genre", req.Msg.Genre),
		zap.Int32("difficulty", req.Msg.Difficulty),
	)

	resp, err := h.uc.ListQuestions(ctx, req.Msg.AttemptId, req.Msg.Genre, req.Msg.Difficulty)
	if err != nil {
		h.logger.Error("v2.ListQuestions failed", zap.Error(err))
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	return connect.NewResponse(resp), nil
}

func (h *QuizV2Handler) SubmitAnswers(
	ctx context.Context,
	req *connect.Request[quizv2.SubmitAnswersRequest],
) (*connect.Response[quizv2.SubmitAnswersResponse], error) {
	h.logger.Info("v2.SubmitAnswers called",
		zap.String("attempt_id", req.Msg.AttemptId),
		zap.Int("answers", len(req.Msg.Answers)),
	)

	resp, err := h.uc.SubmitAnswers(ctx, req.Msg.AttemptId, req.Msg.Answers)
	if err != nil {
		h.logger.Error("v2.SubmitAnswers failed", zap.Error(err))
		return nil, connect.NewError(connect.CodeInvalidArgument, err)
	}
	return connect.NewResponse(resp), nil
}

func (h *QuizV2Handler) GetAttemptInsights(
	ctx context.Context,
	req *connect.Request[quizv2.GetAttemptInsightsRequest],
) (*connect.Response[quizv2.GetAttemptInsightsResponse], error) {
	h.logger.Info("v2.GetAttemptInsights called", zap.String("attempt_id", req.Msg.AttemptId))

	resp, err := h.uc.GetAttemptInsights(ctx, req.Msg.AttemptId)
	if err != nil {
		h.logger.Error("v2.GetAttemptInsights failed", zap.Error(err))
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	return connect.NewResponse(resp), nil
}

func (h *QuizV2Handler) ListRankings(
	ctx context.Context,
	req *connect.Request[quizv2.ListRankingsRequest],
) (*connect.Response[quizv2.ListRankingsResponse], error) {
	h.logger.Info("v2.ListRankings called", zap.Int32("limit", req.Msg.Limit))

	resp, err := h.uc.ListRankings(ctx, req.Msg.Limit)
	if err != nil {
		h.logger.Error("v2.ListRankings failed", zap.Error(err))
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	return connect.NewResponse(resp), nil
}

func (h *QuizV2Handler) ListGenres(
	ctx context.Context,
	req *connect.Request[quizv2.ListGenresRequest],
) (*connect.Response[quizv2.ListGenresResponse], error) {
	if _, err := uuid.Parse(req.Msg.CourseId); err != nil {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("course_id must be a valid UUID"))
	}
	h.logger.Info("v2.ListGenres called", zap.String("course_id", req.Msg.CourseId))

	resp, err := h.uc.ListGenres(ctx, req.Msg.CourseId)
	if err != nil {
		h.logger.Error("v2.ListGenres failed", zap.Error(err))
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	return connect.NewResponse(resp), nil
}
