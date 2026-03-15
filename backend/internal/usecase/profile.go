package usecase

import (
	"context"
	"time"

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
	return &ProfileResult{
		DisplayName: me.DisplayName,
		Email:       me.Email,
		CreatedAt:   me.CreatedAt.Format(time.RFC3339),
	}, nil
}

func (u *ProfileUsecase) ListMyAttempts(ctx context.Context, tokenStr string, limit int32) ([]AttemptHistoryEntry, error) {
	me, err := u.auth.ParseAccessToken(ctx, tokenStr)
	if err != nil {
		return nil, err
	}

	if limit <= 0 || limit > 50 {
		limit = 20
	}

	rows, err := u.queries.ListQuizResultsByUsername(ctx, db.ListQuizResultsByUsernameParams{
		Username: me.DisplayName,
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
			CreatedAt:    r.CreatedAt.Format(time.RFC3339),
		})
	}
	return entries, nil
}
