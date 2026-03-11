プロジェクト全体の Lint を実行し、エラーをすべて修正してください。

## 手順

1. `mise run lint` を実行する（backend + proto + frontend を一括チェック）
2. エラーが出た場合はその場で修正する
3. 修正後に再度 `mise run lint` を実行してクリーンになることを確認する

## 個別実行（必要に応じて）

```bash
# Go
cd backend && golangci-lint run ./...

# Proto
cd proto && buf lint

# Frontend (oxlint)
pnpm --filter frontend lint
```

## 自動修正できないエラーへの対応

- golangci-lint: 手動でコードを修正する
- buf lint: proto ファイルの命名・スタイル規約に合わせて修正する
- oxlint: コードのロジックに影響しない範囲で修正する

---

## CLAUDE.md / .claude/ ファイルの整合性チェック

コードの lint に加え、ステアリングファイルの品質もチェックして修正を提案してください。

### チェック観点

**CLAUDE.md**
- [ ] **行数が100行以内か**（`wc -l CLAUDE.md` で確認。超過していたら `docs/` か `.claude/rules/` に内容を移して削減する）
- [ ] 「現在のフェーズ」の記述は実際のリポジトリ状態と一致しているか
- [ ] ディレクトリ構成の記述に存在しないパス・抜けているパスがないか（`find` で実ファイルと照合）
- [ ] `mise run <task>` のコマンド一覧が `mise.toml` の `[tasks]` と一致しているか
- [ ] 参照している `docs/sterring/*.md` が実際に存在するか

**.claude/rules/*.md**
- [ ] `go.md` の禁止事項が実際のコードに違反していないか
- [ ] `proto.md` の命名規則が `proto/` 配下のファイルに適用されているか
- [ ] `frontend.md` のルールが `frontend/` / `packages/` のコードと整合しているか

**.claude/skills/*.md / .claude/commands/*.md**
- [ ] 記述されているコマンド（`mise run xxx` 等）が `mise.toml` に存在するか
- [ ] 参照しているファイルパスが実際に存在するか

**.mcp.json**
- [ ] 設定されている MCP サーバーが使用目的と一致しているか

### チェック後の対応

問題が見つかった場合は:
1. 修正内容と理由を列挙して提案する
2. ユーザーの承認なく自動修正してよい（CLAUDE.md の動作方針に従う）
3. 修正後に再チェックして問題がないことを確認する
