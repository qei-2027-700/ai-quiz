package handler

import (
	"context"

	"connectrpc.com/connect"
	"go.uber.org/zap"

	quizv2 "github.com/km/ai-quiz/gen/quiz/v2"
	"github.com/km/ai-quiz/internal/usecase"
)

type AdminHandler struct {
	uc     usecase.AdminUsecase
	logger *zap.Logger
}

func NewAdminHandler(uc usecase.AdminUsecase, logger *zap.Logger) *AdminHandler {
	return &AdminHandler{uc: uc, logger: logger}
}

func (h *AdminHandler) ImportQuestionsCsv(
	ctx context.Context,
	req *connect.Request[quizv2.ImportQuestionsCsvRequest],
) (*connect.Response[quizv2.ImportQuestionsCsvResponse], error) {
	h.logger.Info("admin.ImportQuestionsCsv called", zap.Bool("dry_run", req.Msg.DryRun), zap.Int("bytes", len(req.Msg.Csv)))

	resp, err := h.uc.ImportQuestionsCsv(ctx, req.Msg.Csv, req.Msg.DryRun)
	if err != nil {
		h.logger.Error("admin.ImportQuestionsCsv failed", zap.Error(err))
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	return connect.NewResponse(resp), nil
}
