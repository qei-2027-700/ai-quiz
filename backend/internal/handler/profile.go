package handler

import (
	"context"
	"errors"
	"strings"

	"connectrpc.com/connect"
	"go.uber.org/zap"

	quizv2 "github.com/km/ai-quiz/gen/quiz/v2"
)

func extractBearerToken(authHeader string) string {
	if token, ok := strings.CutPrefix(authHeader, "Bearer "); ok {
		return token
	}
	return ""
}

func (h *QuizV2Handler) GetMyProfile(
	ctx context.Context,
	req *connect.Request[quizv2.GetMyProfileRequest],
) (*connect.Response[quizv2.GetMyProfileResponse], error) {
	token := extractBearerToken(req.Header().Get("Authorization"))
	if token == "" {
		return nil, connect.NewError(connect.CodeUnauthenticated, errors.New("missing token"))
	}
	result, err := h.profileUc.GetMyProfile(ctx, token)
	if err != nil {
		h.logger.Error("GetMyProfile failed", zap.Error(err))
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}
	return connect.NewResponse(&quizv2.GetMyProfileResponse{
		Profile: &quizv2.MyProfile{
			DisplayName: result.DisplayName,
			Email:       result.Email,
			CreatedAt:   result.CreatedAt,
		},
	}), nil
}

func (h *QuizV2Handler) ListMyAttempts(
	ctx context.Context,
	req *connect.Request[quizv2.ListMyAttemptsRequest],
) (*connect.Response[quizv2.ListMyAttemptsResponse], error) {
	token := extractBearerToken(req.Header().Get("Authorization"))
	if token == "" {
		return nil, connect.NewError(connect.CodeUnauthenticated, errors.New("missing token"))
	}
	entries, err := h.profileUc.ListMyAttempts(ctx, token, req.Msg.Limit)
	if err != nil {
		h.logger.Error("ListMyAttempts failed", zap.Error(err))
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}
	pbEntries := make([]*quizv2.AttemptEntry, 0, len(entries))
	for _, e := range entries {
		pbEntries = append(pbEntries, &quizv2.AttemptEntry{
			CourseName:   e.CourseName,
			CorrectCount: e.CorrectCount,
			TotalCount:   e.TotalCount,
			Tier:         e.Tier,
			CreatedAt:    e.CreatedAt,
		})
	}
	return connect.NewResponse(&quizv2.ListMyAttemptsResponse{
		Attempts: pbEntries,
	}), nil
}

