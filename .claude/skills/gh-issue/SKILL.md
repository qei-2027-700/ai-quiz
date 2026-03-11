GitHub Issue を起票してください。

## 手順

1. 引数が渡された場合はそれを Issue の概要として使う。なければコンテキスト（直前の作業・発見した問題）から内容を推定する
2. `docs/sterring/ai-issue-driven-dev.md` のテンプレートに従って Issue 本文を作成する
3. 種別に応じたラベルを選ぶ（必ず `ai-detected` を含める）
4. `gh issue create` で起票する
5. 起票した Issue の URL をユーザーに報告する

## ラベルの選び方

| 内容 | ラベル |
|------|-------|
| 新機能 | `ai-detected,feat` |
| バグ修正 | `ai-detected,fix` |
| リファクタリング | `ai-detected,refactor` |
| 技術的負債 | `ai-detected,tech-debt` |
| ドキュメント | `ai-detected,docs` |
| セキュリティ | `ai-detected,fix,priority:high` |

## Issue 本文フォーマット

```markdown
## 概要
<!-- 何が問題か / 何を実装すべきか を1〜2行で -->

## 背景・理由
<!-- なぜこれが必要か -->

## 実装方針（案）
- [ ] ...
- [ ] ...

## 影響範囲
<!-- 変更が及ぶファイル・レイヤー -->

## 参考
<!-- 関連 Issue・PR・ドキュメントへのリンク（あれば） -->

---
🤖 Detected by Claude Code
```

## コマンド例

```bash
gh issue create \
  --title "feat: ログイン済みユーザーにはログインボタンを非表示にする" \
  --label "ai-detected,feat" \
  --body "$(cat <<'EOF'
## 概要
...
EOF
)"
```
