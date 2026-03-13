package repository

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
	db "github.com/km/ai-quiz/internal/db/gen"
)

type AdminRepository interface {
	WithTx(tx *sql.Tx) AdminRepository
	CourseExists(ctx context.Context, courseID uuid.UUID) (bool, error)
	InsertQuestionWithID(ctx context.Context, id uuid.UUID, courseID uuid.UUID, text string, difficulty int16, genre string) error
	InsertChoiceWithID(ctx context.Context, id uuid.UUID, questionID uuid.UUID, text string, isCorrect bool, sortOrder int16) error
	InsertExplanationWithID(ctx context.Context, id uuid.UUID, questionID uuid.UUID, text string, docRef sql.NullString) error
	CreateGenre(ctx context.Context, courseID uuid.UUID, name, label string, sortOrder int16) (db.Genre, error)
	UpsertScoringTier(ctx context.Context, courseID uuid.UUID, tier string, minRatio string, label string, sortOrder int16) (db.ScoringTier, error)
	UpdateCourseTemplate(ctx context.Context, courseID uuid.UUID, template string) error
}

type postgresAdminRepository struct {
	queries *db.Queries
}

func NewPostgresAdminRepository(sqlDB *sql.DB) AdminRepository {
	return &postgresAdminRepository{queries: db.New(sqlDB)}
}

func (r *postgresAdminRepository) WithTx(tx *sql.Tx) AdminRepository {
	return &postgresAdminRepository{queries: r.queries.WithTx(tx)}
}

func (r *postgresAdminRepository) CourseExists(ctx context.Context, courseID uuid.UUID) (bool, error) {
	return r.queries.CourseExists(ctx, courseID)
}

func (r *postgresAdminRepository) InsertQuestionWithID(ctx context.Context, id uuid.UUID, courseID uuid.UUID, text string, difficulty int16, genre string) error {
	return r.queries.InsertQuestionWithID(ctx, db.InsertQuestionWithIDParams{
		ID:         id,
		TopicID:    courseID,
		Text:       text,
		Difficulty: difficulty,
		Genre:      genre,
	})
}

func (r *postgresAdminRepository) InsertChoiceWithID(ctx context.Context, id uuid.UUID, questionID uuid.UUID, text string, isCorrect bool, sortOrder int16) error {
	return r.queries.InsertChoiceWithID(ctx, db.InsertChoiceWithIDParams{
		ID:         id,
		QuestionID: questionID,
		Text:       text,
		IsCorrect:  isCorrect,
		SortOrder:  sortOrder,
	})
}

func (r *postgresAdminRepository) InsertExplanationWithID(ctx context.Context, id uuid.UUID, questionID uuid.UUID, text string, docRef sql.NullString) error {
	return r.queries.InsertExplanationWithID(ctx, db.InsertExplanationWithIDParams{
		ID:         id,
		QuestionID: questionID,
		Text:       text,
		DocRef:     docRef,
	})
}

func (r *postgresAdminRepository) CreateGenre(ctx context.Context, courseID uuid.UUID, name, label string, sortOrder int16) (db.Genre, error) {
	return r.queries.CreateGenre(ctx, db.CreateGenreParams{
		CourseID:  courseID,
		Name:      name,
		Label:     label,
		SortOrder: sortOrder,
	})
}

func (r *postgresAdminRepository) UpsertScoringTier(ctx context.Context, courseID uuid.UUID, tier string, minRatio string, label string, sortOrder int16) (db.ScoringTier, error) {
	return r.queries.UpsertScoringTier(ctx, db.UpsertScoringTierParams{
		CourseID:  courseID,
		Tier:      tier,
		MinRatio:  minRatio,
		Label:     label,
		SortOrder: sortOrder,
	})
}

func (r *postgresAdminRepository) UpdateCourseTemplate(ctx context.Context, courseID uuid.UUID, template string) error {
	return r.queries.UpdateCoursePromptTemplate(ctx, db.UpdateCoursePromptTemplateParams{
		ID:               courseID,
		AiPromptTemplate: template,
	})
}
