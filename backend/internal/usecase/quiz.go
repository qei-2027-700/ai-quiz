package usecase

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	quizv1 "github.com/km/ai-quiz/gen/quiz/v1"
	"github.com/km/ai-quiz/internal/repository"
)

// QuizUsecase defines the business logic interface for quiz operations.
type QuizUsecase interface {
	ListQuestions(ctx context.Context, genre string, difficulty int32) ([]*quizv1.Question, error)
	SubmitAnswers(ctx context.Context, username string, answers []*quizv1.UserAnswer) (*quizv1.SubmitAnswersResponse, error)
	ListRankings(ctx context.Context, limit int32) (*quizv1.ListRankingsResponse, error)
}

type quizUsecase struct {
	repo repository.QuizRepository
}

// NewQuizUsecase creates a new QuizUsecase backed by the given repository.
func NewQuizUsecase(repo repository.QuizRepository) QuizUsecase {
	return &quizUsecase{repo: repo}
}

func (u *quizUsecase) ListQuestions(ctx context.Context, genre string, difficulty int32) ([]*quizv1.Question, error) {
	topicID, err := u.repo.GetFirstTopicID(ctx)
	if err != nil {
		return nil, fmt.Errorf("get first topic id: %w", err)
	}

	rows, err := u.repo.ListQuestionsByTopic(ctx, topicID)
	if err != nil {
		return nil, fmt.Errorf("list questions by topic: %w", err)
	}

	// Go 側でフィルタリング
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

	// フィルタ後 10 問以上あれば先頭 10 件に絞る
	if len(filtered) > 10 {
		filtered = filtered[:10]
	}

	if len(filtered) == 0 {
		return []*quizv1.Question{}, nil
	}

	questionIDs := make([]uuid.UUID, len(filtered))
	for i, r := range filtered {
		questionIDs[i] = r.ID
	}

	choices, err := u.repo.ListChoicesByQuestionIDs(ctx, questionIDs)
	if err != nil {
		return nil, fmt.Errorf("list choices: %w", err)
	}

	// Group choices by question ID.
	choicesByQuestion := make(map[uuid.UUID][]*quizv1.Choice)
	for _, c := range choices {
		choicesByQuestion[c.QuestionID] = append(choicesByQuestion[c.QuestionID], &quizv1.Choice{
			Id:   c.ID.String(),
			Text: c.Text,
		})
	}

	questions := make([]*quizv1.Question, len(filtered))
	for i, r := range filtered {
		questions[i] = &quizv1.Question{
			Id:      r.ID.String(),
			Text:    r.Text,
			Choices: choicesByQuestion[r.ID],
		}
	}

	return questions, nil
}

func (u *quizUsecase) SubmitAnswers(ctx context.Context, username string, answers []*quizv1.UserAnswer) (*quizv1.SubmitAnswersResponse, error) {
	if len(answers) == 0 {
		return &quizv1.SubmitAnswersResponse{
			CorrectCount: 0,
			TotalCount:   0,
			Tier:         "C",
			AiFeedback:   generateMockAIFeedback(0, 0, "C"),
		}, nil
	}

	// Collect question IDs from answers.
	questionIDs := make([]uuid.UUID, 0, len(answers))
	for _, a := range answers {
		qID, err := uuid.Parse(a.QuestionId)
		if err != nil {
			return nil, fmt.Errorf("invalid question_id %q: %w", a.QuestionId, err)
		}
		questionIDs = append(questionIDs, qID)
	}

	// Fetch choices and explanations in parallel via sequential calls (simple).
	choices, err := u.repo.ListChoicesByQuestionIDs(ctx, questionIDs)
	if err != nil {
		return nil, fmt.Errorf("list choices: %w", err)
	}

	explanations, err := u.repo.GetExplanationsByQuestionIDs(ctx, questionIDs)
	if err != nil {
		return nil, fmt.Errorf("get explanations: %w", err)
	}

	// Build lookup: questionID -> correct choiceID.
	correctChoiceByQuestion := make(map[uuid.UUID]uuid.UUID)
	for _, c := range choices {
		if c.IsCorrect {
			correctChoiceByQuestion[c.QuestionID] = c.ID
		}
	}

	// Build lookup: questionID -> explanation text.
	explanationByQuestion := make(map[uuid.UUID]string)
	for _, e := range explanations {
		explanationByQuestion[e.QuestionID] = e.Text
	}

	var correctCount int32
	results := make([]*quizv1.AnswerResult, 0, len(answers))

	for _, a := range answers {
		qID, _ := uuid.Parse(a.QuestionId)
		cID, _ := uuid.Parse(a.ChoiceId)

		correctChoice := correctChoiceByQuestion[qID]
		isCorrect := correctChoice == cID
		if isCorrect {
			correctCount++
		}

		results = append(results, &quizv1.AnswerResult{
			QuestionId:      a.QuestionId,
			IsCorrect:       isCorrect,
			CorrectChoiceId: correctChoice.String(),
			Explanation:     explanationByQuestion[qID],
		})
	}

	total := int32(len(answers))
	ratio := float64(correctCount) / float64(total)
	tier := computeTier(ratio)

	// username が空の場合はデフォルト値を使用
	if username == "" {
		username = "Anonymous"
	}

	// 結果をDBに保存（失敗してもエラーは返さない）
	_ = u.repo.InsertQuizResult(ctx, username, correctCount, total, tier)

	return &quizv1.SubmitAnswersResponse{
		CorrectCount: correctCount,
		TotalCount:   total,
		Tier:         tier,
		Results:      results,
		AiFeedback:   generateMockAIFeedback(correctCount, total, tier),
	}, nil
}

func (u *quizUsecase) ListRankings(ctx context.Context, limit int32) (*quizv1.ListRankingsResponse, error) {
	if limit <= 0 {
		limit = 10
	}

	rows, err := u.repo.ListRankings(ctx, limit)
	if err != nil {
		return nil, fmt.Errorf("list rankings: %w", err)
	}

	entries := make([]*quizv1.RankingEntry, len(rows))
	for i, r := range rows {
		entries[i] = &quizv1.RankingEntry{
			Rank:         r.Rank,
			Username:     r.Username,
			CorrectCount: r.CorrectCount,
			TotalCount:   r.TotalCount,
			Tier:         r.Tier,
			CreatedAt:    r.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
	}

	return &quizv1.ListRankingsResponse{
		Entries: entries,
	}, nil
}

func computeTier(ratio float64) string {
	switch {
	case ratio >= 0.9:
		return "S"
	case ratio >= 0.7:
		return "A"
	case ratio >= 0.5:
		return "B"
	default:
		return "C"
	}
}

func generateMockAIFeedback(correctCount, totalCount int32, tier string) string {
	var accuracy float64
	if totalCount > 0 {
		accuracy = float64(correctCount) / float64(totalCount) * 100
	}

	header := fmt.Sprintf("正解数: %d / %d問（正答率: %.0f%%）\n\n", correctCount, totalCount, accuracy)

	switch tier {
	case "S":
		return header +
			"素晴らしい成績です。AI・LLMの高度な領域にも十分な理解があります。\n" +
			"さらなるステップアップとして、以下に挑戦してみましょう。\n\n" +
			"- RAGシステムの実装: ベクトルDBとRetrieverを組み合わせた検索拡張生成を自分で構築する\n" +
			"- マルチエージェント設計: 複数のAIエージェントが協調して問題を解くシステムを設計する\n" +
			"- pgvector活用: PostgreSQLのpgvector拡張を使い、埋め込みベクトル検索を実装する"
	case "A":
		return header +
			"好成績です。基本から応用まで幅広く理解できています。\n" +
			"以下のテーマをさらに深掘りすると理解が一段と深まります。\n\n" +
			"- Embeddingの仕組み: テキストをベクトル化する際のモデル選択と次元数の影響を学ぶ\n" +
			"- Function Calling: LLMに外部ツールを呼び出させるFunction Callingの設計パターンを学ぶ\n" +
			"- 日本語LLMの使い分け: 多言語モデルと日本語特化モデルの精度・コスト比較を調べる"
	case "B":
		return header +
			"基礎は押さえられています。あと一歩で応用領域に踏み込めます。\n" +
			"以下を復習して理解を固めましょう。\n\n" +
			"- Retrieverの仕組み: RAGにおける検索コンポーネントがどのようにドキュメントを取得するか復習する\n" +
			"- Tool Use: LLMが外部APIやデータベースを利用するTool Useの基本的な動作を確認する\n" +
			"- 日本語LLMの評価指標: JGLUEなど日本語LLMのベンチマーク評価方法を調べて整理する"
	default: // C
		return header +
			"まずは基礎からしっかり固めていきましょう。焦らず一歩ずつ進めば必ず理解できます。\n" +
			"以下の順番で学習を始めることをおすすめします。\n\n" +
			"- RAG・LLMの基本概念: 「LLMとは何か」「RAGはなぜ必要か」を図解記事や入門書で理解する\n" +
			"- ChatGPTのプロンプト設計: 実際にChatGPTを使い、プロンプトの書き方と出力の変化を体験する\n" +
			"- ハンズオンで動かす: LangChainやLlamaIndexの公式チュートリアルをそのまま動かして体感する"
	}
}
