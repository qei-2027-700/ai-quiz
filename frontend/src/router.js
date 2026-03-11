import { jsx as _jsx } from "react/jsx-runtime";
import { createBrowserRouter, redirect } from "react-router-dom";
import LandingPage from "./pages/landing/LandingPage";
import LoginPage from "./pages/LoginPage";
import AdminImportPage from "./pages/AdminImportPage";
import QuizPage from "./pages/QuizPage";
import QuizResultPage from "./pages/QuizResultPage";
import SettingsPage from "./pages/SettingsPage";
import RankingPage from "./pages/RankingPage";
import { AuthedLayout } from "./layouts/AuthedLayout";
// ── Auth helpers ─────────────────────────────────────────────
function isAuthed() {
    return sessionStorage.getItem("authed") === "1";
}
function requireAuth() {
    if (!isAuthed())
        throw redirect("/login");
    return null;
}
function requireGuest() {
    if (isAuthed())
        throw redirect("/quiz");
    return null;
}
// ── Router ───────────────────────────────────────────────────
export const router = createBrowserRouter([
    // Public
    { path: "/", loader: requireGuest, element: _jsx(LandingPage, { locale: "ja" }) },
    { path: "/en", loader: requireGuest, element: _jsx(LandingPage, { locale: "en" }) },
    { path: "/ranking", element: _jsx(RankingPage, {}) },
    { path: "/login", loader: requireGuest, element: _jsx(LoginPage, {}) },
    { path: "/admin", element: _jsx(AdminImportPage, {}) },
    // Protected — AuthedLayout provides header + Outlet
    {
        element: _jsx(AuthedLayout, {}),
        loader: requireAuth,
        children: [
            { path: "/quiz", element: _jsx(QuizPage, {}) },
            { path: "/quiz/result", element: _jsx(QuizResultPage, {}) },
            { path: "/settings", element: _jsx(SettingsPage, {}) },
        ],
    },
    // 404
    { path: "*", element: _jsx(LandingPage, { locale: "ja" }) },
]);
