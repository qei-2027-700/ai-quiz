このプロジェクトの規約に従い、GitHub Pull Request を作成してください。

## 手順

1. `git status` と `git diff main...HEAD` で変更内容を確認する
2. 変更内容から PR タイトルとサマリーを生成する
3. ブランチが remote に push されていなければ `git push -u origin <branch>` する
4. **Playwright MCP でスクリーンショットを撮影していた場合**、以下を実行する:
   ```bash
   # .claude/screenshots/ に main ブランチへ直接コミット
   # （コードに影響しない検証成果物のため PR 不要。マージ後に削除する）
   PR_NUM=<gh pr create 後に確定した番号>
   CURRENT_BRANCH=$(git branch --show-current)
   git stash
   git checkout main && git pull origin main
   mkdir -p .claude/screenshots/pr-${PR_NUM}
   cp .playwright-mcp/*.png .claude/screenshots/pr-${PR_NUM}/
   git add .claude/screenshots/pr-${PR_NUM}/
   git commit -m "docs: PR #${PR_NUM} 検証スクリーンショット"
   git push origin main
   git checkout ${CURRENT_BRANCH}
   git stash pop
   ```
   > PR マージ後は `git rm -r .claude/screenshots/pr-${PR_NUM}` で削除する（スキル外・手動）
5. 以下のフォーマットで `gh pr create` を実行する

## PR フォーマット

- タイトル: 70文字以内、日本語可
- ラベル: 変更種別に応じて `feat` / `fix` / `docs` / `chore` / `infra` を付与
- body:
  - ## 変更内容（箇条書き）
  - ## 確認方法（ローカルでの動作確認手順）
  - ## スクリーンショット（Playwright MCP による自動検証）← スクショがある場合のみ
  - 🤖 Generated with Claude Code

## スクリーンショットセクションのフォーマット

Playwright MCP でスクリーンショットを撮影した場合は **必ず** 含める。撮影していない場合は省略する。

`raw.githubusercontent.com` の URL を `![alt](url)` 形式で埋め込むと、GitHub PR 上でインライン表示される（`image/png` として配信されるため）。

```markdown
## スクリーンショット（Playwright MCP による自動検証）

### 1. <画面名>

**検証対象**: <どの画面・コンポーネントか>
**確認観点**:
- <観点1（例: 解説テキストが選択直後に表示される）>
- <観点2（例: 正解・不正解で背景色が変わる）>
- <観点3（例: ボタンが disabled 時に薄くなる）>

![<画面名のalt>](https://raw.githubusercontent.com/<owner>/<repo>/main/.claude/screenshots/pr-<number>/<filename>.png)

---

### 2. <画面名>

**検証対象**: ...
**確認観点**:
- ...

![<alt>](https://raw.githubusercontent.com/<owner>/<repo>/main/.claude/screenshots/pr-<number>/<filename>.png)
```

> **Note**: `uploads.github.com` への直接アップロードは GitHub 内部の CSRF トークンが必要なため CLI からは使用不可。`raw.githubusercontent.com` 経由が唯一の現実的な方法。

## ブランチ戦略

- feature ブランチ → `main` へ PR
- `main` push で staging 自動デプロイ
- 本番リリースは `release/x.x.x` タグ
