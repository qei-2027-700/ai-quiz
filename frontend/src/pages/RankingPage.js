import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { quizClient } from "@ai-quiz/api-client";
const TIER_COLOR = {
    S: "text-yellow-400",
    A: "text-green-400",
    B: "text-blue-400",
    C: "text-gray-400",
};
const RANK_MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };
export default function RankingPage() {
    const navigate = useNavigate();
    const [entries, setEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const isAuthed = sessionStorage.getItem("authed") === "1";
    useEffect(() => {
        quizClient
            .listRankings({ limit: 20 })
            .then((res) => setEntries(res.entries))
            .catch(() => setError("ランキングの取得に失敗しました"))
            .finally(() => setIsLoading(false));
    }, []);
    return (_jsxs("div", { className: "min-h-screen bg-[#080808] text-white", children: [_jsx("div", { className: "fixed inset-0 pointer-events-none", style: {
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                } }), _jsxs("header", { className: "relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/8 max-w-4xl mx-auto", children: [_jsx("button", { onClick: () => navigate("/"), className: "cursor-pointer font-mono text-sm text-[#00e5ff] hover:text-white transition-colors duration-150", children: "\u2190 ai-quiz" }), !isAuthed && (_jsx("button", { onClick: () => navigate("/login"), className: "cursor-pointer whitespace-nowrap px-3 py-1.5 text-sm font-semibold rounded-lg border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-200", children: "\u30ED\u30B0\u30A4\u30F3 \u2192" }))] }), _jsxs("main", { className: "relative z-10 max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-16", children: [_jsx("h1", { className: "text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight", style: { fontFamily: "'Syne', sans-serif" }, children: "\u30E9\u30F3\u30AD\u30F3\u30B0" }), _jsx("p", { className: "text-white/40 text-sm mb-10", children: "\u76F4\u8FD1 20 \u4EF6\u306E\u6210\u7E3E\u4E0A\u4F4D" }), isLoading && (_jsx("div", { className: "flex justify-center py-20", children: _jsx("span", { className: "text-white/40 font-mono text-sm animate-pulse", children: "Loading..." }) })), error && (_jsx("div", { className: "text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-sm", children: error })), !isLoading && !error && entries.length === 0 && (_jsx("div", { className: "text-center py-20 text-white/30 text-sm font-mono", children: "\u307E\u3060\u7D50\u679C\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u30AF\u30A4\u30BA\u306B\u6311\u6226\u3057\u3066\u307F\u307E\u3057\u3087\u3046\uFF01" })), !isLoading && entries.length > 0 && (_jsxs("div", { className: "rounded-2xl border border-white/8 overflow-hidden", children: [_jsxs("div", { className: "grid grid-cols-[3rem_1fr_6rem_5rem] sm:grid-cols-[4rem_1fr_8rem_6rem_10rem] gap-0 bg-white/4 px-4 sm:px-6 py-3 text-xs text-white/30 font-mono uppercase tracking-widest", children: [_jsx("span", { children: "Rank" }), _jsx("span", { children: "Player" }), _jsx("span", { className: "text-right", children: "Score" }), _jsx("span", { className: "text-right", children: "Tier" }), _jsx("span", { className: "hidden sm:block text-right", children: "Date" })] }), entries.map((e, i) => {
                                const isTop3 = e.rank <= 3;
                                return (_jsxs("div", { className: `grid grid-cols-[3rem_1fr_6rem_5rem] sm:grid-cols-[4rem_1fr_8rem_6rem_10rem] gap-0 px-4 sm:px-6 py-4 border-t border-white/6 transition-colors duration-150 hover:bg-white/3 ${isTop3 ? "bg-white/2" : ""}`, children: [_jsx("span", { className: "font-mono text-sm font-bold text-white/50 flex items-center", children: RANK_MEDAL[e.rank] ?? `#${e.rank}` }), _jsx("span", { className: `font-semibold text-sm truncate flex items-center ${isTop3 ? "text-white" : "text-white/70"}`, children: e.username }), _jsxs("span", { className: "font-mono text-sm text-right flex items-center justify-end text-white/60", children: [e.correctCount, _jsx("span", { className: "text-white/25 mx-0.5", children: "/" }), e.totalCount] }), _jsx("span", { className: `font-black text-sm text-right flex items-center justify-end ${TIER_COLOR[e.tier] ?? "text-gray-400"}`, children: e.tier }), _jsx("span", { className: "hidden sm:flex items-center justify-end font-mono text-xs text-white/25", children: e.createdAt ? new Date(e.createdAt).toLocaleDateString("ja-JP") : "—" })] }, i));
                            })] })), _jsx("div", { className: "mt-10 flex justify-center", children: _jsx("button", { onClick: () => navigate(isAuthed ? "/quiz" : "/login"), className: "cursor-pointer px-8 py-3.5 rounded-xl font-bold text-sm text-black transition-all duration-200 hover:scale-105 active:scale-100", style: { background: "linear-gradient(135deg, #00e5ff, #0891b2)" }, children: "\u30AF\u30A4\u30BA\u306B\u6311\u6226\u3059\u308B \u2192" }) })] })] }));
}
