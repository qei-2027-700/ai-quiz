# migrations-squash

目的: `backend/DDL/` 配下のマイグレーション SQL（`*.up.sql` / `*.down.sql`）を **1つのファイルに統合（squash）**して、初期セットアップを簡単にする。

> 注意: 既に本番/共有環境で適用済みのマイグレーションを squash して差し替えるのは危険。  
> 本スキルは **ローカル/開発初期**の “作り直してよい” 状況を前提にする。

## いつ使うか
- 「DDL が増えて見通しが悪いので、最新スキーマを 1ファイルにまとめたい」
- 「新規環境のセットアップを 1回の migrate で済ませたい」

## 方針（2パターン）

### A) まだ破壊的変更OK（推奨: 開発初期）
- 既存の `000001_...` `000002_...` ... を **削除して**、新しい `000001_squashed.up.sql` / `000001_squashed.down.sql` に置き換える
- DB はリセット前提（`schema_migrations` も含めてやり直す）

### B) 既存環境を壊せない（本番/共有環境あり）
- 既存のマイグレーションは **残す**
- 新規環境向けに `backend/DDL_squashed/` のような **別ディレクトリ**を作って baseline 用の1ファイルを置く
  - 既存環境は従来通り `backend/DDL/` を使う
  - 新規環境のみ `migrate -path backend/DDL_squashed ...` を使う

## 具体手順（パターンA: 置き換え）
1) 現在の up を “適用順” に連結して 1つの up を作る
   - ファイル名順（`000001` → `000002` → ...）で結合
   - `CREATE EXTENSION` がある場合は先頭付近にまとめる

2) down を 1つ作る
   - down は「全テーブル/拡張/インデックスを落とす」方針にする
   - 依存関係のあるテーブルから逆順に落とす（または `DROP TABLE ... CASCADE`）

3) `backend/DDL/` を整理
   - 旧 `00000X_*.sql` を削除
   - `000001_squashed.up.sql` / `000001_squashed.down.sql` を追加

4) ローカルDBを完全リセットして検証
```bash
cd /Users/km/dev/_github/ai-quiz
mise run reset
cd backend && go test ./...
```

## 生成・動作確認（必須）
- `mise run migrate` が通る
- `mise run seed` が通る
- `go test ./...` が通る

## 実装メモ（このリポジトリの前提）
- migrate: `backend/DDL/`（`mise.toml` の `tasks.migrate` を参照）
- 命名規則: `000001_xxx.up.sql` / `000001_xxx.down.sql`
- 既存の seed は `backend/seeds/seeder.sql`

