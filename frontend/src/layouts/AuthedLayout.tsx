import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@ai-quiz/shared/hooks";
import { Mascot } from "../components/Mascot";

export function AuthedLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggle } = useTheme();

  const handleLogout = () => {
    sessionStorage.removeItem("authed");
    navigate("/");
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-white dark:bg-[#111] border-b border-gray-100 dark:border-white/8 px-4 sm:px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate("/quiz")}
          className="cursor-pointer font-bold text-gray-800 dark:text-white/70 hover:text-cyan-500 dark:hover:text-white transition-colors duration-150"
        >
          AI Quiz
        </button>
        <div className="flex items-center gap-4 sm:gap-5">
          <button
            onClick={() => navigate("/ranking")}
            className={`cursor-pointer text-sm transition-colors duration-150 ${
              location.pathname === "/ranking"
                ? "text-cyan-500 font-semibold"
                : "text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white"
            }`}
          >
            ランキング
          </button>
          <button
            onClick={() => navigate("/profile")}
            className={`hidden sm:block cursor-pointer text-sm transition-colors duration-150 ${
              location.pathname === "/profile"
                ? "text-cyan-500 font-semibold"
                : "text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white"
            }`}
          >
            プロフィール
          </button>
          <button
            onClick={() => navigate("/settings")}
            className={`cursor-pointer text-sm transition-colors duration-150 ${
              location.pathname === "/settings"
                ? "text-cyan-500 font-semibold"
                : "text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white"
            }`}
          >
            設定
          </button>
          <button
            onClick={handleLogout}
            className="cursor-pointer text-sm text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white transition-colors duration-150"
          >
            ログアウト
          </button>
          <button
            onClick={toggle}
            aria-label="テーマ切り替え"
            className="cursor-pointer text-sm text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white transition-colors duration-150"
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>
      {location.pathname.startsWith("/quiz") && (
        <div className="fixed right-3 bottom-3 sm:right-6 sm:bottom-6 z-50 pointer-events-none">
          <Mascot sizePx={112} className="origin-bottom-right scale-75 sm:scale-100" />
        </div>
      )}
      <Outlet />
    </>
  );
}
