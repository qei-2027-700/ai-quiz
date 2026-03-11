import { useQuizSettings, useTheme } from "@ai-quiz/shared/hooks";

export default function SettingsPage() {
  const { autoAdvance, setAutoAdvance } = useQuizSettings();
  const { isDark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#080808] flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">設定</h1>

        <div className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-100 dark:border-white/8 divide-y divide-gray-100 dark:divide-white/8">
          {/* Auto advance */}
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="font-semibold text-gray-800 dark:text-white/90">選択後すぐに次の問題へ</p>
              <p className="text-sm text-gray-500 dark:text-white/40 mt-0.5">
                選択肢をクリックすると即座に次の問題へ進みます。オフにすると「次へ」ボタンが表示されます。
              </p>
            </div>
            <button
              role="switch"
              aria-checked={autoAdvance}
              onClick={() => setAutoAdvance(!autoAdvance)}
              className={`
                cursor-pointer relative inline-flex h-7 w-12 shrink-0 rounded-full border-2 border-transparent
                transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-blue-500 focus-visible:ring-offset-2
                ${autoAdvance ? "bg-blue-600" : "bg-gray-200"}
              `}
            >
              <span
                className={`
                  pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-sm
                  transition-transform duration-200
                  ${autoAdvance ? "translate-x-5" : "translate-x-0"}
                `}
              />
            </button>
          </div>

          {/* Theme toggle */}
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="font-semibold text-gray-800 dark:text-white/90">ダークモード</p>
              <p className="text-sm text-gray-500 dark:text-white/40 mt-0.5">
                画面全体の配色を切り替えます。
              </p>
            </div>
            <button
              role="switch"
              aria-checked={isDark}
              onClick={toggle}
              className={`
                cursor-pointer relative inline-flex h-7 w-12 shrink-0 rounded-full border-2 border-transparent
                transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-blue-500 focus-visible:ring-offset-2
                ${isDark ? "bg-blue-600" : "bg-gray-200"}
              `}
            >
              <span
                className={`
                  pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-sm
                  transition-transform duration-200
                  ${isDark ? "translate-x-5" : "translate-x-0"}
                `}
              />
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 dark:text-white/30 mt-4 px-1">
          設定はブラウザに保存されます。
        </p>
      </div>
    </div>
  );
}
