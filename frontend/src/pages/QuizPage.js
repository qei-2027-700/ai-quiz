import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCourses, useQuiz, useQuizSettings } from "@ai-quiz/shared/hooks";
import { quizClient } from "@ai-quiz/api-client";
// QueryClient を QuizPage の外で生成してプロバイダーとして提供
const queryClient = new QueryClient();
export default function QuizPage() {
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(QuizPageInner, {}) }));
}
const GENRES = [
    { value: "", label: "すべて" },
    { value: "ai_basics", label: "AI基礎" },
    { value: "ai_services", label: "AIサービス" },
    { value: "engineering", label: "AIコーディング" },
];
const DIFFICULTIES = [
    { value: 0, label: "すべて" },
    { value: 1, label: "初級" },
    { value: 2, label: "中級" },
    { value: 3, label: "上級" },
];
function CourseSelectView({ courses, isLoading, errorMessage, selectedCourseId, onSelectCourseId, onStart, isStarting, }) {
    const [selected, setSelected] = useState({ genre: "", difficulty: 0 });
    return (_jsx("div", { className: "min-h-screen bg-gray-50 dark:bg-[#080808] flex items-start justify-center p-4 pt-16", children: _jsxs("div", { className: "w-full max-w-2xl bg-white dark:bg-[#111] rounded-2xl shadow-md dark:shadow-none dark:border dark:border-white/8 p-6 sm:p-8", children: [_jsx("h1", { className: "text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white/90 mb-8 text-center", children: "\u30AF\u30A4\u30BA\u30B3\u30FC\u30B9\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044" }), isLoading && (_jsx("div", { className: "mb-6 text-center text-gray-500 dark:text-white/40", children: "\u30B3\u30FC\u30B9\u3092\u8AAD\u307F\u8FBC\u307F\u4E2D..." })), errorMessage && (_jsx("div", { className: "mb-6 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3", children: errorMessage })), !isLoading && courses.length > 0 && (_jsxs("div", { className: "mb-8", children: [_jsx("p", { className: "text-sm font-semibold text-gray-500 dark:text-white/40 mb-3", children: "\u30B3\u30FC\u30B9" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: courses.map((c) => {
                                const isActive = selectedCourseId === c.id;
                                return (_jsxs("button", { onClick: () => onSelectCourseId(c.id), className: `
                      cursor-pointer text-left p-4 rounded-xl border-2 transition-all duration-150
                      ${isActive
                                        ? "border-blue-600 bg-blue-50 text-blue-800"
                                        : "border-gray-200 dark:border-white/10 text-gray-800 dark:text-white/70 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-white/5"}
                    `, children: [_jsx("p", { className: "font-bold text-sm mb-1", children: c.name }), c.description && (_jsx("p", { className: "text-xs text-gray-600 dark:text-white/40 leading-relaxed", children: c.description }))] }, c.id));
                            }) })] })), _jsxs("div", { className: "mb-6", children: [_jsx("p", { className: "text-sm font-semibold text-gray-500 dark:text-white/40 mb-3", children: "\u30B8\u30E3\u30F3\u30EB" }), _jsx("div", { className: "flex flex-wrap gap-2", children: GENRES.map((g) => {
                                const isActive = selected.genre === g.value;
                                return (_jsx("button", { onClick: () => setSelected((prev) => ({ ...prev, genre: g.value })), className: `
                    cursor-pointer px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-150
                    ${isActive
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/60 hover:border-blue-400"}
                  `, children: g.label }, g.value));
                            }) })] }), _jsxs("div", { className: "mb-10", children: [_jsx("p", { className: "text-sm font-semibold text-gray-500 dark:text-white/40 mb-3", children: "\u96E3\u6613\u5EA6" }), _jsx("div", { className: "flex flex-wrap gap-2", children: DIFFICULTIES.map((d) => {
                                const isActive = selected.difficulty === d.value;
                                return (_jsx("button", { onClick: () => setSelected((prev) => ({ ...prev, difficulty: d.value })), className: `
                    cursor-pointer px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-150
                    ${isActive
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/60 hover:border-blue-400"}
                  `, children: d.label }, d.value));
                            }) })] }), _jsx("div", { className: "flex justify-center", children: _jsx("button", { onClick: () => onStart({ courseId: selectedCourseId, filter: selected }), disabled: selectedCourseId.length === 0 || isStarting || isLoading, className: "cursor-pointer w-full sm:w-auto px-10 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-150", children: isStarting ? "開始中..." : "クイズを始める →" }) })] }) }));
}
// ---- Quiz Page Inner ----
function QuizPageInner() {
    const navigate = useNavigate();
    const [phase, setPhase] = useState("select");
    const [filter, setFilter] = useState({ genre: "", difficulty: 0 });
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [attemptId, setAttemptId] = useState("");
    const [isStarting, setIsStarting] = useState(false);
    const { courses, isLoading: coursesLoading, error: coursesError } = useCourses({ enabled: phase === "select" });
    useEffect(() => {
        if (selectedCourseId.length > 0)
            return;
        if (courses.length === 0)
            return;
        setSelectedCourseId(courses[0].id);
    }, [courses, selectedCourseId]);
    const quizFilter = { genre: filter.genre, difficulty: filter.difficulty };
    const { questions, isLoading, error } = useQuiz(attemptId, quizFilter, { enabled: phase !== "select" });
    const { autoAdvance } = useQuizSettings();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(() => {
        if (phase === "select")
            return;
        if (questions.length === 0)
            return;
        if (currentIndex < questions.length)
            return;
        setCurrentIndex(0);
    }, [currentIndex, phase, questions.length]);
    // Hooks はすべての early return より前に宣言する（Rules of Hooks）
    const submitAnswers = useCallback(async (latestAnswers) => {
        const answers = questions.map((q) => ({
            $typeName: "quiz.v2.UserAnswer",
            questionId: q.id,
            body: {
                case: "singleChoice",
                value: {
                    $typeName: "quiz.v2.SingleChoiceAnswer",
                    choiceId: latestAnswers[q.id] ?? "",
                },
            },
        }));
        setIsSubmitting(true);
        try {
            const response = await quizClient.submitAnswers({ attemptId, answers });
            navigate("/quiz/result", { state: { attemptId, response, questions } });
        }
        catch {
            alert("回答の送信に失敗しました。もう一度お試しください。");
        }
        finally {
            setIsSubmitting(false);
        }
    }, [attemptId, questions, navigate]);
    if (phase === "select") {
        return (_jsx(CourseSelectView, { courses: courses, isLoading: coursesLoading, errorMessage: coursesError ? "コースの取得に失敗しました。時間をおいて再度お試しください。" : null, selectedCourseId: selectedCourseId, onSelectCourseId: setSelectedCourseId, isStarting: isStarting, onStart: async ({ courseId, filter: selectedFilter }) => {
                setFilter(selectedFilter);
                setIsStarting(true);
                try {
                    const username = sessionStorage.getItem("username") ?? "Anonymous";
                    const res = await quizClient.startAttempt({ courseId, username });
                    setAttemptId(res.attemptId);
                    setPhase("quiz");
                }
                catch {
                    alert("クイズの開始に失敗しました。もう一度お試しください。");
                }
                finally {
                    setIsStarting(false);
                }
            } }));
    }
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#080808]", children: _jsx("p", { className: "text-lg text-gray-600 dark:text-white/50", children: "\u554F\u984C\u3092\u8AAD\u307F\u8FBC\u307F\u4E2D..." }) }));
    }
    if (error) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#080808]", children: _jsxs("p", { className: "text-lg text-red-500", children: ["\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F: ", error.message] }) }));
    }
    const total = questions.length;
    if (total === 0) {
        const genreLabel = GENRES.find((g) => g.value === filter.genre)?.label ?? "不明";
        const difficultyLabel = DIFFICULTIES.find((d) => d.value === filter.difficulty)?.label ?? "不明";
        return (_jsx("div", { className: "min-h-screen bg-gray-50 dark:bg-[#080808] flex items-start justify-center p-4 pt-16", children: _jsxs("div", { className: "w-full max-w-2xl bg-white dark:bg-[#111] rounded-2xl shadow-md dark:shadow-none dark:border dark:border-white/8 p-8", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-800 dark:text-white/90 mb-3", children: "\u554F\u984C\u304C\u3042\u308A\u307E\u305B\u3093" }), _jsx("p", { className: "text-sm text-gray-600 dark:text-white/50 mb-6 leading-relaxed", children: "\u9078\u629E\u3057\u305F\u6761\u4EF6\u306B\u8A72\u5F53\u3059\u308B\u554F\u984C\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u6761\u4EF6\u3092\u5909\u66F4\u3059\u308B\u304B\u3001\u6761\u4EF6\u3092\u30EA\u30BB\u30C3\u30C8\u3057\u3066\u518D\u53D6\u5F97\u3057\u3066\u304F\u3060\u3055\u3044\u3002" }), _jsxs("div", { className: "text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-5 py-4 mb-6", children: [_jsx("div", { className: "text-gray-500 dark:text-white/40 font-semibold mb-2", children: "\u73FE\u5728\u306E\u6761\u4EF6" }), _jsxs("div", { className: "text-gray-700 dark:text-white/70", children: ["\u30B8\u30E3\u30F3\u30EB: ", _jsx("span", { className: "font-bold", children: genreLabel }), _jsx("span", { className: "mx-2 text-gray-300 dark:text-white/15", children: "/" }), "\u96E3\u6613\u5EA6: ", _jsx("span", { className: "font-bold", children: difficultyLabel })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [_jsx("button", { onClick: () => {
                                    setFilter({ genre: "", difficulty: 0 });
                                    setCurrentIndex(0);
                                    setSelectedAnswers({});
                                }, className: "cursor-pointer w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150", children: "\u6761\u4EF6\u3092\u30EA\u30BB\u30C3\u30C8\u3057\u3066\u518D\u53D6\u5F97" }), _jsx("button", { onClick: () => {
                                    setAttemptId("");
                                    setCurrentIndex(0);
                                    setSelectedAnswers({});
                                    setPhase("select");
                                }, className: "cursor-pointer w-full sm:w-auto px-6 py-3 rounded-xl font-bold border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150", children: "\u6761\u4EF6\u3092\u9078\u3073\u76F4\u3059" }), _jsx("button", { onClick: () => navigate("/"), className: "cursor-pointer w-full sm:w-auto px-6 py-3 rounded-xl font-bold border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150", children: "\u30DB\u30FC\u30E0\u3078\u623B\u308B" })] })] }) }));
    }
    const currentQuestion = questions[currentIndex];
    const isLastQuestion = currentIndex === total - 1;
    const selectedChoiceId = currentQuestion ? selectedAnswers[currentQuestion.id] : undefined;
    const handleChoiceSelect = (choiceId) => {
        if (!currentQuestion)
            return;
        const next = { ...selectedAnswers, [currentQuestion.id]: choiceId };
        setSelectedAnswers(next);
        if (autoAdvance) {
            if (isLastQuestion) {
                submitAnswers(next);
            }
            else {
                setCurrentIndex((prev) => prev + 1);
            }
        }
    };
    const handleNext = async () => {
        if (!isLastQuestion) {
            setCurrentIndex((prev) => prev + 1);
            return;
        }
        await submitAnswers(selectedAnswers);
    };
    if (!currentQuestion) {
        return null;
    }
    const body = currentQuestion.body.case === "multipleChoice" ? currentQuestion.body.value : null;
    const choices = body ? body.choices : [];
    return (_jsx("div", { className: "min-h-screen bg-gray-50 dark:bg-[#080808] flex items-start justify-center p-4 pt-16", children: _jsxs("div", { className: "w-full max-w-2xl bg-white dark:bg-[#111] rounded-2xl shadow-md dark:shadow-none dark:border dark:border-white/8 p-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("span", { className: "text-sm font-medium text-gray-500 dark:text-white/40", children: ["\u554F\u984C ", currentIndex + 1, " / ", total] }), _jsx("div", { className: "flex gap-1", children: questions.map((_, i) => (_jsx("div", { className: `h-2 w-6 rounded-full ${i < currentIndex
                                    ? "bg-blue-500"
                                    : i === currentIndex
                                        ? "bg-blue-300"
                                        : "bg-gray-200 dark:bg-white/10"}` }, i))) })] }), _jsx("h2", { className: "text-xl font-bold text-gray-800 dark:text-white/90 mb-6 leading-relaxed min-h-[6.1rem]", children: currentQuestion.prompt }), _jsx("div", { className: "flex flex-col gap-3 mb-8", children: choices.map((choice) => {
                        const isSelected = selectedChoiceId === choice.id;
                        return (_jsx("button", { onClick: () => handleChoiceSelect(choice.id), className: `
                  cursor-pointer text-left px-5 py-4 rounded-xl border-2 font-medium transition-all duration-150
                  ${isSelected
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:border-white/10 dark:bg-white/3 dark:text-white/80 dark:hover:border-cyan-500/50 dark:hover:bg-white/5"}
                `, children: choice.text }, choice.id));
                    }) }), (!autoAdvance || isSubmitting) && (_jsx("div", { className: "flex justify-end", children: _jsx("button", { onClick: handleNext, disabled: !selectedChoiceId || isSubmitting, className: "\n                cursor-pointer px-8 py-3 rounded-xl font-bold text-white\n                bg-blue-600 hover:bg-blue-700 active:bg-blue-800\n                disabled:bg-gray-300 disabled:cursor-not-allowed\n                transition-colors duration-150\n              ", children: isSubmitting ? "送信中..." : isLastQuestion ? "回答する" : "次へ" }) }))] }) }));
}
