package repository

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
	db "github.com/km/ai-quiz/internal/db/gen"
)

// QuizRepository defines the data access interface for quiz operations.
type QuizRepository interface {
	GetFirstTopicID(ctx context.Context) (uuid.UUID, error)
	ListQuestionsByTopic(ctx context.Context, topicID uuid.UUID) ([]db.ListQuestionsByTopicRow, error)
	ListCourses(ctx context.Context) ([]db.ListCoursesRow, error)
	CreateAttempt(ctx context.Context, courseID uuid.UUID, username string) (uuid.UUID, error)
	GetAttempt(ctx context.Context, attemptID uuid.UUID) (db.Attempt, error)
	ListChoicesByQuestionIDs(ctx context.Context, ids []uuid.UUID) ([]db.Choice, error)
	GetExplanationsByQuestionIDs(ctx context.Context, ids []uuid.UUID) ([]db.GetExplanationsByQuestionIDsRow, error)
	InsertQuizResult(ctx context.Context, username string, correctCount, totalCount int32, tier string) error
	InsertQuizResultV2(ctx context.Context, attemptID uuid.UUID, username string, correctCount, totalCount int32, tier string) error
	UpsertAttemptInsights(ctx context.Context, attemptID uuid.UUID, status string, aiFeedback string, errorMessage string) error
	GetAttemptInsights(ctx context.Context, attemptID uuid.UUID) (db.AttemptInsight, error)
	ListRankings(ctx context.Context, limit int32) ([]db.ListRankingsRow, error)
}

type postgresQuizRepository struct {
	queries *db.Queries
}

// NewPostgresQuizRepository creates a new PostgreSQL-backed QuizRepository.
func NewPostgresQuizRepository(sqlDB *sql.DB) QuizRepository {
	return &postgresQuizRepository{
		queries: db.New(sqlDB),
	}
}

func (r *postgresQuizRepository) GetFirstTopicID(ctx context.Context) (uuid.UUID, error) {
	return r.queries.GetFirstTopicID(ctx)
}

func (r *postgresQuizRepository) ListQuestionsByTopic(ctx context.Context, topicID uuid.UUID) ([]db.ListQuestionsByTopicRow, error) {
	return r.queries.ListQuestionsByTopic(ctx, db.ListQuestionsByTopicParams{
		TopicID: topicID,
		Limit:   50,
	})
}

func (r *postgresQuizRepository) ListCourses(ctx context.Context) ([]db.ListCoursesRow, error) {
	return r.queries.ListCourses(ctx)
}

func (r *postgresQuizRepository) CreateAttempt(ctx context.Context, courseID uuid.UUID, username string) (uuid.UUID, error) {
	return r.queries.CreateAttempt(ctx, db.CreateAttemptParams{
		CourseID: courseID,
		Username: username,
	})
}

func (r *postgresQuizRepository) GetAttempt(ctx context.Context, attemptID uuid.UUID) (db.Attempt, error) {
	return r.queries.GetAttempt(ctx, attemptID)
}

func (r *postgresQuizRepository) ListChoicesByQuestionIDs(ctx context.Context, ids []uuid.UUID) ([]db.Choice, error) {
	return r.queries.ListChoicesByQuestionIDs(ctx, ids)
}

func (r *postgresQuizRepository) GetExplanationsByQuestionIDs(ctx context.Context, ids []uuid.UUID) ([]db.GetExplanationsByQuestionIDsRow, error) {
	return r.queries.GetExplanationsByQuestionIDs(ctx, ids)
}

func (r *postgresQuizRepository) InsertQuizResult(ctx context.Context, username string, correctCount, totalCount int32, tier string) error {
	return r.queries.InsertQuizResult(ctx, db.InsertQuizResultParams{
		Username:     username,
		CorrectCount: correctCount,
		TotalCount:   totalCount,
		Tier:         tier,
	})
}

func (r *postgresQuizRepository) InsertQuizResultV2(ctx context.Context, attemptID uuid.UUID, username string, correctCount, totalCount int32, tier string) error {
	return r.queries.InsertQuizResultV2(ctx, db.InsertQuizResultV2Params{
		AttemptID:    uuid.NullUUID{UUID: attemptID, Valid: true},
		Username:     username,
		CorrectCount: correctCount,
		TotalCount:   totalCount,
		Tier:         tier,
	})
}

func (r *postgresQuizRepository) UpsertAttemptInsights(ctx context.Context, attemptID uuid.UUID, status string, aiFeedback string, errorMessage string) error {
	return r.queries.UpsertAttemptInsights(ctx, db.UpsertAttemptInsightsParams{
		AttemptID:    attemptID,
		Status:       status,
		AiFeedback:   aiFeedback,
		ErrorMessage: errorMessage,
	})
}

func (r *postgresQuizRepository) GetAttemptInsights(ctx context.Context, attemptID uuid.UUID) (db.AttemptInsight, error) {
	return r.queries.GetAttemptInsights(ctx, attemptID)
}

func (r *postgresQuizRepository) ListRankings(ctx context.Context, limit int32) ([]db.ListRankingsRow, error) {
	return r.queries.ListRankings(ctx, limit)
}
