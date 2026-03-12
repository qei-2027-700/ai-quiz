import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@ai-quiz/shared/stores";
import { createQuizClient } from "@ai-quiz/api-client";

// テスト用アカウント（バックエンド認証実装前の暫定）
const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "password";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const [email, setEmail] = useState(TEST_EMAIL);
  const [password, setPassword] = useState(TEST_PASSWORD);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const quizClient = useMemo(() => createQuizClient(), []);

  useEffect(() => {
    // Google callback: /login#access_token=...&name=...&email=...
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token") ?? "";
    const displayEmail = params.get("email") ?? "";

    if (accessToken.length === 0) return;

    setAccessToken(accessToken);

    // Keep existing gating behavior (sessionStorage) for now.
    sessionStorage.setItem("authed", "1");
    if (displayEmail.length > 0) sessionStorage.setItem("username", displayEmail);

    // Cleanup URL fragment
    window.history.replaceState(null, "", window.location.pathname + window.location.search);

    // Optional sanity check
    void quizClient.listCourses({}).catch(() => {});

    navigate("/quiz");
  }, [navigate, quizClient, setAccessToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 400)); // UX のための擬似遅延

    if (email === TEST_EMAIL && password === TEST_PASSWORD) {
      sessionStorage.setItem("authed", "1");
      sessionStorage.setItem("username", email);
      navigate("/quiz");
    } else {
      setError("メールアドレスまたはパスワードが違います");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#080808] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">AI Quiz</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-white/40">AI 理解力クイズへようこそ</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#111] rounded-2xl shadow-md dark:shadow-none dark:border dark:border-white/8 p-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-6">ログイン</h2>

          <button
            type="button"
            disabled
            title="Coming soon"
            className="w-full py-3 rounded-xl font-bold border border-gray-300 dark:border-white/20 text-gray-400 dark:text-white/30 bg-gray-50 dark:bg-white/5 cursor-not-allowed mb-6"
          >
            Google でログイン（Coming soon）
          </button>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white/60 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={TEST_EMAIL}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-[#1a1a1a] dark:text-white dark:placeholder-white/30 text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                  transition-all duration-150"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white/60 mb-1">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={TEST_PASSWORD}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-[#1a1a1a] dark:text-white dark:placeholder-white/30 text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                  transition-all duration-150"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
            )}

            {/* Hint */}
            <p className="text-xs text-gray-400 dark:text-white/25">
              テスト用: <span className="font-mono">{TEST_EMAIL}</span> /{" "}
              <span className="font-mono">{TEST_PASSWORD}</span>
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer w-full py-3 rounded-xl font-bold text-black
                bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600
                disabled:bg-gray-300 disabled:cursor-not-allowed
                transition-colors duration-150"
            >
              {isLoading ? "ログイン中..." : "ログイン"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
