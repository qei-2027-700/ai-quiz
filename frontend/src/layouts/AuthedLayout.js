import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@ai-quiz/shared/hooks";
export function AuthedLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDark, toggle } = useTheme();
    const handleLogout = () => {
        sessionStorage.removeItem("authed");
        navigate("/");
    };
    return (_jsxs(_Fragment, { children: [_jsxs("header", { className: "fixed top-0 inset-x-0 z-50 bg-white dark:bg-[#111] border-b border-gray-100 dark:border-white/8 px-4 sm:px-6 py-3 flex items-center justify-between", children: [_jsx("button", { onClick: () => navigate("/quiz"), className: "cursor-pointer font-bold text-gray-800 dark:text-white/70 hover:text-blue-600 dark:hover:text-white transition-colors duration-150", children: "AI Quiz" }), _jsxs("div", { className: "flex items-center gap-4 sm:gap-5", children: [_jsx("button", { onClick: () => navigate("/ranking"), className: `cursor-pointer text-sm transition-colors duration-150 ${location.pathname === "/ranking"
                                    ? "text-blue-600 font-semibold"
                                    : "text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white"}`, children: "\u30E9\u30F3\u30AD\u30F3\u30B0" }), _jsx("button", { onClick: () => navigate("/settings"), className: `cursor-pointer text-sm transition-colors duration-150 ${location.pathname === "/settings"
                                    ? "text-blue-600 font-semibold"
                                    : "text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white"}`, children: "\u8A2D\u5B9A" }), _jsx("button", { onClick: handleLogout, className: "cursor-pointer text-sm text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white transition-colors duration-150", children: "\u30ED\u30B0\u30A2\u30A6\u30C8" }), _jsx("button", { onClick: toggle, "aria-label": "\u30C6\u30FC\u30DE\u5207\u308A\u66FF\u3048", className: "cursor-pointer text-sm text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white transition-colors duration-150", children: isDark ? "☀️" : "🌙" })] })] }), _jsx(Outlet, {})] }));
}
