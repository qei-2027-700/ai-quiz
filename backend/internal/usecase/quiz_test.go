package usecase

import (
	"context"
	"testing"

	"github.com/google/uuid"
	quizv1 "github.com/km/ai-quiz/gen/quiz/v1"
	db "github.com/km/ai-quiz/internal/db/gen"
	"github.com/km/ai-quiz/internal/repository"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// mockQuizRepository is a simple in-memory mock of repository.QuizRepository.
type mockQuizRepository struct {
	topicID      uuid.UUID
	questions    []db.ListQuestionsByTopicRow
	choices      []db.Choice
	explanations []db.GetExplanationsByQuestionIDsRow
}

var _ repository.QuizRepository = (*mockQuizRepository)(nil)

func (m *mockQuizRepository) GetFirstTopicID(_ context.Context) (uuid.UUID, error) {
	return m.topicID, nil
}

func (m *mockQuizRepository) ListQuestionsByTopic(_ context.Context, _ uuid.UUID) ([]db.ListQuestionsByTopicRow, error) {
	return m.questions, nil
}

func (m *mockQuizRepository) ListCourses(_ context.Context) ([]db.ListCoursesRow, error) {
	return nil, nil
}

func (m *mockQuizRepository) CreateAttempt(_ context.Context, _ uuid.UUID, _ string) (uuid.UUID, error) {
	return uuid.Nil, nil
}

func (m *mockQuizRepository) GetAttempt(_ context.Context, _ uuid.UUID) (db.Attempt, error) {
	return db.Attempt{}, nil
}

func (m *mockQuizRepository) ListChoicesByQuestionIDs(_ context.Context, _ []uuid.UUID) ([]db.Choice, error) {
	return m.choices, nil
}

func (m *mockQuizRepository) GetExplanationsByQuestionIDs(_ context.Context, _ []uuid.UUID) ([]db.GetExplanationsByQuestionIDsRow, error) {
	return m.explanations, nil
}

func (m *mockQuizRepository) InsertQuizResult(_ context.Context, _ string, _, _ int32, _ string) error {
	return nil
}

func (m *mockQuizRepository) InsertQuizResultV2(_ context.Context, _ uuid.UUID, _ string, _, _ int32, _ string) error {
	return nil
}

func (m *mockQuizRepository) UpsertAttemptInsights(_ context.Context, _ uuid.UUID, _ string, _ string, _ string) error {
	return nil
}

func (m *mockQuizRepository) GetAttemptInsights(_ context.Context, _ uuid.UUID) (db.AttemptInsight, error) {
	return db.AttemptInsight{}, nil
}

func (m *mockQuizRepository) ListRankings(_ context.Context, _ int32) ([]db.ListRankingsRow, error) {
	return nil, nil
}

func (m *mockQuizRepository) ListGenresByCourse(_ context.Context, _ uuid.UUID) ([]db.ListGenresByCourseRow, error) {
	return nil, nil
}

func (m *mockQuizRepository) ListScoringTiersByCourse(_ context.Context, _ uuid.UUID) ([]db.ScoringTier, error) {
	return nil, nil
}

func (m *mockQuizRepository) GetCourseByID(_ context.Context, _ uuid.UUID) (db.GetCourseByIDRow, error) {
	return db.GetCourseByIDRow{}, nil
}

func TestSubmitAnswers(t *testing.T) {
	topicID := uuid.New()

	q1ID := uuid.New()
	q2ID := uuid.New()

	c1CorrectID := uuid.New()
	c1WrongID := uuid.New()
	c2CorrectID := uuid.New()
	c2WrongID := uuid.New()

	baseRepo := &mockQuizRepository{
		topicID: topicID,
		questions: []db.ListQuestionsByTopicRow{
			{ID: q1ID, Text: "Q1", TopicID: topicID},
			{ID: q2ID, Text: "Q2", TopicID: topicID},
		},
		choices: []db.Choice{
			{ID: c1CorrectID, QuestionID: q1ID, Text: "correct answer 1", IsCorrect: true},
			{ID: c1WrongID, QuestionID: q1ID, Text: "wrong answer 1", IsCorrect: false},
			{ID: c2CorrectID, QuestionID: q2ID, Text: "correct answer 2", IsCorrect: true},
			{ID: c2WrongID, QuestionID: q2ID, Text: "wrong answer 2", IsCorrect: false},
		},
		explanations: []db.GetExplanationsByQuestionIDsRow{
			{QuestionID: q1ID, Text: "Explanation for Q1"},
			{QuestionID: q2ID, Text: "Explanation for Q2"},
		},
	}

	tests := []struct {
		name         string
		answers      []*quizv1.UserAnswer
		wantCorrect  int32
		wantTotal    int32
		wantTier     string
	}{
		{
			name: "all correct → tier S",
			answers: []*quizv1.UserAnswer{
				{QuestionId: q1ID.String(), ChoiceId: c1CorrectID.String()},
				{QuestionId: q2ID.String(), ChoiceId: c2CorrectID.String()},
			},
			wantCorrect: 2,
			wantTotal:   2,
			wantTier:    "S",
		},
		{
			name: "0 correct → tier C",
			answers: []*quizv1.UserAnswer{
				{QuestionId: q1ID.String(), ChoiceId: c1WrongID.String()},
				{QuestionId: q2ID.String(), ChoiceId: c2WrongID.String()},
			},
			wantCorrect: 0,
			wantTotal:   2,
			wantTier:    "C",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			uc := NewQuizUsecase(baseRepo)
			resp, err := uc.SubmitAnswers(context.Background(), "testuser", tc.answers)
			require.NoError(t, err)
			assert.Equal(t, tc.wantCorrect, resp.CorrectCount)
			assert.Equal(t, tc.wantTotal, resp.TotalCount)
			assert.Equal(t, tc.wantTier, resp.Tier)
			assert.NotEmpty(t, resp.AiFeedback)
			assert.Len(t, resp.Results, int(tc.wantTotal))
		})
	}
}
