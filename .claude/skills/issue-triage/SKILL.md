# issue-triage

オープンな Issue を横断的に分析し、まとめて対応できるものをグルーピングして実装優先度を提案する。

## 使う場面
- 「Issue を整理して」「まとめて対応できるものはある？」と聞かれたとき
- 実装の合間に Issue を見直したいとき
- PR を出し終えた後・sprint 開始前

## 手順

1. **Issue 一覧を取得する**
```bash
gh issue list --repo <owner>/<repo> --state open --limit 100 --json number,title,labels,createdAt,body
```

2. **グルーピングと分析**
   以下の軸で Issue を分類する:

   | 軸 | 説明 |
   |----|------|
   | **レイヤー** | backend / frontend / infra / docs |
   | **種別** | feat / fix / refactor / tech-debt |
   | **依存関係** | A が終わらないと B に着手できないものを特定 |
   | **バッチ対応可能** | 同一ファイル・同一機能に触れる Issue を束ねる |

3. **出力フォーマット**
   以下の形式でユーザーに提示する:

   ```
   ## まとめて対応できるグループ

   ### グループ A: フロントエンド型整合（同一ファイル）
   - #10 quizMockData.ts の hallucination genre 不整合
   - #XX TypeScript strict 違反
   → 同一ファイルを触るため 1 PR にまとめられる

   ### グループ B: Backend API 認証強化
   - #XX Admin API の認証レビュー
   → 単独 PR

   ## 推奨着手順序
   1. グループ A（ブロッカーなし・小規模）
   2. グループ B（グループ A に依存なし・並行可能）
   ```

4. **ユーザーの承認を得てから実装へ**
   「このグループを実装しますか？」と確認し、承認されたら `implement #X #Y` の形式で着手する。

## 実装バッチ化のルール

- **同一ファイルに触れる修正は 1 PR にまとめる**
- **独立したレイヤー（BE/FE）は並行エージェントで同時実装する**
- **依存関係がある場合は順序を明示してから着手する**
- バッチサイズの上限: 1 PR あたり 5 Issue まで（それ以上は分割する）

## コマンド例

```bash
# Open Issue 一覧（JSON）
gh issue list --state open --limit 100 --json number,title,labels,body

# ラベルで絞り込み
gh issue list --label "ai-detected" --state open

# milestone で絞り込み
gh issue list --milestone "v1.0"
```
