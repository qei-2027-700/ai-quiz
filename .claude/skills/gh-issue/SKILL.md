GitHub Issue を起票してください。

## 手順

1. **認証確認**: `gh auth status` で認証済みか確認する。未認証なら `gh auth login` を促してから中断する
2. 引数が渡された場合はそれを Issue の概要として使う。なければコンテキスト（直前の作業・発見した問題）から内容を推定する
3. 複数の Issue をまとめて起票する場合は、各 Issue の内容を並列で準備してから順番に `gh issue create` を実行する
4. 種別に応じたラベルを選ぶ（必ず `ai-detected` を含める）
5. **ラベルの存在確認**: `gh label list` で対象ラベルが存在するか確認し、なければ `gh label create` で作成してから起票する
6. 以下の「Issue 本文フォーマット」に従って Issue 本文を作成する（`docs/sterring/ai-issue-driven-dev.md` も参考にする）
7. `gh issue create` で起票する
8. 起票した Issue の URL をユーザーに報告する

## 自動起票トリガー（指示なしでも起票する条件）

以下を発見したら、その場での修正が困難・スコープ外であれば**即座に起票**する:

| 発見パターン | ラベル |
|------------|-------|
| TypeScript 型と実データの不整合（union に存在するが実装がない等） | `ai-detected,fix` |
| セキュリティ問題（認証漏れ・XSS・SQL injection 等） | `ai-detected,fix,priority:high` |
| クラッシュ・データ損失につながるバグ | `ai-detected,fix` |
| N+1 クエリ・明らかなパフォーマンス問題 | `ai-detected,tech-debt` |
| TODO/FIXME コメントが残存している | `ai-detected,tech-debt` |
| Playwright 自己テストで再現性のある UI バグ | `ai-detected,fix` |
| docs/sterring/ の設計と実装の乖離 | `ai-detected,tech-debt` |
| 削除すべき `.js` ファイルが `.ts` と重複して残存 | `ai-detected,tech-debt` |

**その場で修正できる場合（起票不要）:**
- 変更が 1〜2 ファイル以内で完結する小さな修正
- 現在の作業スコープに明確に含まれる変更

## ラベルの選び方

| 内容 | ラベル |
|------|-------|
| 新機能 | `ai-detected,feat` |
| バグ修正 | `ai-detected,fix` |
| リファクタリング | `ai-detected,refactor` |
| 技術的負債 | `ai-detected,tech-debt` |
| ドキュメント | `ai-detected,docs` |
| セキュリティ | `ai-detected,fix,priority:high` |

### ラベル作成コマンド（未作成の場合）

```bash
gh label create "ai-detected"   --color "#0075ca" --description "AI によって検出・提案された Issue"
gh label create "feat"          --color "#a2eeef" --description "新機能"
gh label create "fix"           --color "#d73a4a" --description "バグ修正"
gh label create "refactor"      --color "#cfd3d7" --description "リファクタリング"
gh label create "tech-debt"     --color "#e4e669" --description "技術的負債"
gh label create "docs"          --color "#0075ca" --description "ドキュメント"
gh label create "priority:high" --color "#b60205" --description "優先度: 高"
```

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

### 1件起票

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

### 複数件まとめて起票

```bash
# 各 Issue を順番に gh issue create で実行する（並列準備 → 順次投入）
gh issue create --title "feat: A" --label "ai-detected,feat" --body "..."
gh issue create --title "feat: B" --label "ai-detected,feat" --body "..."
gh issue create --title "feat: C" --label "ai-detected,feat" --body "..."
```
