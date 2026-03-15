import { createBrowserRouter, redirect } from "react-router-dom";
import LandingPage from "./pages/landing/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminImportPage from "./pages/AdminImportPage";
import QuizPage from "./pages/QuizPage";
import QuizResultPage from "./pages/QuizResultPage";
import SettingsPage from "./pages/SettingsPage";
import RankingPage from "./pages/RankingPage";
import { AuthedLayout } from "./layouts/AuthedLayout";

// ── Auth helpers ─────────────────────────────────────────────

function isAuthed(): boolean {
  return sessionStorage.getItem("authed") === "1";
}

function requireAuth() {
  if (!isAuthed()) throw redirect("/login");
  return null;
}

function requireGuest() {
  if (isAuthed()) throw redirect("/quiz");
  return null;
}

// ── Router ───────────────────────────────────────────────────

export const router = createBrowserRouter([
  // Public
  { path: "/",        loader: requireGuest, element: <LandingPage locale="ja" /> },
  { path: "/en",      loader: requireGuest, element: <LandingPage locale="en" /> },
  { path: "/ranking", element: <RankingPage /> },
  { path: "/login",    loader: requireGuest, element: <LoginPage /> },
  { path: "/register", loader: requireGuest, element: <RegisterPage /> },
  { path: "/admin",   element: <AdminImportPage /> },

  // Protected — AuthedLayout provides header + Outlet
  {
    element: <AuthedLayout />,
    loader: requireAuth,
    children: [
      { path: "/quiz",        element: <QuizPage /> },
      { path: "/quiz/result", element: <QuizResultPage /> },
      { path: "/settings",    element: <SettingsPage /> },
    ],
  },

  // 404
  { path: "*", element: <LandingPage locale="ja" /> },
]);
