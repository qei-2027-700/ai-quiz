package usecase

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"os"
	"strconv"
	"strings"

	"github.com/google/uuid"
	quizv2 "github.com/km/ai-quiz/gen/quiz/v2"
	"github.com/km/ai-quiz/internal/repository"
)

type AdminUsecase interface {
	ImportQuestionsCsv(ctx context.Context, csvBytes []byte, dryRun bool) (*quizv2.ImportQuestionsCsvResponse, error)
	CreateGenre(ctx context.Context, courseID, name, label string, sortOrder int32) (*quizv2.CreateGenreResponse, error)
	UpsertScoringTiers(ctx context.Context, courseID string, tiers []*quizv2.ScoringTier) (*quizv2.UpsertScoringTiersResponse, error)
	UpdateCourseTemplate(ctx context.Context, courseID, template string) (*quizv2.UpdateCourseTemplateResponse, error)
}

type adminUsecase struct {
	sqlDB *sql.DB
	repo  repository.AdminRepository
}

func NewAdminUsecase(sqlDB *sql.DB, repo repository.AdminRepository) AdminUsecase {
	return &adminUsecase{sqlDB: sqlDB, repo: repo}
}

type csvRow struct {
	courseID     uuid.UUID
	questionText string
	difficulty   int16
	genre        string
	choices      [4]string
	correct      int // 1..4
	explanation  string
}

var requiredHeader = []string{
	"course_id",
	"prompt",
	"difficulty",
	"genre",
	"choice_1",
	"choice_2",
	"choice_3",
	"choice_4",
	"correct_choice",
	"explanation",
}

func (u *adminUsecase) ImportQuestionsCsv(ctx context.Context, csvBytes []byte, dryRun bool) (*quizv2.ImportQuestionsCsvResponse, error) {
	resp := &quizv2.ImportQuestionsCsvResponse{
		CreatedQuestions: 0,
		Errors:           []*quizv2.CsvRowError{},
	}

	parsed, parseErrors := parseQuestionsCsv(csvBytes)
	resp.Errors = append(resp.Errors, parseErrors...)
	if len(resp.Errors) > 0 {
		return resp, nil
	}

	if dryRun {
		resp.CreatedQuestions = int32(len(parsed))
		return resp, nil
	}

	adminRepo := u.repo
	tx, err := u.sqlDB.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer func() {
		_ = tx.Rollback()
	}()
	adminRepo = adminRepo.WithTx(tx)

	for i, r := range parsed {
		if ok, err := adminRepo.CourseExists(ctx, r.courseID); err != nil {
			return nil, fmt.Errorf("course exists: %w", err)
		} else if !ok {
			resp.Errors = append(resp.Errors, &quizv2.CsvRowError{
				RowNumber: int32(i + 2),
				Field:     "course_id",
				Message:   "course_id does not exist",
			})
			continue
		}

		questionID := uuid.New()
		if err := adminRepo.InsertQuestionWithID(ctx, questionID, r.courseID, r.questionText, r.difficulty, r.genre); err != nil {
			return nil, fmt.Errorf("insert question: %w", err)
		}

		for c := 0; c < 4; c++ {
			choiceID := uuid.New()
			isCorrect := (c + 1) == r.correct
			if err := adminRepo.InsertChoiceWithID(ctx, choiceID, questionID, r.choices[c], isCorrect, int16(c+1)); err != nil {
				return nil, fmt.Errorf("insert choice: %w", err)
			}
		}

		if strings.TrimSpace(r.explanation) != "" {
			expID := uuid.New()
			if err := adminRepo.InsertExplanationWithID(ctx, expID, questionID, r.explanation, sql.NullString{}); err != nil {
				return nil, fmt.Errorf("insert explanation: %w", err)
			}
		}

		resp.CreatedQuestions++
	}

	if len(resp.Errors) > 0 {
		return resp, nil
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}

	return resp, nil
}

func parseQuestionsCsv(csvBytes []byte) ([]csvRow, []*quizv2.CsvRowError) {
	errorsOut := make([]*quizv2.CsvRowError, 0)
	if len(bytes.TrimSpace(csvBytes)) == 0 {
		return nil, []*quizv2.CsvRowError{
			{RowNumber: 1, Field: "csv", Message: "csv is empty"},
		}
	}

	reader := csv.NewReader(bytes.NewReader(stripUTF8BOM(csvBytes)))
	reader.FieldsPerRecord = -1

	header, err := reader.Read()
	if err != nil {
		return nil, []*quizv2.CsvRowError{
			{RowNumber: 1, Field: "csv", Message: "failed to read header"},
		}
	}
	headerIndex := make(map[string]int, len(header))
	for i, h := range header {
		headerIndex[strings.TrimSpace(strings.ToLower(h))] = i
	}

	missing := make([]string, 0)
	for _, h := range requiredHeader {
		if _, ok := headerIndex[h]; !ok {
			missing = append(missing, h)
		}
	}
	if len(missing) > 0 {
		errorsOut = append(errorsOut, &quizv2.CsvRowError{
			RowNumber: 1,
			Field:     "header",
			Message:   "missing required columns: " + strings.Join(missing, ", "),
		})
		return nil, errorsOut
	}

	rows := make([]csvRow, 0)
	rowNumber := 1
	for {
		rowNumber++
		record, err := reader.Read()
		if err == nil {
			if isAllEmpty(record) {
				continue
			}

			rowErrors := make([]*quizv2.CsvRowError, 0)

			get := func(col string) string {
				i, ok := headerIndex[col]
				if !ok || i >= len(record) {
					return ""
				}
				return strings.TrimSpace(record[i])
			}

			// question_id is reserved for future update mode.
			if qid := get("question_id"); qid != "" {
				rowErrors = append(rowErrors, &quizv2.CsvRowError{
					RowNumber: int32(rowNumber),
					Field:     "question_id",
					Message:   "question_id is not supported yet (add-only MVP)",
				})
			}

			courseIDStr := get("course_id")
			courseID, parseErr := uuid.Parse(courseIDStr)
			if parseErr != nil {
				rowErrors = append(rowErrors, &quizv2.CsvRowError{
					RowNumber: int32(rowNumber),
					Field:     "course_id",
					Message:   "invalid UUID",
				})
			}

			prompt := get("prompt")
			if prompt == "" {
				rowErrors = append(rowErrors, &quizv2.CsvRowError{
					RowNumber: int32(rowNumber),
					Field:     "prompt",
					Message:   "prompt is required",
				})
			}

			diffStr := get("difficulty")
			diffN, diffErr := strconv.Atoi(diffStr)
			if diffErr != nil || diffN < 1 || diffN > 3 {
				rowErrors = append(rowErrors, &quizv2.CsvRowError{
					RowNumber: int32(rowNumber),
					Field:     "difficulty",
					Message:   "difficulty must be 1..3",
				})
			}

			genre := get("genre")
			if genre == "" {
				rowErrors = append(rowErrors, &quizv2.CsvRowError{
					RowNumber: int32(rowNumber),
					Field:     "genre",
					Message:   "genre is required",
				})
			}

			choices := [4]string{
				get("choice_1"),
				get("choice_2"),
				get("choice_3"),
				get("choice_4"),
			}
			for i, c := range choices {
				if c == "" {
					rowErrors = append(rowErrors, &quizv2.CsvRowError{
						RowNumber: int32(rowNumber),
						Field:     fmt.Sprintf("choice_%d", i+1),
						Message:   "choice text is required",
					})
				}
			}

			correctStr := get("correct_choice")
			correctN, correctErr := strconv.Atoi(correctStr)
			if correctErr != nil || correctN < 1 || correctN > 4 {
				rowErrors = append(rowErrors, &quizv2.CsvRowError{
					RowNumber: int32(rowNumber),
					Field:     "correct_choice",
					Message:   "correct_choice must be 1..4",
				})
			}

			if len(rowErrors) > 0 {
				errorsOut = append(errorsOut, rowErrors...)
				continue
			}

			rows = append(rows, csvRow{
				courseID:     courseID,
				questionText: prompt,
				difficulty:   int16(diffN),
				genre:        genre,
				choices:      choices,
				correct:      correctN,
				explanation:  get("explanation"),
			})
			continue
		}

		if errors.Is(err, io.EOF) {
			break
		}

		errorsOut = append(errorsOut, &quizv2.CsvRowError{
			RowNumber: int32(rowNumber),
			Field:     "csv",
			Message:   "failed to read row",
		})
		break
	}

	// optional hard limit to prevent huge imports by mistake (env override)
	if limit := os.Getenv("ADMIN_IMPORT_MAX_ROWS"); limit != "" {
		if n, err := strconv.Atoi(limit); err == nil && n > 0 && len(rows) > n {
			errorsOut = append(errorsOut, &quizv2.CsvRowError{
				RowNumber: 1,
				Field:     "csv",
				Message:   fmt.Sprintf("too many rows (max=%d)", n),
			})
			return nil, errorsOut
		}
	}

	if len(errorsOut) > 0 {
		return nil, errorsOut
	}
	return rows, nil
}

func stripUTF8BOM(b []byte) []byte {
	utf8BOM := []byte{0xEF, 0xBB, 0xBF}
	return bytes.TrimPrefix(b, utf8BOM)
}

func isAllEmpty(record []string) bool {
	for _, s := range record {
		if strings.TrimSpace(s) != "" {
			return false
		}
	}
	return true
}

func (u *adminUsecase) CreateGenre(ctx context.Context, courseID, name, label string, sortOrder int32) (*quizv2.CreateGenreResponse, error) {
	cID, err := uuid.Parse(courseID)
	if err != nil {
		return nil, fmt.Errorf("invalid course_id %q: %w", courseID, err)
	}
	genre, err := u.repo.CreateGenre(ctx, cID, name, label, int16(sortOrder))
	if err != nil {
		return nil, fmt.Errorf("create genre: %w", err)
	}
	return &quizv2.CreateGenreResponse{
		Genre: &quizv2.Genre{
			Id:        genre.ID.String(),
			CourseId:  genre.CourseID.String(),
			Name:      genre.Name,
			Label:     genre.Label,
			SortOrder: int32(genre.SortOrder),
		},
	}, nil
}

func (u *adminUsecase) UpsertScoringTiers(ctx context.Context, courseID string, tiers []*quizv2.ScoringTier) (*quizv2.UpsertScoringTiersResponse, error) {
	cID, err := uuid.Parse(courseID)
	if err != nil {
		return nil, fmt.Errorf("invalid course_id %q: %w", courseID, err)
	}
	var upserted int32
	for _, t := range tiers {
		minRatioStr := strconv.FormatFloat(t.MinRatio, 'f', 3, 64)
		if _, err := u.repo.UpsertScoringTier(ctx, cID, t.Tier, minRatioStr, t.Label, int16(t.SortOrder)); err != nil {
			return nil, fmt.Errorf("upsert scoring tier %q: %w", t.Tier, err)
		}
		upserted++
	}
	return &quizv2.UpsertScoringTiersResponse{Upserted: upserted}, nil
}

func (u *adminUsecase) UpdateCourseTemplate(ctx context.Context, courseID, template string) (*quizv2.UpdateCourseTemplateResponse, error) {
	cID, err := uuid.Parse(courseID)
	if err != nil {
		return nil, fmt.Errorf("invalid course_id %q: %w", courseID, err)
	}
	if err := u.repo.UpdateCourseTemplate(ctx, cID, template); err != nil {
		return nil, fmt.Errorf("update course template: %w", err)
	}
	return &quizv2.UpdateCourseTemplateResponse{}, nil
}
