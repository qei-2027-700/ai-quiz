package usecase

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/google/uuid"
	quizv2 "github.com/km/ai-quiz/gen/quiz/v2"
	"github.com/km/ai-quiz/internal/repository"
)

type QuizV2Usecase interface {
	ListCourses(ctx context.Context) (*quizv2.ListCoursesResponse, error)
	StartAttempt(ctx context.Context, courseID string, username string) (*quizv2.StartAttemptResponse, error)
	ListQuestions(ctx context.Context, attemptID string, genre string, difficulty int32) (*quizv2.ListQuestionsResponse, error)
	SubmitAnswers(ctx context.Context, attemptID string, answers []*quizv2.UserAnswer) (*quizv2.SubmitAnswersResponse, error)
	GetAttemptInsights(ctx context.Context, attemptID string) (*quizv2.GetAttemptInsightsResponse, error)
	ListRankings(ctx context.Context, limit int32) (*quizv2.ListRankingsResponse, error)
}

type quizV2Usecase struct {
	repo repository.QuizRepository
}

func NewQuizV2Usecase(repo repository.QuizRepository) QuizV2Usecase {
	return &quizV2Usecase{repo: repo}
}

const (
	insightsStatusPending = "PENDING"
	insightsStatusReady   = "READY"
	insightsStatusFailed  = "FAILED"
)

func (u *quizV2Usecase) ListCourses(ctx context.Context) (*quizv2.ListCoursesResponse, error) {
	rows, err := u.repo.ListCourses(ctx)
	if err != nil {
		return nil, fmt.Errorf("list courses: %w", err)
	}

	courses := make([]*quizv2.Course, len(rows))
	for i, r := range rows {
		courses[i] = &quizv2.Course{
			Id:          r.ID.String(),
			Name:        r.Name,
			Description: r.Description,
		}
	}

	return &quizv2.ListCoursesResponse{Courses: courses}, nil
}

func (u *quizV2Usecase) StartAttempt(ctx context.Context, courseID string, username string) (*quizv2.StartAttemptResponse, error) {
	cID, err := uuid.Parse(courseID)
	if err != nil {
		return nil, fmt.Errorf("invalid course_id %q: %w", courseID, err)
	}

	if username == "" {
		username = "Anonymous"
	}

	attemptID, err := u.repo.CreateAttempt(ctx, cID, username)
	if err != nil {
		return nil, fmt.Errorf("create attempt: %w", err)
	}

	if err := u.repo.UpsertAttemptInsights(ctx, attemptID, insightsStatusPending, "", ""); err != nil {
		return nil, fmt.Errorf("init attempt insights: %w", err)
	}

	return &quizv2.StartAttemptResponse{AttemptId: attemptID.String()}, nil
}

func (u *quizV2Usecase) ListQuestions(ctx context.Context, attemptID string, genre string, difficulty int32) (*quizv2.ListQuestionsResponse, error) {
	aID, err := uuid.Parse(attemptID)
	if err != nil {
		return nil, fmt.Errorf("invalid attempt_id %q: %w", attemptID, err)
	}

	attempt, err := u.repo.GetAttempt(ctx, aID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return &quizv2.ListQuestionsResponse{Questions: []*quizv2.Question{}}, nil
		}
		return nil, fmt.Errorf("get attempt: %w", err)
	}

	rows, err := u.repo.ListQuestionsByTopic(ctx, attempt.CourseID)
	if err != nil {
		return nil, fmt.Errorf("list questions by course: %w", err)
	}

	filtered := rows[:0]
	for _, r := range rows {
		if genre != "" && r.Genre != genre {
			continue
		}
		if difficulty != 0 && r.Difficulty != int16(difficulty) {
			continue
		}
		filtered = append(filtered, r)
	}
	if len(filtered) > 10 {
		filtered = filtered[:10]
	}

	if len(filtered) == 0 {
		return &quizv2.ListQuestionsResponse{Questions: []*quizv2.Question{}}, nil
	}

	questionIDs := make([]uuid.UUID, len(filtered))
	for i, r := range filtered {
		questionIDs[i] = r.ID
	}

	choices, err := u.repo.ListChoicesByQuestionIDs(ctx, questionIDs)
	if err != nil {
		return nil, fmt.Errorf("list choices: %w", err)
	}

	choicesByQuestion := make(map[uuid.UUID][]*quizv2.Choice)
	correctChoiceIDByQuestion := make(map[uuid.UUID]string)
	for _, c := range choices {
		choicesByQuestion[c.QuestionID] = append(choicesByQuestion[c.QuestionID], &quizv2.Choice{
			Id:        c.ID.String(),
			Text:      c.Text,
			SortOrder: int32(c.SortOrder),
		})
		if c.IsCorrect {
			correctChoiceIDByQuestion[c.QuestionID] = c.ID.String()
		}
	}

	questions := make([]*quizv2.Question, len(filtered))
	for i, r := range filtered {
		questions[i] = &quizv2.Question{
			Id:     r.ID.String(),
			Prompt: r.Text,
			Attributes: map[string]string{
				"genre":      r.Genre,
				"difficulty": fmt.Sprintf("%d", r.Difficulty),
			},
			Body: &quizv2.Question_MultipleChoice{
				MultipleChoice: &quizv2.MultipleChoiceBody{
					Choices:         choicesByQuestion[r.ID],
					CorrectChoiceId: correctChoiceIDByQuestion[r.ID],
				},
			},
		}
	}

	return &quizv2.ListQuestionsResponse{Questions: questions}, nil
}

func (u *quizV2Usecase) SubmitAnswers(ctx context.Context, attemptID string, answers []*quizv2.UserAnswer) (*quizv2.SubmitAnswersResponse, error) {
	aID, err := uuid.Parse(attemptID)
	if err != nil {
		return nil, fmt.Errorf("invalid attempt_id %q: %w", attemptID, err)
	}
	if len(answers) == 0 {
		return &quizv2.SubmitAnswersResponse{
			Result: &quizv2.AttemptResult{
				CorrectCount:    0,
				TotalCount:      0,
				Tier:            "C",
				QuestionResults: []*quizv2.QuestionResult{},
			},
			InsightsStatus: quizv2.InsightsStatus_INSIGHTS_STATUS_READY,
		}, nil
	}

	attempt, err := u.repo.GetAttempt(ctx, aID)
	if err != nil {
		return nil, fmt.Errorf("get attempt: %w", err)
	}

	questionIDs := make([]uuid.UUID, 0, len(answers))
	for _, a := range answers {
		qID, err := uuid.Parse(a.QuestionId)
		if err != nil {
			return nil, fmt.Errorf("invalid question_id %q: %w", a.QuestionId, err)
		}
		questionIDs = append(questionIDs, qID)
	}

	choices, err := u.repo.ListChoicesByQuestionIDs(ctx, questionIDs)
	if err != nil {
		return nil, fmt.Errorf("list choices: %w", err)
	}
	explanations, err := u.repo.GetExplanationsByQuestionIDs(ctx, questionIDs)
	if err != nil {
		return nil, fmt.Errorf("get explanations: %w", err)
	}

	correctChoiceByQuestion := make(map[uuid.UUID]uuid.UUID)
	for _, c := range choices {
		if c.IsCorrect {
			correctChoiceByQuestion[c.QuestionID] = c.ID
		}
	}

	explanationByQuestion := make(map[uuid.UUID]string)
	for _, e := range explanations {
		explanationByQuestion[e.QuestionID] = e.Text
	}

	var correctCount int32
	results := make([]*quizv2.QuestionResult, 0, len(answers))

	for _, a := range answers {
		qID, _ := uuid.Parse(a.QuestionId)
		correctChoice := correctChoiceByQuestion[qID]

		single := a.GetSingleChoice()
		if single == nil {
			return nil, fmt.Errorf("unsupported answer type for question_id=%s", a.QuestionId)
		}

		cID, err := uuid.Parse(single.ChoiceId)
		if err != nil {
			return nil, fmt.Errorf("invalid choice_id %q: %w", single.ChoiceId, err)
		}

		isCorrect := correctChoice == cID
		if isCorrect {
			correctCount++
		}

		results = append(results, &quizv2.QuestionResult{
			QuestionId: a.QuestionId,
			IsCorrect:  isCorrect,
			Correct: &quizv2.QuestionResult_SingleChoice{
				SingleChoice: &quizv2.SingleChoiceCorrect{ChoiceId: correctChoice.String()},
			},
			Explanation: explanationByQuestion[qID],
		})
	}

	total := int32(len(answers))
	ratio := float64(correctCount) / float64(total)
	tier := computeTier(ratio)

	_ = u.repo.InsertQuizResultV2(ctx, aID, attempt.Username, correctCount, total, tier)

	aiFeedback := generateMockAIFeedback(correctCount, total, tier)
	insightsStatus := quizv2.InsightsStatus_INSIGHTS_STATUS_READY
	if err := u.repo.UpsertAttemptInsights(ctx, aID, insightsStatusReady, aiFeedback, ""); err != nil {
		insightsStatus = quizv2.InsightsStatus_INSIGHTS_STATUS_FAILED
		_ = u.repo.UpsertAttemptInsights(ctx, aID, insightsStatusFailed, "", err.Error())
	}

	return &quizv2.SubmitAnswersResponse{
		Result: &quizv2.AttemptResult{
			CorrectCount:    correctCount,
			TotalCount:      total,
			Tier:            tier,
			QuestionResults: results,
		},
		InsightsStatus: insightsStatus,
	}, nil
}

func (u *quizV2Usecase) GetAttemptInsights(ctx context.Context, attemptID string) (*quizv2.GetAttemptInsightsResponse, error) {
	aID, err := uuid.Parse(attemptID)
	if err != nil {
		return nil, fmt.Errorf("invalid attempt_id %q: %w", attemptID, err)
	}

	row, err := u.repo.GetAttemptInsights(ctx, aID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return &quizv2.GetAttemptInsightsResponse{Status: quizv2.InsightsStatus_INSIGHTS_STATUS_PENDING}, nil
		}
		return nil, fmt.Errorf("get attempt insights: %w", err)
	}

	return &quizv2.GetAttemptInsightsResponse{
		Status:       mapInsightsStatus(row.Status),
		AiFeedback:   row.AiFeedback,
		Citations:    []*quizv2.Citation{},
		ErrorMessage: row.ErrorMessage,
	}, nil
}

func mapInsightsStatus(s string) quizv2.InsightsStatus {
	switch s {
	case insightsStatusPending:
		return quizv2.InsightsStatus_INSIGHTS_STATUS_PENDING
	case insightsStatusReady:
		return quizv2.InsightsStatus_INSIGHTS_STATUS_READY
	case insightsStatusFailed:
		return quizv2.InsightsStatus_INSIGHTS_STATUS_FAILED
	default:
		return quizv2.InsightsStatus_INSIGHTS_STATUS_UNSPECIFIED
	}
}

func (u *quizV2Usecase) ListRankings(ctx context.Context, limit int32) (*quizv2.ListRankingsResponse, error) {
	if limit <= 0 {
		limit = 10
	}

	rows, err := u.repo.ListRankings(ctx, limit)
	if err != nil {
		return nil, fmt.Errorf("list rankings: %w", err)
	}

	entries := make([]*quizv2.RankingEntry, len(rows))
	for i, r := range rows {
		entries[i] = &quizv2.RankingEntry{
			Rank:         r.Rank,
			Username:     r.Username,
			CorrectCount: r.CorrectCount,
			TotalCount:   r.TotalCount,
			Tier:         r.Tier,
			CreatedAt:    r.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
	}

	return &quizv2.ListRankingsResponse{Entries: entries}, nil
}
