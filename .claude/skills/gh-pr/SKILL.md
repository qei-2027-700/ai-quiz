このプロジェクトの規約に従い、GitHub Pull Request を作成してください。

## 手順

1. `git status` と `git diff main...HEAD` で変更内容を確認する
2. 変更内容から PR タイトルとサマリーを生成する
3. ブランチが remote に push されていなければ `git push -u origin <branch>` する
4. Playwright MCP でスクリーンショットを撮影していた場合は `docs/screenshots/pr-<number>/` にコミット・push する
5. 以下のフォーマットで `gh pr create` を実行する

## PR フォーマット

- タイトル: 70文字以内、日本語可
- ラベル: 変更種別に応じて `feat` / `fix` / `docs` / `chore` / `infra` を付与
- body:
  - ## 変更内容（箇条書き）
  - ## 確認方法（ローカルでの動作確認手順）
  - ## スクリーンショット（Playwright MCP による自動検証）
  - 🤖 Generated with Claude Code

## スクリーンショットセクションのフォーマット

Playwright MCP でスクリーンショットを撮影した場合は必ず含める。撮影していない場合は省略する。

```markdown
## スクリーンショット（Playwright MCP による自動検証）

### 1. <画面名>

**検証対象**: <どの画面か・どのコンポーネントか>
**確認観点**:
- <観点1（例: 解説テキストが選択直後に表示される）>
- <観点2（例: 正解・不正解で色が変わる）>
- <観点3（例: SP幅（375px）でレイアウトが崩れない）>

![<alt テキスト>](<raw GitHub URL または相対パス>)

---

### 2. <画面名>

**検証対象**: ...
**確認観点**:
- ...

![<alt テキスト>](<URL>)
```

### スクリーンショットの画像パスについて

`docs/screenshots/pr-<PR番号>/` にコミットした場合、PR本文からは以下の raw URL で参照する:

```
https://raw.githubusercontent.com/<owner>/<repo>/<branch>/docs/screenshots/pr-<number>/<filename>.png
```

## ブランチ戦略

- feature ブランチ → `main` へ PR
- `main` push で staging 自動デプロイ
- 本番リリースは `release/x.x.x` タグ
