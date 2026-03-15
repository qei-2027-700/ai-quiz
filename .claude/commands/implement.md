以下の手順で GitHub Issue を実装し、PR を作成・レビューまで完了してください。

## 引数

$ARGUMENTS に Issue 番号（例: `5` または `#5`）が渡されます。

## 手順

### Step 1: Issue を読む

```bash
gh issue view <N> --repo qei-2027-700/ai-quiz
```

Issue のタイトル・本文・ラベルをすべて把握する。
実装方針が不明な場合は `docs/sterring/` を参照して自己判断する。

### Step 2: ブランチを作成する

```bash
git checkout main
git pull origin main
git checkout -b fix/issue-<N>-<slug>
```

- `<slug>` は Issue タイトルを英小文字・ハイフン区切りで短縮したもの（例: `ctx-export`）
- feat 系の Issue は `feat/issue-<N>-<slug>`、fix 系は `fix/issue-<N>-<slug>`

### Step 3: 実装する

- `.claude/rules/` のコーディング規約に従う
- ファイルが 3 つ以上 / backend と frontend が独立している場合は Agent ツールでサブエージェントを並列起動する
- 実装が完了したら型チェック・lint を実行する:

```bash
# Frontend を変更した場合
cd frontend && pnpm type-check

# 全体 lint
mise run lint
```

エラーがあれば修正してから次へ進む。

### Step 4: コミット & プッシュ

```bash
git add <変更したファイルを個別に列挙>
git commit -m "feat/fix: <変更内容の要約>

Closes #<N>"
git push origin HEAD
```

`git add .` や `git add -A` は使わない。

### Step 5: PR を作成する

`/gh-pr` スキルを実行して PR を作成する。

### Step 6: 自己レビューする

作成した PR の URL または番号を引数に `/gh-rv` スキルを実行してレビューする。

レビューで問題が見つかった場合は修正してから再プッシュする。

## 完了報告

以下を報告する:
- 作成したブランチ名
- PR の URL
- レビュー結果の概要（問題あり / 問題なし）
