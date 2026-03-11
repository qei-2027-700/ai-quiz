import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { quizClient } from "@ai-quiz/api-client";
import { InsightsStatus } from "@ai-quiz/api-client";
const TIER_STYLES = {
    S: "bg-yellow-400 text-yellow-900",
    A: "bg-green-500 text-white",
    B: "bg-blue-500 text-white",
    C: "bg-gray-400 text-white",
};
export default function QuizResultPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state;
    const [feedbackRevealed, setFeedbackRevealed] = useState(false);
    const [insights, setInsights] = useState(null);
    useEffect(() => {
        if (!state) {
            navigate("/quiz");
            return;
        }
    }, [state, navigate]);
    useEffect(() => {
        if (!state)
            return;
        let cancelled = false;
        let pollCount = 0;
        const maxPoll = 10;
        const fetchOnce = async () => {
            try {
                const res = await quizClient.getAttemptInsights({ attemptId: state.attemptId });
                if (cancelled)
                    return;
                setInsights(res);
                if (res.status === InsightsStatus.READY || res.status === InsightsStatus.FAILED) {
                    const timer = setTimeout(() => {
                        if (!cancelled)
                            setFeedbackRevealed(true);
                    }, 2800);
                    return () => clearTimeout(timer);
                }
            }
            catch {
                if (!cancelled) {
                    setInsights({
                        $typeName: "quiz.v2.GetAttemptInsightsResponse",
                        status: InsightsStatus.FAILED,
                        aiFeedback: "",
                        citations: [],
                        errorMessage: "AIフィードバックの取得に失敗しました。",
                    });
                    setFeedbackRevealed(true);
                }
            }
            pollCount++;
            if (pollCount >= maxPoll)
                return;
            setTimeout(fetchOnce, 800);
        };
        void fetchOnce();
        return () => {
            cancelled = true;
        };
    }, [state]);
    if (!state) {
        return null;
    }
    const { response, questions } = state;
    const result = response.result;
    const tierStyle = TIER_STYLES[result?.tier ?? "C"] ?? "bg-gray-400 text-white";
    const questionMap = {};
    for (const q of questions) {
        questionMap[q.id] = q;
    }
    return (_jsx("div", { className: "min-h-screen bg-gray-50 dark:bg-[#080808] py-10 px-4 pt-20", children: _jsxs("div", { className: "w-full max-w-2xl mx-auto space-y-6", children: [_jsxs("div", { className: "bg-white dark:bg-[#111] rounded-2xl shadow-md dark:shadow-none dark:border dark:border-white/8 p-8 flex flex-col items-center gap-4", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-800 dark:text-white/90", children: "\u30AF\u30A4\u30BA\u7D50\u679C" }), _jsxs("p", { className: "text-4xl font-extrabold text-gray-900 dark:text-white/90", children: [result?.correctCount ?? 0, " / ", result?.totalCount ?? 0, " \u554F\u6B63\u89E3"] }), _jsxs("span", { className: `
              text-3xl font-black px-6 py-2 rounded-full
              ${tierStyle}
            `, children: ["Tier ", result?.tier ?? "C"] })] }), (insights?.aiFeedback || insights?.status === InsightsStatus.PENDING) && (_jsx("div", { className: "bg-white dark:bg-[#111] rounded-2xl shadow-md dark:shadow-none dark:border dark:border-white/8 p-6", children: !feedbackRevealed || insights?.status === InsightsStatus.PENDING ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("h2", { className: "text-lg font-bold text-gray-700 dark:text-white/70", children: "AI \u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF" }), _jsx("span", { className: "text-xs font-medium text-blue-500", children: insights?.status === InsightsStatus.FAILED ? "失敗" : "分析中..." })] }), _jsxs("div", { className: "flex items-center gap-1 mb-4", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-blue-400 animate-bounce", style: { animationDelay: "0ms" } }), _jsx("span", { className: "w-2 h-2 rounded-full bg-blue-400 animate-bounce", style: { animationDelay: "150ms" } }), _jsx("span", { className: "w-2 h-2 rounded-full bg-blue-400 animate-bounce", style: { animationDelay: "300ms" } })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "h-4 bg-gray-200 dark:bg-white/10 rounded animate-pulse w-full" }), _jsx("div", { className: "h-4 bg-gray-200 dark:bg-white/10 rounded animate-pulse w-5/6" }), _jsx("div", { className: "h-4 bg-gray-200 dark:bg-white/10 rounded animate-pulse w-4/6" })] })] })) : (_jsxs(_Fragment, { children: [_jsx("h2", { className: "text-lg font-bold text-gray-700 dark:text-white/70 mb-3", children: "AI \u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF" }), _jsx("p", { className: `text-gray-600 dark:text-white/60 leading-relaxed whitespace-pre-wrap transition-all duration-700 ${feedbackRevealed ? "opacity-100" : "opacity-0"}`, children: insights?.aiFeedback || insights?.errorMessage || "" })] })) })), _jsxs("div", { className: "bg-white dark:bg-[#111] rounded-2xl shadow-md dark:shadow-none dark:border dark:border-white/8 p-6 space-y-5", children: [_jsx("h2", { className: "text-lg font-bold text-gray-700 dark:text-white/70", children: "\u554F\u984C\u3054\u3068\u306E\u7D50\u679C" }), (result?.questionResults ?? []).map((ar, i) => {
                            const question = questionMap[ar.questionId];
                            const correctChoiceId = ar.correct.case === "singleChoice" ? ar.correct.value.choiceId : "";
                            const choices = question?.body.case === "multipleChoice" || question?.body.case === "multiSelect"
                                ? question.body.value.choices
                                : [];
                            const correctChoice = choices.find((c) => c.id === correctChoiceId);
                            return (_jsx("div", { className: "border-t dark:border-white/8 pt-4 first:border-t-0 first:pt-0", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("span", { className: `mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${ar.isCorrect ? "bg-green-500" : "bg-red-500"}`, children: ar.isCorrect ? "○" : "✕" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("p", { className: "font-medium text-gray-800 dark:text-white/90 mb-1", children: ["Q", i + 1, ". ", question?.prompt ?? ar.questionId] }), !ar.isCorrect && correctChoice && (_jsxs("p", { className: "text-sm text-green-700 mb-1", children: ["\u6B63\u89E3: ", correctChoice.text] })), ar.explanation && (_jsx("p", { className: "text-sm text-gray-500 dark:text-white/40 leading-relaxed", children: ar.explanation }))] })] }) }, ar.questionId));
                        })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 justify-center pb-6", children: [_jsx("button", { onClick: () => navigate("/quiz"), className: "cursor-pointer px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150", children: "\u30B3\u30FC\u30B9\u3092\u9078\u3093\u3067\u518D\u30C1\u30E3\u30EC\u30F3\u30B8" }), _jsx("button", { onClick: () => navigate("/ranking"), className: "cursor-pointer px-8 py-3 rounded-xl font-bold border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150", children: "\u30E9\u30F3\u30AD\u30F3\u30B0\u3092\u898B\u308B" })] })] }) }));
}
