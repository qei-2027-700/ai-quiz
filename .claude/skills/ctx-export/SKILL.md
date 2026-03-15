# ctx-export

現在のセッションの作業内容を `.claude/ctx-export.md` にまとめ、次の Claude セッションにコンテキストを引き継ぐ。

## 使う場面

- `statusLine` が `⚠️ Context: XX% — /ctx-export を実行してください` と表示されたとき
- セッションを終了する前に作業状態を保存したいとき
- 別ブランチ・別ウィンドウの Claude に現在の文脈を渡したいとき

## 手順

### Step 1: 現在の状態を収集する

以下を**並行して**取得する:

```bash
git status --short
git log --oneline -10
git branch --show-current
```

```bash
gh pr list --repo <owner>/<repo> --state open --json number,title,headRefName
gh issue list --repo <owner>/<repo> --state open --json number,title,labels
```

### Step 2: `.claude/ctx-export.md` を書く

以下の構造で出力する。**箇条書きは具体的に**（「実装した」ではなく「`handler/auth.go` の `registerWithPassword` を実装した」のように）。

```markdown
# Context Export — {YYYY-MM-DD HH:MM}

## プロジェクト
- リポジトリ: <owner>/<repo>
- 現在のブランチ: <branch>

## 今セッションでやったこと
- <具体的な作業1>（例: `feat/issue-2` ブランチで PR #14 を作成・マージ）
- <具体的な作業2>

## 現在の状態

### Open PR
| # | タイトル | ブランチ |
|---|---------|---------|
| ... | ... | ... |

### Open Issue（優先度順）
| # | タイトル | 概要 |
|---|---------|------|
| ... | ... | ... |

## 直前の判断・設計メモ
- <重要な設計判断や背景情報>（例: auth エンドポイントは Connect-RPC ではなく HTTP で実装する（既存パターンに合わせる））

## 次にやること（推奨順）
1. <最優先タスク>（例: `#1 マイページ実装` — PR #14 で display_name が整ったため着手可能）
2. <次のタスク>
3. <その次>

## 再開コマンド
\`\`\`bash
# 新しい Claude セッションにコンテキストを渡して再開する
claude --append-system-prompt "$(cat .claude/ctx-export.md)" "この引き継ぎドキュメントをもとに作業を再開してください。"

# または: 最後のセッションをそのまま継続する（同一ディレクトリの場合）
claude --continue
\`\`\`
```

### Step 3: 出力を確認してユーザーに報告する

- ファイルパスを伝える: `.claude/ctx-export.md`
- 「再開コマンド」セクションの内容をそのままターミナルに貼り付けられることを伝える
- Stop hook が自動で `handoff-YYYYMMDD-HHMMSS.md` としてコピーすることを補足する

## 注意事項

- セッション中に判断した設計上の理由（なぜそうしたか）を必ず記録する
- ファイルパス・関数名・PR 番号など具体的な情報を入れる（曖昧な表現は次のセッションで役に立たない）
- `<!-- AUTO-GENERATED -->` コメントは入れない
