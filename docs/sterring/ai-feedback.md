# AI フィードバック実装計画

## 現状と目標

### 現状（モック実装）

```
SubmitAnswers
  └─→ generateFeedback()  ← テンプレート文字列の単純置換
  └─→ attempt_insights を READY で更新（即時）

GetAttemptInsights
  └─→ DB から取得して返すだけ（常に READY）
```

`ai_feedback` には「正解数・正答率・ティア」の静的テキストしか入っていない。
フロントのポーリング機構（最大 10 回 × 800ms）は完成済みで、PENDING → READY の非同期フローに対応している。

### 目標

Claude API を使い、**ユーザーの回答内容を踏まえた個別フィードバック**を生成する。

```
SubmitAnswers
  ├─→ 採点（同期）
  ├─→ attempt_insights を PENDING で書き込み
  └─→ goroutine: Claude API 呼び出し（非同期）
        └─→ READY または FAILED で更新

GetAttemptInsights
  └─→ フロントが最大 8 秒ポーリング → READY になったら表示
```

---

## アーキテクチャ決定

### なぜ非同期 goroutine か

| 方式 | 評価 |
|------|------|
| 同期（SubmitAnswers 内でブロック） | ❌ Claude API のレイテンシ（1〜5 秒）がレスポンスに乗る |
| 非同期 goroutine（採用） | ✅ SubmitAnswers は即座に返し、フロントがポーリング |
| バックグラウンドワーカー（別プロセス） | △ ECS の構成変更が必要で過剰 |

### タイムアウト設計

- goroutine に 30 秒のタイムアウトを設定
- タイムアウト or エラー → `status = FAILED`, `error_message` に理由を保存
- フロントは FAILED 時に error_message を表示（実装済み）

---

## 実装ステップ

### Step 1: Anthropic Go SDK の導入

```bash
cd backend
go get github.com/anthropics/anthropic-sdk-go
```

環境変数で API キーを管理（ハードコード禁止）:

```go
// backend/cmd/server/main.go
apiKey := os.Getenv("ANTHROPIC_API_KEY")
if apiKey == "" {
    logger.Fatal("ANTHROPIC_API_KEY is required")
}
```

ECS の Task Definition に `ANTHROPIC_API_KEY` をシークレットとして追加（Secrets Manager 経由）。

---

### Step 2: AIFeedbackService の作成

`handler` / `usecase` / `repository` の依存方向を守るため、Claude 呼び出しは usecase 層に閉じる。
ただし、Claude クライアントは interface として注入し、テスト可能にする。

```go
// backend/internal/usecase/ai_feedback.go

type AIClient interface {
    GenerateFeedback(ctx context.Context, prompt string) (string, error)
}

type claudeClient struct {
    client *anthropic.Client
    model  string
}

func NewClaudeClient(apiKey string) AIClient {
    return &claudeClient{
        client: anthropic.NewClient(option.WithAPIKey(apiKey)),
        model:  "claude-sonnet-4-6",
    }
}

func (c *claudeClient) GenerateFeedback(ctx context.Context, prompt string) (string, error) {
    msg, err := c.client.Messages.New(ctx, anthropic.MessageNewParams{
        Model:     anthropic.F(c.model),
        MaxTokens: anthropic.F(int64(512)),
        Messages: anthropic.F([]anthropic.MessageParam{
            anthropic.UserMessageParam(prompt),
        }),
    })
    if err != nil {
        return "", fmt.Errorf("claude api: %w", err)
    }
    return msg.Content[0].Text, nil
}
```

---

### Step 3: プロンプト設計

`ai_prompt_template`（topics テーブル）をベースに、回答詳細を動的に付加する。

**テンプレート変数**（既存の `{correct}` / `{total}` / `{pct}` / `{tier}` に加えて拡張）:

```
{correct}     正解数
{total}       全問数
{pct}         正答率（%）
{tier}        ランク（S/A/B/C）
{course_name} コース名
{answers}     問題ごとの正誤詳細（下記フォーマット）
```

**`{answers}` フォーマット**:
```
Q1. [AI基礎] RAGとはどれか？ → 正解 ✓
Q2. [AI基礎] Attentionの計算量は？ → 不正解 ✗（正解: O(n²)）
...
```

**デフォルトテンプレート**（`ai_prompt_template` が空の場合に使用）:

```
あなたはAI学習コーチです。以下のクイズ結果を踏まえ、学習者へ200字以内で
励ましと具体的な改善アドバイスを日本語で伝えてください。

結果: {correct}/{total}問正解（正答率 {pct}%・{tier}ランク）

回答詳細:
{answers}

・ポジティブな出だしで始める
・不正解の問題に触れて具体的なアドバイスを添える
・次のステップを1つ提案する
```

---

### Step 4: SubmitAnswers の修正

```go
// backend/internal/usecase/quiz_v2.go

func (u *quizV2Usecase) SubmitAnswers(ctx context.Context, ...) (*quizv2.SubmitAnswersResponse, error) {
    // ... 既存の採点ロジック ...

    // attempt_insights を PENDING で初期化（既に StartAttempt で行っているので更新のみ）
    if err := u.repo.UpsertAttemptInsights(ctx, aID, "PENDING", "", ""); err != nil {
        return nil, fmt.Errorf("reset insights to pending: %w", err)
    }

    // 非同期で Claude フィードバックを生成
    go u.generateAIFeedback(aID, result, course)

    return resp, nil
}

func (u *quizV2Usecase) generateAIFeedback(attemptID uuid.UUID, result *scoreResult, course *db.Topic) {
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    prompt := u.buildPrompt(course.AiPromptTemplate, result)
    feedback, err := u.aiClient.GenerateFeedback(ctx, prompt)
    if err != nil {
        _ = u.repo.UpsertAttemptInsights(context.Background(), attemptID, "FAILED", "", err.Error())
        return
    }
    _ = u.repo.UpsertAttemptInsights(context.Background(), attemptID, "READY", feedback, "")
}
```

> **注意**: goroutine 内では元の `ctx` を使わない。リクエストのキャンセルで途中終了するため、独立した context を生成する。

---

### Step 5: DI の配線

```go
// backend/cmd/server/main.go

aiClient := usecase.NewClaudeClient(os.Getenv("ANTHROPIC_API_KEY"))
quizV2UC := usecase.NewQuizV2Usecase(repo, aiClient)
```

`QuizV2Usecase` インターフェースと `quizV2Usecase` 構造体に `aiClient AIClient` フィールドを追加。

---

### Step 6: テスト

```go
// backend/internal/usecase/quiz_v2_test.go

type mockAIClient struct {
    feedback string
    err      error
}

func (m *mockAIClient) GenerateFeedback(_ context.Context, _ string) (string, error) {
    return m.feedback, m.err
}

func TestGenerateAIFeedback_Success(t *testing.T) { ... }
func TestGenerateAIFeedback_Timeout(t *testing.T) { ... }
func TestGenerateAIFeedback_APIError(t *testing.T) { ... }
```

---

## フロントエンド変更

### 現状で十分なもの（変更不要）

- ポーリング実装（最大 10 回 × 800ms）
- PENDING / READY / FAILED のステータス表示
- フェードインアニメーション

### 変更が必要なもの

- **ポーリング間隔の延長**: Claude API が 1〜5 秒かかるため、現状の 800ms × 10 回（最大 8 秒）では不足する可能性がある。
  - 推奨: 1000ms × 20 回（最大 20 秒）に変更
- **`ai_feedback` のマークダウンレンダリング**: Claude の出力は改行・箇条書きを含む可能性がある。`react-markdown` の導入を検討。

---

## 環境変数・インフラ

| 変数 | 用途 | 管理場所 |
|------|------|---------|
| `ANTHROPIC_API_KEY` | Claude API 認証 | AWS Secrets Manager → ECS Task Definition |

ローカル開発は `.env.local` に記載（`.gitignore` 済み）:

```bash
# backend/.env.local
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 将来拡張: RAG / Citations

`GetAttemptInsightsResponse.citations` フィールドはすでに proto に定義済み。
将来的には以下の実装を想定:

```
1. ユーザーの不正解問題を抽出
2. ベクトル DB（pgvector 等）で関連ドキュメントを検索
3. 検索結果を Claude のプロンプトに付加（RAG）
4. 参照元を citations として返す
```

現フェーズでは citations は空リストのまま。

---

## 実装優先度

```
Phase 1（MVP）
  ├─ Step 1: SDK 導入
  ├─ Step 2: AIClient interface + claudeClient 実装
  ├─ Step 3: デフォルトプロンプト設計
  ├─ Step 4: SubmitAnswers の goroutine 化
  └─ Step 5: DI 配線 + ローカル動作確認

Phase 2
  ├─ Step 6: テスト追加
  ├─ FE: ポーリング間隔調整
  └─ FE: マークダウンレンダリング

Phase 3（将来）
  ├─ ai_prompt_template の管理 UI
  └─ RAG / Citations 実装
```
