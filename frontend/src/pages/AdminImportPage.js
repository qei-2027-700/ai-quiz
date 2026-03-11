import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAdminClient } from "@ai-quiz/api-client";
function isMockMode() {
    const flag = import.meta.env?.VITE_USE_MOCK;
    return flag === "true" || flag === true;
}
export default function AdminImportPage() {
    const navigate = useNavigate();
    const [adminUser, setAdminUser] = useState("");
    const [adminPass, setAdminPass] = useState("");
    const [csvText, setCsvText] = useState("");
    const [isDryRun, setIsDryRun] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const adminClient = useMemo(() => createAdminClient({ basicAuth: { user: adminUser, pass: adminPass } }), [adminUser, adminPass]);
    const template = `course_id,prompt,difficulty,genre,choice_1,choice_2,choice_3,choice_4,correct_choice,explanation,question_id
00000000-0000-0000-0000-000000000001,"例: 生成AIが発展するとデータセンター需要が高まる理由は？",2,engineering,"端末内で完結するから","GPU計算/電力/冷却/ネットワークが必要だから","ストレージ需要が減るから","回線が不要になるから",2,"解説（任意）",
`;
    const submit = async (dryRun) => {
        setIsSubmitting(true);
        setError(null);
        setResult(null);
        try {
            const bytes = new TextEncoder().encode(csvText);
            const res = await adminClient.importQuestionsCsv({ csv: bytes, dryRun });
            setResult(res);
        }
        catch {
            setError("インポートに失敗しました（認証情報・API URL・CSV形式を確認してください）。");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const errors = result?.errors ?? [];
    return (_jsx("div", { className: "min-h-screen bg-gray-50 dark:bg-[#080808] py-10 px-4 pt-20", children: _jsxs("div", { className: "w-full max-w-3xl mx-auto space-y-6", children: [_jsxs("header", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-800 dark:text-white/90", children: "Admin: CSV \u30A4\u30F3\u30DD\u30FC\u30C8" }), _jsx("button", { onClick: () => navigate("/"), className: "cursor-pointer px-4 py-2 rounded-xl font-bold border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150", children: "\u623B\u308B" })] }), isMockMode() && (_jsx("div", { className: "text-sm bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-200 rounded-xl px-5 py-4", children: "\u73FE\u5728\u30E2\u30C3\u30AF\u30E2\u30FC\u30C9\uFF08`VITE_USE_MOCK=true`\uFF09\u306E\u305F\u3081\u3001Admin \u30A4\u30F3\u30DD\u30FC\u30C8\u306F\u30D0\u30C3\u30AF\u30A8\u30F3\u30C9\u304C\u5FC5\u8981\u3067\u3059\u3002" })), _jsxs("div", { className: "bg-white dark:bg-[#111] rounded-2xl shadow-md dark:shadow-none dark:border dark:border-white/8 p-6 space-y-4", children: [_jsx("h2", { className: "text-lg font-bold text-gray-700 dark:text-white/70", children: "\u8A8D\u8A3C\uFF08\u56FA\u5B9AAdmin\uFF09" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("label", { className: "block", children: [_jsx("span", { className: "text-xs font-semibold text-gray-500 dark:text-white/40", children: "ADMIN_USER" }), _jsx("input", { value: adminUser, onChange: (e) => setAdminUser(e.target.value), className: "mt-1 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm text-gray-800 dark:text-white/90 focus:ring-2 focus:ring-blue-500 focus:outline-none" })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "text-xs font-semibold text-gray-500 dark:text-white/40", children: "ADMIN_PASS" }), _jsx("input", { type: "password", value: adminPass, onChange: (e) => setAdminPass(e.target.value), className: "mt-1 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm text-gray-800 dark:text-white/90 focus:ring-2 focus:ring-blue-500 focus:outline-none" })] })] })] }), _jsxs("div", { className: "bg-white dark:bg-[#111] rounded-2xl shadow-md dark:shadow-none dark:border dark:border-white/8 p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsx("h2", { className: "text-lg font-bold text-gray-700 dark:text-white/70", children: "CSV" }), _jsx("button", { onClick: () => setCsvText(template), className: "cursor-pointer px-4 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150", children: "\u30C6\u30F3\u30D7\u30EC\u3092\u8CBC\u308A\u4ED8\u3051" })] }), _jsx("textarea", { value: csvText, onChange: (e) => setCsvText(e.target.value), rows: 12, className: "w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm font-mono text-gray-800 dark:text-white/80 focus:ring-2 focus:ring-blue-500 focus:outline-none", placeholder: "\u3053\u3053\u306BCSV\u3092\u8CBC\u308A\u4ED8\u3051\u308B\u304B\u3001\u30C6\u30F3\u30D7\u30EC\u3092\u4F7F\u7528\u3057\u3066\u304F\u3060\u3055\u3044" }), _jsxs("div", { className: "flex items-center justify-between flex-col sm:flex-row gap-3", children: [_jsxs("label", { className: "flex items-center gap-2 text-sm text-gray-700 dark:text-white/70", children: [_jsx("input", { type: "checkbox", checked: isDryRun, onChange: (e) => setIsDryRun(e.target.checked) }), "Dry-run\uFF08\u691C\u8A3C\u306E\u307F\uFF09"] }), _jsxs("div", { className: "flex gap-2 w-full sm:w-auto", children: [_jsx("button", { onClick: () => submit(true), disabled: isSubmitting || csvText.trim().length === 0, className: "cursor-pointer w-full sm:w-auto px-5 py-3 rounded-xl font-bold border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150", children: "Dry-run \u5B9F\u884C" }), _jsx("button", { onClick: () => submit(isDryRun), disabled: isSubmitting || csvText.trim().length === 0, className: "cursor-pointer w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150", children: isSubmitting ? "送信中..." : isDryRun ? "検証する" : "インポートする" })] })] }), error && (_jsx("div", { className: "text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4", children: error })), result && (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "text-sm text-gray-700 dark:text-white/70", children: ["\u4F5C\u6210\u4E88\u5B9A/\u4F5C\u6210\u6570: ", _jsx("span", { className: "font-bold", children: result.createdQuestions })] }), errors.length > 0 && (_jsxs("div", { className: "rounded-xl border border-red-500/20 bg-red-500/10 overflow-hidden", children: [_jsxs("div", { className: "px-4 py-2 text-xs font-bold text-red-600 dark:text-red-300", children: ["\u30A8\u30E9\u30FC\uFF08", errors.length, "\u4EF6\uFF09"] }), _jsx("div", { className: "divide-y divide-red-500/10", children: errors.slice(0, 30).map((e, idx) => (_jsxs("div", { className: "px-4 py-3 text-sm text-red-700 dark:text-red-200", children: [_jsxs("span", { className: "font-mono", children: ["row ", e.rowNumber] }), " / ", _jsx("span", { className: "font-mono", children: e.field }), ":", " ", e.message] }, idx))) }), errors.length > 30 && (_jsx("div", { className: "px-4 py-2 text-xs text-red-600 dark:text-red-300", children: "\u5148\u982D30\u4EF6\u306E\u307F\u8868\u793A\u3057\u3066\u3044\u307E\u3059" }))] })), errors.length === 0 && (_jsx("div", { className: "text-sm bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-200 rounded-xl px-5 py-4", children: "OK" }))] }))] })] }) }));
}
