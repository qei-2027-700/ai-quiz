package usecase

import (
	"context"

	db "github.com/km/ai-quiz/internal/db/gen"
)

type ProfileUsecase struct {
	queries *db.Queries
	auth    *AuthUsecase
}

func NewProfileUsecase(queries *db.Queries, auth *AuthUsecase) *ProfileUsecase {
	return &ProfileUsecase{queries: queries, auth: auth}
}

type ProfileResult struct {
	DisplayName string
	Email       string
	CreatedAt   string
}

type AttemptHistoryEntry struct {
	CourseName   string
	CorrectCount int32
	TotalCount   int32
	Tier         string
	CreatedAt    string
}

func (u *ProfileUsecase) GetMyProfile(ctx context.Context, tokenStr string) (*ProfileResult, error) {
	me, err := u.auth.ParseAccessToken(ctx, tokenStr)
	if err != nil {
		return nil, err
	}
	user, err := u.queries.GetUserByID(ctx, me.UserID)
	if err != nil {
		return nil, err
	}
	return &ProfileResult{
		DisplayName: user.DisplayName,
		Email:       user.Email,
		CreatedAt:   user.CreatedAt.Format("2006-01-02"),
	}, nil
}

func (u *ProfileUsecase) ListMyAttempts(ctx context.Context, tokenStr string, limit int32) ([]AttemptHistoryEntry, error) {
	me, err := u.auth.ParseAccessToken(ctx, tokenStr)
	if err != nil {
		return nil, err
	}
	user, err := u.queries.GetUserByID(ctx, me.UserID)
	if err != nil {
		return nil, err
	}

	if limit <= 0 || limit > 50 {
		limit = 20
	}

	rows, err := u.queries.ListQuizResultsByUsername(ctx, db.ListQuizResultsByUsernameParams{
		Username: user.DisplayName,
		Limit:    limit,
	})
	if err != nil {
		return nil, err
	}

	entries := make([]AttemptHistoryEntry, 0, len(rows))
	for _, r := range rows {
		entries = append(entries, AttemptHistoryEntry{
			CourseName:   r.CourseName,
			CorrectCount: r.CorrectCount,
			TotalCount:   r.TotalCount,
			Tier:         r.Tier,
			CreatedAt:    r.CreatedAt.Format("2006-01-02 15:04"),
		})
	}
	return entries, nil
}
