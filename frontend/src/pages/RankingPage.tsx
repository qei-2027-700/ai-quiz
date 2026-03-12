import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { quizClient } from "@ai-quiz/api-client";
import type { RankingEntry } from "@ai-quiz/api-client";

const TIER_COLOR: Record<string, string> = {
  S: "text-yellow-400",
  A: "text-green-400",
  B: "text-cyan-400",
  C: "text-gray-400",
};

const RANK_MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function RankingPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAuthed = sessionStorage.getItem("authed") === "1";

  useEffect(() => {
    quizClient
      .listRankings({ limit: 20 })
      .then((res) => setEntries(res.entries))
      .catch(() => setError("ランキングの取得に失敗しました"))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* subtle grid bg */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/8 max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="cursor-pointer font-mono text-sm text-[#00e5ff] hover:text-white transition-colors duration-150"
        >
          ← ai-quiz
        </button>
        {!isAuthed && (
          <button
            onClick={() => navigate("/login")}
            className="cursor-pointer whitespace-nowrap px-3 py-1.5 text-sm font-semibold rounded-lg border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-200"
          >
            ログイン →
          </button>
        )}
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        <h1
          className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          ランキング
        </h1>
        <p className="text-white/40 text-sm mb-10">直近 20 件の成績上位</p>

        {isLoading && (
          <div className="flex justify-center py-20">
            <span className="text-white/40 font-mono text-sm animate-pulse">Loading...</span>
          </div>
        )}

        {error && (
          <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-sm">
            {error}
          </div>
        )}

        {!isLoading && !error && entries.length === 0 && (
          <div className="text-center py-20 text-white/30 text-sm font-mono">
            まだ結果がありません。クイズに挑戦してみましょう！
          </div>
        )}

        {!isLoading && entries.length > 0 && (
          <div className="rounded-2xl border border-white/8 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[3rem_1fr_6rem_5rem] sm:grid-cols-[4rem_1fr_8rem_6rem_10rem] gap-0 bg-white/4 px-4 sm:px-6 py-3 text-xs text-white/30 font-mono uppercase tracking-widest">
              <span>Rank</span>
              <span>Player</span>
              <span className="text-right">Score</span>
              <span className="text-right">Tier</span>
              <span className="hidden sm:block text-right">Date</span>
            </div>

            {entries.map((e, i) => {
              const isTop3 = e.rank <= 3;
              return (
                <div
                  key={i}
                  className={`grid grid-cols-[3rem_1fr_6rem_5rem] sm:grid-cols-[4rem_1fr_8rem_6rem_10rem] gap-0 px-4 sm:px-6 py-4 border-t border-white/6 transition-colors duration-150 hover:bg-white/3 ${
                    isTop3 ? "bg-white/2" : ""
                  }`}
                >
                  {/* Rank */}
                  <span className="font-mono text-sm font-bold text-white/50 flex items-center">
                    {RANK_MEDAL[e.rank] ?? `#${e.rank}`}
                  </span>

                  {/* Username */}
                  <span className={`font-semibold text-sm truncate flex items-center ${isTop3 ? "text-white" : "text-white/70"}`}>
                    {e.username}
                  </span>

                  {/* Score */}
                  <span className="font-mono text-sm text-right flex items-center justify-end text-white/60">
                    {e.correctCount}
                    <span className="text-white/25 mx-0.5">/</span>
                    {e.totalCount}
                  </span>

                  {/* Tier */}
                  <span className={`font-black text-sm text-right flex items-center justify-end ${TIER_COLOR[e.tier] ?? "text-gray-400"}`}>
                    {e.tier}
                  </span>

                  {/* Date */}
                  <span className="hidden sm:flex items-center justify-end font-mono text-xs text-white/25">
                    {e.createdAt ? new Date(e.createdAt).toLocaleDateString("ja-JP") : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <button
            onClick={() => navigate(isAuthed ? "/quiz" : "/login")}
            className="cursor-pointer px-8 py-3.5 rounded-xl font-bold text-sm text-black transition-all duration-200 hover:scale-105 active:scale-100"
            style={{ background: "linear-gradient(135deg, #00e5ff, #0891b2)" }}
          >
            クイズに挑戦する →
          </button>
        </div>
      </main>
    </div>
  );
}
