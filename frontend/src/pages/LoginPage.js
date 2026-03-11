import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
        if (!hash)
            return;
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token") ?? "";
        const displayEmail = params.get("email") ?? "";
        if (accessToken.length === 0)
            return;
        setAccessToken(accessToken);
        // Keep existing gating behavior (sessionStorage) for now.
        sessionStorage.setItem("authed", "1");
        if (displayEmail.length > 0)
            sessionStorage.setItem("username", displayEmail);
        // Cleanup URL fragment
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
        // Optional sanity check
        void quizClient.listCourses({}).catch(() => { });
        navigate("/quiz");
    }, [navigate, quizClient, setAccessToken]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        await new Promise((r) => setTimeout(r, 400)); // UX のための擬似遅延
        if (email === TEST_EMAIL && password === TEST_PASSWORD) {
            sessionStorage.setItem("authed", "1");
            sessionStorage.setItem("username", email);
            navigate("/quiz");
        }
        else {
            setError("メールアドレスまたはパスワードが違います");
        }
        setIsLoading(false);
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 dark:bg-[#080808] flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-3xl font-extrabold text-gray-900 dark:text-white", children: "AI Quiz" }), _jsx("p", { className: "mt-2 text-sm text-gray-500 dark:text-white/40", children: "AI \u7406\u89E3\u529B\u30AF\u30A4\u30BA\u3078\u3088\u3046\u3053\u305D" })] }), _jsxs("div", { className: "bg-white dark:bg-[#111] rounded-2xl shadow-md dark:shadow-none dark:border dark:border-white/8 p-8", children: [_jsx("h2", { className: "text-xl font-bold text-gray-800 dark:text-white/90 mb-6", children: "\u30ED\u30B0\u30A4\u30F3" }), _jsx("button", { type: "button", disabled: true, title: "Coming soon", className: "w-full py-3 rounded-xl font-bold border border-gray-300 dark:border-white/20 text-gray-400 dark:text-white/30 bg-gray-50 dark:bg-white/5 cursor-not-allowed mb-6", children: "Google \u3067\u30ED\u30B0\u30A4\u30F3\uFF08Coming soon\uFF09" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-white/60 mb-1", children: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: TEST_EMAIL, required: true, className: "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-[#1a1a1a] dark:text-white dark:placeholder-white/30 text-gray-900 placeholder-gray-400\n                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent\n                  transition-all duration-150" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-white/60 mb-1", children: "\u30D1\u30B9\u30EF\u30FC\u30C9" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: TEST_PASSWORD, required: true, className: "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-[#1a1a1a] dark:text-white dark:placeholder-white/30 text-gray-900 placeholder-gray-400\n                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent\n                  transition-all duration-150" })] }), error && (_jsx("p", { className: "text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg", children: error })), _jsxs("p", { className: "text-xs text-gray-400 dark:text-white/25", children: ["\u30C6\u30B9\u30C8\u7528: ", _jsx("span", { className: "font-mono", children: TEST_EMAIL }), " /", " ", _jsx("span", { className: "font-mono", children: TEST_PASSWORD })] }), _jsx("button", { type: "submit", disabled: isLoading, className: "cursor-pointer w-full py-3 rounded-xl font-bold text-white\n                bg-blue-600 hover:bg-blue-700 active:bg-blue-800\n                disabled:bg-gray-300 disabled:cursor-not-allowed\n                transition-colors duration-150", children: isLoading ? "ログイン中..." : "ログイン" })] })] })] }) }));
}
