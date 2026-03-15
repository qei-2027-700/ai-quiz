import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authClient } from "@ai-quiz/api-client";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // バリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("有効なメールアドレスを入力してください");
      return;
    }
    if (password.length < 8) {
      setError("パスワードは8文字以上で設定してください");
      return;
    }
    if (password !== confirm) {
      setError("パスワードが一致しません");
      return;
    }

    setIsLoading(true);
    try {
      const { displayName } = await authClient.register({ email, password, name });
      sessionStorage.setItem("authed", "1");
      sessionStorage.setItem("username", displayName || name || email);
      navigate("/quiz");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("登録に失敗しました");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-[#1a1a1a] dark:text-white dark:placeholder-white/30 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-150";

  const labelClass = "block text-sm font-medium text-gray-700 dark:text-white/60 mb-1";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#080808] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">AI Quiz</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-white/40">新規アカウント登録</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#111] rounded-2xl shadow-md dark:shadow-none dark:border dark:border-white/8 p-5 sm:p-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-6">アカウント作成</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 表示名 */}
            <div>
              <label className={labelClass}>表示名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: AI太郎"
                required
                className={inputClass}
              />
            </div>

            {/* メールアドレス */}
            <div>
              <label className={labelClass}>メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className={inputClass}
              />
            </div>

            {/* パスワード */}
            <div>
              <label className={labelClass}>パスワード（8文字以上）</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={inputClass}
              />
            </div>

            {/* パスワード確認 */}
            <div>
              <label className={labelClass}>パスワード（確認）</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                className={inputClass}
              />
            </div>

            {/* エラー表示 */}
            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
                {error}
              </p>
            )}

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer w-full py-3 rounded-xl font-bold text-black bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-150"
            >
              {isLoading ? "登録中..." : "アカウント作成"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-white/40">
            すでにアカウントをお持ちの方は{" "}
            <Link
              to="/login"
              className="cursor-pointer text-cyan-500 hover:text-cyan-400 font-medium transition-colors duration-150"
            >
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
