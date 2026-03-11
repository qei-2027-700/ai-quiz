# Frontend コーディングルール

## 完了基準（Definition of Done）

FE タスクは以下を**すべて**満たして初めて「完了」とする。1つでも未達なら修正してから完了と報告すること。

```
□ 1. 型チェック通過          pnpm type-check がエラーなし
□ 2. dev server 起動         HTTP 200 が返る
□ 3. 導線チェック（必須）
      □ このページへの入口が存在する（別ページ or router.tsx から辿れる）
      □ このページから次へ進む出口が少なくとも1つある（行き止まりでない）
      □ 認証状態によって CTA のリンク先が適切に切り替わっている
□ 4. Playwright スクショ確認  レイアウト・データ表示・インタラクションに問題なし
□ 5. SP 表示確認             iPhone SE（375px）幅でレイアウトが崩れていない
```

> **導線チェックで問題を発見した場合**: スコープが小さければその場で修正。大きければ GitHub Issue を起票（`/gh-issue`）してから完了報告する。

---

## FE 変更後の自動検証フロー

CSS 以外の FE ファイル（`.tsx` / `.ts` / `package.json` 等）を変更したら、**指示がなくても**以下を順番に実行する。

### Step 1: パッケージ同期（`frontend/packages/` を触った場合のみ）

```bash
cd /Users/km/dev/_github/ai-quiz/frontend
pnpm install          # pnpm キャッシュを同期
rm -rf node_modules/.vite  # Vite バンドルキャッシュを削除
```

### Step 2: 型チェック（常に実行）

```bash
pnpm type-check
```

エラーがあれば修正してから次へ進む。

### Step 3: dev server 再起動 + 疎通確認（常に実行）

```bash
lsof -ti :5173 | xargs kill -9 2>/dev/null
pnpm dev > /tmp/vite-dev.log 2>&1 &
sleep 5 && curl -s -o /dev/null -w "dev server: %{http_code}\n" http://localhost:5173/
```

HTTP 200 以外なら `/tmp/vite-dev.log` を確認してエラーを修正する。

### Step 4: Chrome DevTools によるランタイム検証（AI が必要と判断した場合）

以下の条件に1つでも当てはまる場合は Chrome をデバッグモードで起動してコンソールエラーを確認する:
- 新しい `import` / `export` を追加した
- hooks や非同期処理を変更した
- 白画面・ルーティング・レンダリングに関わる変更をした
- Step 1〜3 が通ったのに動作が怪しいと感じた場合

```bash
# Chrome をデバッグポート付きで起動（既存 Chrome は閉じなくてよい）
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-debug \
  http://localhost:5173/ &

sleep 3

# コンソールエラーを取得
curl -s http://localhost:9222/json | python3 -c "
import sys, json, urllib.request
tabs = json.load(sys.stdin)
tab = next((t for t in tabs if 'localhost:5173' in t.get('url','')), tabs[0] if tabs else None)
if tab:
    print('Inspecting:', tab['url'])
" 2>/dev/null || echo "Chrome DevTools not reachable"
```

コンソールエラーが確認できたら修正し、再度 Step 2〜3 を実行する。

### なぜこの手順が必要か
- pnpm の `.pnpm/` キャッシュが古いと新しいエクスポートが認識されない
- Vite の `node_modules/.vite/deps/` キャッシュが古いと `SyntaxError: does not provide an export named '...'` で白画面になる
- 型チェックは通っても JS ランタイムエラーが出ることがある

## パッケージ構成

共有パッケージは `frontend/packages/` に配置（ルートには置かない）:
- `frontend/packages/api-client/` → `@ai-quiz/api-client`（proto 生成 TS 型 + Connect クライアント）
- `frontend/packages/shared/` → `@ai-quiz/shared`（hooks / stores / utils）

## import の優先順位

1. `@ai-quiz/api-client` — API 型・Connect クライアント
2. `@ai-quiz/shared` — hooks / stores / utils / validation
3. ライブラリ（react, react-router 等）
4. プロジェクト内コンポーネント（相対パス）

## 禁止事項

- `fetch` / `axios` を直接書かない（`@ai-quiz/api-client` を使う）
- `localStorage` / `sessionStorage` にトークンを保存しない（httpOnly Cookie）
- `ESLint` の設定ファイルを作成しない（oxlint を使う）
- `frontend/packages/` に UI コンポーネントを置かない

## 認証状態に応じた UI の切り替え（自動適用）

実装時は認証状態（`sessionStorage.getItem("authed") === "1"`）を必ず考慮する（指示がなくても）:

- **「ログイン」ボタン・リンク**: ログイン済みの場合は**非表示**にする
- **「クイズに挑戦する」などの CTA ボタン**: ログイン済みなら `/quiz` へ、未ログインなら `/login` へ誘導する
- **ユーザー名・アバター等のユーザー情報**: 未ログイン時は非表示にする
- **ログアウトボタン**: ログイン済みの場合のみ表示する

```tsx
// 判定パターン（router.tsx と統一）
const isAuthed = sessionStorage.getItem("authed") === "1";

// ログイン済みなら非表示
{!isAuthed && <button onClick={() => navigate("/login")}>ログイン →</button>}

// 状態に応じてリンク先を切り替え
<button onClick={() => navigate(isAuthed ? "/quiz" : "/login")}>
  クイズに挑戦する →
</button>
```

## UI/UX 品質基準（自動適用）

実装時は以下を**常に**適用する（指示がなくても）:

- **インタラクティブ要素**（button, a, クリッカブルな div）には必ず `cursor-pointer` を付ける
- **ホバー・フォーカス**状態を明示する（`hover:` / `focus-visible:` クラス）
- **トランジション**をつけて動きをなめらかにする（`transition-all duration-150` 等）
- **disabled** 状態は `disabled:opacity-50 disabled:cursor-not-allowed` で視覚的に区別する
- **ローディング状態**は専用のスピナーやスケルトンで表示する
- **エラー状態**はユーザーフレンドリーなメッセージで表示する
- **レスポンシブ**を意識する（`sm:` / `md:` ブレークポイントを適切に使う）
- **余白・タイポグラフィ**は一貫性を保つ（`gap-4` / `space-y-4` 等のスケールを統一）
- フォームの入力欄には `focus:ring-2 focus:ring-blue-500 focus:outline-none` を適用する

## SP / モバイル対応（自動適用）

実装時は**常に**モバイルファーストで設計する（指示がなくても）:

### レイアウト
- パディング: `px-4 sm:px-6 sm:px-8` のように SP を基準に増やす
- フォントサイズ: `text-2xl sm:text-4xl` のように SP 基準で段階的に拡大
- ボタン幅: SP では `w-full sm:w-auto` でフル幅にする
- 縦並び優先: `flex-col sm:flex-row` を基本パターンとする
- グリッド: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

### ナビゲーション
- ヘッダーのリンク群は SP では `hidden sm:flex` / `hidden sm:block` で非表示にし、主要ボタンのみ残す
- テキストが折り返さないよう `whitespace-nowrap` を付ける
- ヘッダーパディング: `px-4 sm:px-6`

### フォーム・カード
- カードのパディング: `p-5 sm:p-8`
- フォームは縦 1 列・フル幅を基本とする

### フッター
- `flex-col sm:flex-row` で SP 時は縦積みにする

### 確認方法
Chrome DevTools の Device Toolbar（⌘+Shift+M）で iPhone SE（375px）と iPhone 14 Pro（393px）を確認すること。

## TailwindCSS

- クラスは可読性重視（1行が長くなる場合は `clsx` / `cn` でまとめる）
- 例: `cn('flex items-center gap-2', isActive && 'bg-blue-500')`
- マジックナンバーを避ける（`w-[123px]` より `w-32` を使う）

## ページ設計の必須要件（導線チェック）

**新しいページを実装する前に、必ず以下の3点を定義する。** 実装後ではなく、設計段階で確定させること。

| 要件 | 定義すべき内容 | 実装例 |
|------|-------------|--------|
| **入口（どこから来るか）** | このページへの遷移元 | ヘッダーのリンク、別ページのボタン、リダイレクト |
| **出口（どこへ行けるか）** | このページからの遷移先を**必ず1つ以上**設ける | 次のステップへのボタン、ホームへ戻るリンク |
| **主要 CTA** | ユーザーが次に取るべき行動を明示するボタン | 「クイズに挑戦する」「結果を見る」「ランキングを見る」 |

### チェックリスト（実装完了後に確認）

```
□ このページへの入口が router.tsx に定義されているか？
□ このページに「前へ戻る」または「次のページへ」の導線があるか？
□ ユーザーがこのページから「詰まらない」か（行き止まりになっていないか）？
□ 認証状態によって CTA のリンク先が適切に切り替わっているか？
```

### ページ遷移マップ（現在の定義）

```
/ (Landing)           ← ログイン済みなら /quiz へリダイレクト
  ├─→ /login        （「ログイン」ボタン・未ログイン時のCTA）
  └─→ /ranking      （「ランキングを見る」リンク）

/login
  └─→ /quiz         （ログイン成功後リダイレクト）

/quiz
  └─→ /quiz/result  （回答提出後）

/quiz/result
  ├─→ /quiz         （「もう一度挑戦する」）← 必須
  └─→ /ranking      （「ランキングを見る」）← 必須

/ranking
  ├─→ /            （「← ai-quiz」戻るリンク）
  └─→ /quiz or /login （「クイズに挑戦する」CTA）
```

新しいページを追加したら、このマップを更新すること。

## コンポーネント設計

- 1コンポーネント = 1ファイル
- Props は `interface` で定義する（`type` ではなく `interface` を使う）
  ```ts
  // ✅ Good
  interface Props {
    question: Question
    onAnswer: (choiceId: string) => void
  }

  // ❌ Bad
  type Props = { ... }
  ```
- Props の `interface` はファイル内に定義する（export しない）
- `frontend/src/` の責務は UI とナビゲーションのみ
- ビジネスロジックは `@ai-quiz/shared` の hooks / utils に移動する

## ルーティング（React Router v6.4+）

**必ず `createBrowserRouter` を使う**。レガシーな `<BrowserRouter>` + `<Routes>` は使わない。

### ページアクセス制御（新ページ追加時は必ずここを更新すること）

ページには必ず以下の3種類のいずれかを割り当てる。判断に迷ったら `guest-only` か `public` かを明示的に決めてから実装する。

| 種別 | loader | 未ログイン時 | ログイン済み時 | 該当ページ |
|------|--------|------------|--------------|----------|
| **guest-only** | `requireGuest` | そのまま表示 | `/quiz` へリダイレクト | `/` `/en` `/login` |
| **protected** | `requireAuth` | `/login` へリダイレクト | そのまま表示 | `/quiz` `/quiz/result` `/settings` |
| **public** | なし | そのまま表示 | そのまま表示 | `/ranking` |

#### 種別の判断基準

- **guest-only**: ログイン済みユーザーが見る必要がないページ（LP、ログイン画面など）
- **protected**: ログインしていないと意味をなさないページ（クイズ、マイページなど）
- **public**: 誰でも見てよいページ（ランキング、利用規約など）

#### 実装ルール（自動適用）

- `guest-only` → `loader: requireGuest` を必ず付ける
- `protected` → `AuthedLayout` の `children` に入れる（個別に `requireAuth` は不要）
- `public` → loader なし、ただし **UI 上でログイン状態に応じた表示切り替えは必要**（「ログイン」ボタンの出し分けなど）

```tsx
// guest-only の例
{ path: "/login", loader: requireGuest, element: <LoginPage /> }

// protected の例（AuthedLayout でまとめて認証ガード）
{
  element: <AuthedLayout />,
  loader: requireAuth,
  children: [
    { path: "/quiz", element: <QuizPage /> },
  ],
}

// public の例（loader なし）
{ path: "/ranking", element: <RankingPage /> }
```

### 基本パターン

```tsx
// src/router.tsx
import { createBrowserRouter, redirect } from "react-router-dom";

function requireAuth() {
  if (!sessionStorage.getItem("authed")) return redirect("/login");
  return null;
}
function requireGuest() {
  if (sessionStorage.getItem("authed")) return redirect("/quiz");
  return null;
}

export const router = createBrowserRouter([
  { path: "/",      element: <LandingPage /> },
  { path: "/login", loader: requireGuest, element: <LoginPage /> },
  {
    element: <AuthedLayout />,   // <Outlet /> を持つレイアウト
    loader: requireAuth,
    children: [
      { path: "/dashboard", element: <DashboardPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
```

```tsx
// src/main.tsx
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
```

### ルール

- 認証ガードは `loader` 関数内で `redirect()` を使う（`<PrivateRoute>` コンポーネントは作らない）
- 認証が必要なページは `<Outlet />` を持つレイアウトコンポーネントの `children` に入れる
- `App.tsx` は不要。ルート定義は `router.tsx` に集約する
- プログラムナビゲーションは `useNavigate()` を使う

## 型定義の使い分け

| 用途 | 使うもの |
|------|---------|
| Props・オブジェクト形状 | `interface` |
| Union 型・Intersection | `type` |
| 関数シグネチャ単体 | `type` |
| プリミティブのエイリアス | `type` |
