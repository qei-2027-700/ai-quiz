import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { quizClient } from "@ai-quiz/api-client";
import { InsightsStatus } from "@ai-quiz/api-client";
import type { SubmitAnswersResponse, Question, QuestionResult, GetAttemptInsightsResponse } from "@ai-quiz/api-client";

const TIER_STYLES: Record<string, string> = {
  S: "bg-yellow-400 text-yellow-900",
  A: "bg-green-500 text-white",
  B: "bg-blue-500 text-white",
  C: "bg-gray-400 text-white",
};

export default function QuizResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { attemptId: string; response: SubmitAnswersResponse; questions: Question[] } | null;

  const [feedbackRevealed, setFeedbackRevealed] = useState<boolean>(false);
  const [insights, setInsights] = useState<GetAttemptInsightsResponse | null>(null);

  useEffect(() => {
    if (!state) {
      navigate("/quiz");
      return;
    }
  }, [state, navigate]);

  useEffect(() => {
    if (!state) return;
    let cancelled = false;
    let pollCount = 0;
    const maxPoll = 10;

    const fetchOnce = async () => {
      try {
        const res = await quizClient.getAttemptInsights({ attemptId: state.attemptId });
        if (cancelled) return;
        setInsights(res);
        if (res.status === InsightsStatus.READY || res.status === InsightsStatus.FAILED) {
          const timer = setTimeout(() => {
            if (!cancelled) setFeedbackRevealed(true);
          }, 2800);
          return () => clearTimeout(timer);
        }
      } catch {
        if (!cancelled) {
          setInsights({
            $typeName: "quiz.v2.GetAttemptInsightsResponse" as const,
            status: InsightsStatus.FAILED,
            aiFeedback: "",
            citations: [],
            errorMessage: "AIフィードバックの取得に失敗しました。",
          });
          setFeedbackRevealed(true);
        }
      }
      pollCount++;
      if (pollCount >= maxPoll) return;
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

  const questionMap: Record<string, Question> = {};
  for (const q of questions) {
    questionMap[q.id] = q;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#080808] py-10 px-4 pt-20">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Score header */}
        <div className="bg-white dark:bg-[#111] rounded-2xl shadow-md dark:shadow-none dark:border dark:border-white/8 p-8 flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">クイズ結果</h1>
          <p className="text-4xl font-extrabold text-gray-900 dark:text-white/90">
            {result?.correctCount ?? 0} / {result?.totalCount ?? 0} 問正解
          </p>
          <span
            className={`
              text-3xl font-black px-6 py-2 rounded-full
              ${tierStyle}
            `}
          >
            Tier {result?.tier ?? "C"}
          </span>
        </div>

        {/* AI Feedback */}
        {(insights?.aiFeedback || insights?.status === InsightsStatus.PENDING) && (
          <div className="bg-white dark:bg-[#111] rounded-2xl shadow-md dark:shadow-none dark:border dark:border-white/8 p-6">
            {!feedbackRevealed || insights?.status === InsightsStatus.PENDING ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg font-bold text-gray-700 dark:text-white/70">AI フィードバック</h2>
                  <span className="text-xs font-medium text-blue-500">
                    {insights?.status === InsightsStatus.FAILED ? "失敗" : "分析中..."}
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-4">
                  <span
                    className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-white/10 rounded animate-pulse w-full" />
                  <div className="h-4 bg-gray-200 dark:bg-white/10 rounded animate-pulse w-5/6" />
                  <div className="h-4 bg-gray-200 dark:bg-white/10 rounded animate-pulse w-4/6" />
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-gray-700 dark:text-white/70 mb-3">AI フィードバック</h2>
                <p
                  className={`text-gray-600 dark:text-white/60 leading-relaxed whitespace-pre-wrap transition-all duration-700 ${
                    feedbackRevealed ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {insights?.aiFeedback || insights?.errorMessage || ""}
                </p>
              </>
            )}
          </div>
        )}

        {/* Per-question results */}
        <div className="bg-white dark:bg-[#111] rounded-2xl shadow-md dark:shadow-none dark:border dark:border-white/8 p-6 space-y-5">
          <h2 className="text-lg font-bold text-gray-700 dark:text-white/70">問題ごとの結果</h2>
          {(result?.questionResults ?? []).map((ar: QuestionResult, i: number) => {
            const question = questionMap[ar.questionId];
            const correctChoiceId = ar.correct.case === "singleChoice" ? ar.correct.value.choiceId : "";
            const choices =
              question?.body.case === "multipleChoice" || question?.body.case === "multiSelect"
                ? question.body.value.choices
                : [];
            const correctChoice = choices.find((c) => c.id === correctChoiceId);
            return (
              <div key={ar.questionId} className="border-t dark:border-white/8 pt-4 first:border-t-0 first:pt-0">
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      ar.isCorrect ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {ar.isCorrect ? "○" : "✕"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 dark:text-white/90 mb-1">
                      Q{i + 1}. {question?.prompt ?? ar.questionId}
                    </p>
                    {!ar.isCorrect && correctChoice && (
                      <p className="text-sm text-green-700 mb-1">
                        正解: {correctChoice.text}
                      </p>
                    )}
                    {ar.explanation && (
                      <p className="text-sm text-gray-500 dark:text-white/40 leading-relaxed">{ar.explanation}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pb-6">
          <button
            onClick={() => navigate("/quiz")}
            className="cursor-pointer px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150"
          >
            コースを選んで再チャレンジ
          </button>
          <button
            onClick={() => navigate("/ranking")}
            className="cursor-pointer px-8 py-3 rounded-xl font-bold border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150"
          >
            ランキングを見る
          </button>
        </div>
      </div>
    </div>
  );
}
