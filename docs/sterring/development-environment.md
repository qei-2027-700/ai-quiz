# 開発環境の構想

## ローカル開発（現在）

mise + Docker Compose による標準構成。詳細は `mise.toml` を参照。

```bash
mise run setup   # 初回
mise run dev     # 開発サーバー起動
```

---

## Claude Remote を使ったリモート開発（構想）

### 概要

Claude Code の Remote 機能を使い、**クラウド上のサーバー（EC2 / GitHub Codespaces 等）で
Claude Code を常駐させ、スマホのブラウザや Claude モバイルアプリから開発を継続できる**
構成を目指す。

```
[スマホ / タブレット]
  └─ ブラウザ or Claude アプリ
       └─ Claude Remote セッション
            └─ [クラウドサーバー上の Claude Code]
                 └─ このリポジトリ（コード・ターミナル・ファイル操作）
```

### ユースケース

- 外出中や移動中にスマホで設計レビュー・ドキュメント修正
- 軽微なバグ修正・設定変更をスマホから投げる
- エージェントチームに長時間タスクを委譲してバックグラウンド実行させる

### 想定構成

| 項目 | 選択肢 |
|------|--------|
| サーバー | AWS EC2 t3.medium or GitHub Codespaces |
| 接続方法 | Claude Remote（`claude --remote`） |
| リポジトリ同期 | git push / pull（サーバー側でチェックアウト済み） |
| 認証 | SSH キー or GitHub OAuth |

### 考慮事項

- API キー（Anthropic / AWS）はサーバー側の環境変数で管理
- セッション切断後もエージェントタスクが継続できるよう `tmux` / `screen` を使う
- コスト: EC2 t3.medium ≒ $30/月、Codespaces ≒ 無料枠内で運用可能
