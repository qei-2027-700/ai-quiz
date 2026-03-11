# GitHub Issue 運用ルール

詳細設計: `docs/sterring/ai-issue-driven-dev.md`

## 自動起票ルール（指示がなくても起票する）

以下を発見した場合は、その場での修正が困難・スコープ外であれば **必ず** GitHub Issue を起票する:

- セキュリティ上の問題（SQL injection, XSS, 認証漏れ等）
- クラッシュ・データ損失につながるバグ
- `/claude-lint` で検出した修正範囲が大きい問題
- Playwright 自己テストで発見した再現性のある UI バグ

## 提案起票（実装中に気づいたら起票）

- TODO / FIXME コメントが残っている
- N+1 クエリ・明らかなパフォーマンス問題
- 重要なビジネスロジックにテストがない
- `any` / `interface{}` で型を逃げている箇所
- `docs/sterring/` の設計と実装が乖離している

## 起票しない（その場で修正する）

- 変更が1〜2ファイル以内で完結する小さな修正
- 現在の作業スコープに含まれる変更

## Issue 起票コマンド

```bash
gh issue create \
  --title "<タイトル>" \
  --label "ai-detected,<種別ラベル>" \
  --body "$(cat <<'EOF'
## 概要
<何が問題か / 何を実装すべきか>

## 背景・理由
<なぜこれが必要か>

## 実装方針（案）
- [ ] ...

## 影響範囲
<変更が及ぶファイル・レイヤー>

---
🤖 Detected by Claude Code
EOF
)"
```

## ラベルの選び方

| 状況 | ラベル |
|------|-------|
| 新機能の提案 | `ai-detected,feat` |
| バグ発見 | `ai-detected,fix` |
| コード品質・リファクタ | `ai-detected,refactor` |
| 技術的負債 | `ai-detected,tech-debt` |
| セキュリティ問題 | `ai-detected,fix,priority:high` |

## Issue を参照して実装するとき

```bash
# 1. Issue を読む
gh issue view <number>

# 2. ブランチを切る
git checkout -b fix/issue-<number>-<slug>

# 3. 実装後、コミットに Closes を含める
git commit -m "feat: <変更内容>

Closes #<number>"
```

コミットに `Closes #<number>` を含めると、PR マージ時に Issue が自動クローズされる。
