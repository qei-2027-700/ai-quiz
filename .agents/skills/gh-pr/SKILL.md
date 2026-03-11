このプロジェクトの規約に従い、GitHub Pull Request を作成してください。

## 手順

1. `git status` と `git diff main...HEAD` で変更内容を確認する
2. 変更内容から PR タイトルとサマリーを生成する
3. ブランチが remote に push されていなければ `git push -u origin <branch>` する
4. 以下のフォーマットで `gh pr create` を実行する

## PR フォーマット

- タイトル: 70文字以内、日本語可
- ラベル: 変更種別に応じて `feat` / `fix` / `docs` / `chore` / `infra` を付与
- body:
  - ## 変更内容（箇条書き）
  - ## 確認方法（ローカルでの動作確認手順）
  - 🤖 Generated with Codex

## ブランチ戦略

- feature ブランチ → `main` へ PR
- `main` push で staging 自動デプロイ
- 本番リリースは `release/x.x.x` タグ
