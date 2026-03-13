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

func (h *AdminHandler) CreateGenre(
	ctx context.Context,
	req *connect.Request[quizv2.CreateGenreRequest],
) (*connect.Response[quizv2.CreateGenreResponse], error) {
	h.logger.Info("admin.CreateGenre called",
		zap.String("course_id", req.Msg.CourseId),
		zap.String("name", req.Msg.Name),
	)

	resp, err := h.uc.CreateGenre(ctx, req.Msg.CourseId, req.Msg.Name, req.Msg.Label, req.Msg.SortOrder)
	if err != nil {
		h.logger.Error("admin.CreateGenre failed", zap.Error(err))
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	return connect.NewResponse(resp), nil
}

func (h *AdminHandler) UpsertScoringTiers(
	ctx context.Context,
	req *connect.Request[quizv2.UpsertScoringTiersRequest],
) (*connect.Response[quizv2.UpsertScoringTiersResponse], error) {
	h.logger.Info("admin.UpsertScoringTiers called",
		zap.String("course_id", req.Msg.CourseId),
		zap.Int("tiers", len(req.Msg.Tiers)),
	)

	resp, err := h.uc.UpsertScoringTiers(ctx, req.Msg.CourseId, req.Msg.Tiers)
	if err != nil {
		h.logger.Error("admin.UpsertScoringTiers failed", zap.Error(err))
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	return connect.NewResponse(resp), nil
}

func (h *AdminHandler) UpdateCourseTemplate(
	ctx context.Context,
	req *connect.Request[quizv2.UpdateCourseTemplateRequest],
) (*connect.Response[quizv2.UpdateCourseTemplateResponse], error) {
	h.logger.Info("admin.UpdateCourseTemplate called", zap.String("course_id", req.Msg.CourseId))

	resp, err := h.uc.UpdateCourseTemplate(ctx, req.Msg.CourseId, req.Msg.AiPromptTemplate)
	if err != nil {
		h.logger.Error("admin.UpdateCourseTemplate failed", zap.Error(err))
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	return connect.NewResponse(resp), nil
}
