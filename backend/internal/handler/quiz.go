package handler

import (
	"context"

	"connectrpc.com/connect"
	"go.uber.org/zap"

	quizv1 "github.com/km/ai-quiz/gen/quiz/v1"
	"github.com/km/ai-quiz/internal/usecase"
)

// QuizHandler implements the Connect-RPC QuizServiceHandler interface.
type QuizHandler struct {
	uc     usecase.QuizUsecase
	logger *zap.Logger
}

// NewQuizHandler creates a new QuizHandler.
func NewQuizHandler(uc usecase.QuizUsecase, logger *zap.Logger) *QuizHandler {
	return &QuizHandler{uc: uc, logger: logger}
}

// ListQuestions returns the list of quiz questions for the default topic.
func (h *QuizHandler) ListQuestions(
	ctx context.Context,
	req *connect.Request[quizv1.ListQuestionsRequest],
) (*connect.Response[quizv1.ListQuestionsResponse], error) {
	h.logger.Info("ListQuestions called",
		zap.String("genre", req.Msg.Genre),
		zap.Int32("difficulty", req.Msg.Difficulty),
	)

	questions, err := h.uc.ListQuestions(ctx, req.Msg.Genre, req.Msg.Difficulty)
	if err != nil {
		h.logger.Error("ListQuestions failed", zap.Error(err))
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&quizv1.ListQuestionsResponse{
		Questions: questions,
	}), nil
}

// SubmitAnswers evaluates the user's answers and returns score, tier, and explanations.
func (h *QuizHandler) SubmitAnswers(
	ctx context.Context,
	req *connect.Request[quizv1.SubmitAnswersRequest],
) (*connect.Response[quizv1.SubmitAnswersResponse], error) {
	h.logger.Info("SubmitAnswers called",
		zap.Int("answers", len(req.Msg.Answers)),
		zap.String("username", req.Msg.Username),
	)

	resp, err := h.uc.SubmitAnswers(ctx, req.Msg.Username, req.Msg.Answers)
	if err != nil {
		h.logger.Error("SubmitAnswers failed", zap.Error(err))
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(resp), nil
}

// ListRankings returns the top N quiz result rankings.
func (h *QuizHandler) ListRankings(
	ctx context.Context,
	req *connect.Request[quizv1.ListRankingsRequest],
) (*connect.Response[quizv1.ListRankingsResponse], error) {
	h.logger.Info("ListRankings called", zap.Int32("limit", req.Msg.Limit))

	resp, err := h.uc.ListRankings(ctx, req.Msg.Limit)
	if err != nil {
		h.logger.Error("ListRankings failed", zap.Error(err))
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(resp), nil
}
