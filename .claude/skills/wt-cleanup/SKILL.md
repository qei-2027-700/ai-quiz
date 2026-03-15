# wt-cleanup

目的: マージ済み PR に対応する git wt とフォルダを自動で削除する。

## 手順

### Step 1: wt 一覧を取得

```bash
git worktree list --porcelain
```

main（プライマリ）以外の wt を列挙する。

### Step 2: 各 wt のブランチが PR マージ済みか確認

```bash
gh pr list --repo qei-2027-700/ai-quiz --state merged --json headRefName --jq '.[].headRefName'
```

上記でマージ済みブランチ名を取得し、wt のブランチと照合する。

### Step 3: マージ済み wt を削除

一致したものを削除する:

```bash
git worktree remove <path> --force
```

フォルダが残っていれば併せて削除:

```bash
rm -rf <path>
```

### Step 4: 結果を報告

- 削除した wt があれば一覧を報告する
- 削除対象がなければ「🧹 クリーンアップ不要：マージ済み wt なし」と報告する
