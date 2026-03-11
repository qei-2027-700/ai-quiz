# AI コンテンツ自動更新 設計ドキュメント

## 概要

AI関連の最新情報を外部ソースから定期取得し、クイズの問題・選択肢・正解を自動で更新するパイプラインの設計。

「昨日まで正解だった選択肢が今日は間違い」になる（例: 最新モデル名、API仕様変更）ような動的な知識領域に対応する。

---

## 背景・課題

現状の問題点:
- 問題・正解は手動で登録しており、AIの急速な進化に追いつけない
- 例: 「GPT-4が最新モデル」という正解が数ヶ月で陳腐化する
- 人手でのメンテナンスは持続不可能

---

## データソース候補

| ソース | 取得方法 | 更新頻度 | 信頼性 |
|---|---|---|---|
| Anthropic Blog | RSS / スクレイピング | 週1〜2回 | 高 |
| OpenAI Blog | RSS | 週1〜2回 | 高 |
| Google DeepMind Blog | RSS | 週1〜2回 | 高 |
| arXiv (cs.AI, cs.LG) | API | 毎日 | 高（論文） |
| Hacker News (AI tag) | API | 毎日 | 中 |
| GitHub Trending (AI) | スクレイピング | 毎日 | 中 |

---

## パイプライン全体像

```
[Scheduler / Cron]
       ↓ 定期実行 (日次 or 週次)
[1. Fetch Worker]
  - RSSフィード取得 / API呼び出し
  - URLハッシュで重複排除
  - content_snapshots テーブルに保存
       ↓
[2. Analysis Worker] (Claude API)
  - コンテンツから「キーファクト」を構造化抽出
  - 既存問題との関連チェック
  - 新規問題の候補を生成
       ↓
[3. Validation Worker] (Claude API)
  - 生成された Q&A の正確性を複数ソースで検証
  - 信頼スコアを算出
  - 既存問題の正解が変わっていないか確認
       ↓
[4. Review Queue]
  - 信頼スコア高 (≥0.9) → 自動ドラフト化 → 自動公開
  - 信頼スコア中 (0.7〜0.9) → ドラフト化 → 人間レビュー待ち
  - 信頼スコア低 (<0.7) → 破棄 or フラグ付き保留
       ↓
[5. DB Update]
  - 新規問題: questions テーブルに INSERT (status = 'ai_draft' or 'ai_published')
  - 既存問題の正解変更: question_versions にバージョン履歴を記録、正解を更新
  - 陳腐化した問題: status = 'outdated' に変更
```

---

## DB スキーマ設計

既存テーブル (`questions`, `choices`, `explanations`) への追加と新規テーブル:

```sql
-- ① questions テーブルへの追加カラム
ALTER TABLE questions
  ADD COLUMN status         TEXT    NOT NULL DEFAULT 'manual',
  -- 'manual'        : 手動登録
  -- 'ai_draft'      : AI生成・レビュー待ち
  -- 'ai_published'  : AI生成・公開済み
  -- 'outdated'      : 陳腐化・非表示
  ADD COLUMN auto_update    BOOLEAN NOT NULL DEFAULT false,
  -- true の問題は正解選択肢も自動更新対象
  ADD COLUMN last_validated_at TIMESTAMPTZ;

-- ② コンテンツソース定義
CREATE TABLE content_sources (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           TEXT NOT NULL,          -- "Anthropic Blog"
    feed_url       TEXT NOT NULL UNIQUE,   -- RSSフィードURL
    source_type    TEXT NOT NULL,          -- 'rss' | 'api' | 'scrape'
    enabled        BOOLEAN NOT NULL DEFAULT true,
    last_fetched_at TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ③ 取得コンテンツのスナップショット
CREATE TABLE content_snapshots (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id    UUID NOT NULL REFERENCES content_sources(id),
    url          TEXT NOT NULL UNIQUE,    -- 重複排除キー
    title        TEXT NOT NULL,
    raw_content  TEXT NOT NULL,
    published_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,            -- NULL = 未処理
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ④ 問題のバージョン履歴
CREATE TABLE question_versions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    old_text    TEXT NOT NULL,
    new_text    TEXT NOT NULL,
    change_reason TEXT,                  -- "OpenAI released GPT-5, answer updated"
    changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ⑤ 選択肢のバージョン履歴
CREATE TABLE choice_versions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    choice_id   UUID NOT NULL REFERENCES choices(id) ON DELETE CASCADE,
    old_text    TEXT NOT NULL,
    new_text    TEXT NOT NULL,
    old_is_correct BOOLEAN NOT NULL,
    new_is_correct BOOLEAN NOT NULL,
    change_reason  TEXT,
    changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ⑥ 問題とコンテンツソースの紐付け（根拠管理）
CREATE TABLE question_sources (
    question_id  UUID REFERENCES questions(id) ON DELETE CASCADE,
    snapshot_id  UUID REFERENCES content_snapshots(id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, snapshot_id)
);
```

---

## Go 実装構成

```
backend/
├── cmd/
│   ├── server/          # 既存: HTTP サーバー
│   └── worker/          # 新規: バックグラウンドワーカー
│       └── main.go
├── internal/
│   ├── worker/          # 新規
│   │   ├── scheduler.go         # cron スケジューラ
│   │   ├── content_fetcher.go   # RSS/API フェッチ
│   │   ├── question_generator.go # Claude API で Q&A 生成
│   │   ├── question_validator.go # 正確性検証
│   │   └── question_updater.go  # DB 更新ロジック
│   └── claude/          # 新規
│       └── client.go    # Claude API クライアント（structured output）
```

### ワーカーの実装イメージ

```go
// content_fetcher.go
type ContentFetcher struct {
    db      *db.Queries
    httpClient *http.Client
}

func (f *ContentFetcher) FetchAll(ctx context.Context) error {
    sources, _ := f.db.ListEnabledContentSources(ctx)
    for _, src := range sources {
        switch src.SourceType {
        case "rss":
            f.fetchRSS(ctx, src)
        case "api":
            f.fetchAPI(ctx, src)
        }
    }
    return nil
}
```

```go
// question_generator.go
type GeneratedQA struct {
    Question     string   `json:"question"`
    Choices      []string `json:"choices"`      // 4択
    CorrectIndex int      `json:"correct_index"` // 0-3
    Explanation  string   `json:"explanation"`
    Confidence   float64  `json:"confidence"`   // 0.0-1.0
    SourceURL    string   `json:"source_url"`
}

// Claude API に structured output で問題生成を依頼
func (g *QuestionGenerator) Generate(ctx context.Context, content string) ([]GeneratedQA, error) {
    prompt := `以下のAI関連コンテンツから、四択クイズ問題を最大3問生成してください。
    正解は必ず1つ。事実ベースで答えられる問題のみ生成すること。
    <content>` + content + `</content>`
    // Claude API 呼び出し（JSON mode）
    ...
}
```

---

## 自動正解更新のロジック

```
既存問題の自動更新フロー:

1. 新しいコンテンツが取得された
2. Claude に「このコンテンツは既存の問題の正解に影響するか？」を判断させる
3. 影響あり + auto_update=true の問題 → 正解選択肢を自動更新
4. 影響あり + auto_update=false の問題 → フラグを立てて管理者に通知
5. すべての変更を choice_versions に記録（監査ログ）
```

**例:**
```
問題: 「Anthropic の最新モデルはどれか？」
旧正解: Claude 3 Opus
新コンテンツ: "Anthropic releases Claude 4..."
→ auto_update=true なら Claude 4 に正解を自動更新
→ choice_versions に変更履歴を記録
```

---

## 信頼スコアの算出

Claude API のレスポンスに含まれる `confidence` を以下のロジックで補正:

| 条件 | 補正 |
|---|---|
| 一次ソース（公式ブログ）から生成 | +0.1 |
| 複数ソースで同じ事実を確認 | +0.15 |
| 数値・バージョン番号を含む（変化しやすい） | -0.1 |
| arXiv 論文（peer review なし） | -0.05 |

閾値:
- `>= 0.9` → 自動公開
- `0.7 〜 0.9` → レビューキュー
- `< 0.7` → 破棄

---

## 段階的実装計画

### Phase 1: コンテンツ収集基盤
- [ ] `content_sources` / `content_snapshots` テーブル追加
- [ ] RSS フェッチワーカー実装
- [ ] 重複排除ロジック
- [ ] cron スケジューラ

### Phase 2: AI 問題生成
- [ ] Claude API クライアント（structured output 対応）
- [ ] 問題生成プロンプト設計・チューニング
- [ ] ドラフト問題の管理画面（管理者用）

### Phase 3: 正解自動更新
- [ ] 既存問題へのインパクト分析ロジック
- [ ] `question_versions` / `choice_versions` によるバージョン管理
- [ ] `auto_update` フラグによるきめ細かな制御
- [ ] 変更通知（Slack Webhook など）

### Phase 4: 品質向上
- [ ] 複数ソース横断での事実確認
- [ ] 問題の陳腐化スコア（最終検証日からの経過時間）
- [ ] A/Bテスト（AI生成問題 vs 手動問題の正答率比較）

---

## リスクと対策

| リスク | 対策 |
|---|---|
| Claude が誤った正解を生成（ハルシネーション） | 信頼スコア閾値 + 複数ソース確認 + 人間レビューキュー |
| 同じ問題が重複生成される | 問題テキストの embedding 類似度チェックで重複排除 |
| ソースサイトの構造変更でクロール失敗 | エラー通知 + 手動フォールバック |
| 「最新モデル名」などの問題は頻繁に変化する | auto_update=true + 変更履歴の保持 |
| 著作権・利用規約 | 公式ブログ・arXiv などの自由利用可能なソースのみ使用 |

---

## 関連ファイル

- マイグレーション: `backend/DDL/`
- ワーカー実装: `backend/internal/worker/`（Phase 1 以降に作成）
- Claude API クライアント: `backend/internal/claude/`
- 問題管理 API: 今後 `admin` ロールで保護したエンドポイントを追加予定
