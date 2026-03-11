# API 設計

## 方針
- **MVP スコープ**: クイズ画面1枚に必要な API のみ実装
- **トランスポート**: Connect-RPC（HTTP/1.1 + HTTP/2）
- **認証**: 不要（ゲストモード。将来 Bearer Token を追加）
- **定義**: `proto/quiz/v1/quiz.proto` が唯一の真実

---

## 実装対象: クイズ画面

```
[クイズ画面の状態遷移]

①問題表示
  └─ ListQuestions() → 10問 + 選択肢を取得

②回答入力（クライアント側で保持）

③送信
  └─ SubmitAnswers() → スコア + 問題ごとの解説 + AI フィードバック

④結果表示（同画面内）
```

---

## API 一覧

### `QuizService.ListQuestions`

| 項目 | 値 |
|------|---|
| メソッド | `POST /quiz.v1.QuizService/ListQuestions` |
| 認証 | 不要 |
| DB | `questions` + `choices` を JOIN して返す |

**Request**
```json
{
  "topic_id": "（省略可。省略時は最初のトピックを使用）"
}
```

**Response**
```json
{
  "questions": [
    {
      "id": "uuid",
      "text": "RAG において Retriever の役割は何ですか？",
      "choices": [
        { "id": "uuid-a", "text": "モデルの学習を行う" },
        { "id": "uuid-b", "text": "関連ドキュメントを検索して返す" },
        { "id": "uuid-c", "text": "プロンプトをキャッシュする" },
        { "id": "uuid-d", "text": "トークン数を圧縮する" }
      ]
    }
  ]
}
```

- 固定10問をランダム順で返す
- 正解フラグ（`is_correct`）はレスポンスに含めない

---

### `QuizService.SubmitAnswers`

| 項目 | 値 |
|------|---|
| メソッド | `POST /quiz.v1.QuizService/SubmitAnswers` |
| 認証 | 不要 |
| 外部依存 | Claude API（`ai_feedback` と `explanation` の生成） |

**Request**
```json
{
  "answers": [
    { "question_id": "uuid", "choice_id": "uuid-b" }
  ]
}
```

**Response**
```json
{
  "correct_count": 7,
  "total_count": 10,
  "tier": "A",
  "results": [
    {
      "question_id": "uuid",
      "is_correct": true,
      "correct_choice_id": "uuid-b",
      "explanation": "Retriever は..."
    }
  ],
  "ai_feedback": "RAG の基礎理解は十分です。次のステップとして..."
}
```

---

## Claude API の使い方（SubmitAnswers 内）

### explanation（問題ごとの解説）
```
docs/rag-documents/<topic>.md の内容 + 問題文 + 正解 → Claude に渡して解説生成
```
- DB の `explanations.text` が空の場合のみ Claude で生成（キャッシュ代わり）
- `doc_ref` が設定されている問題は該当 .md を読み込んでコンテキストに追加

### ai_feedback（総合フィードバック）
```
全回答の正誤 + トピック情報 → Claude に渡して学習アドバイス生成
```
- 毎回 Claude API を呼ぶ（セッションごとに異なる内容）
- 実装の詳細なアーキテクチャについては `docs/design/ai-feedback-rag.md` を参照。

---

## DB ↔ API のマッピング

```
questions + choices
  └─ ListQuestions レスポンスにマッピング

questions + choices + explanations
  └─ SubmitAnswers の採点・解説生成に使用
```

---

## 実装スコープ外（将来）

- ユーザー認証・スコア保存
- トピック一覧 API
- 回答履歴 API
- 管理者向け問題 CRUD API
