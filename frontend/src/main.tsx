import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setAuthTokenGetter } from "@ai-quiz/api-client";
import { useAuthStore } from "@ai-quiz/shared/stores";
import "./index.css";
import { router } from "./router";

const queryClient = new QueryClient();

setAuthTokenGetter(() => useAuthStore.getState().accessToken);

// テーマを即時適用（FOUC防止）
const savedTheme = localStorage.getItem("theme") ?? "dark";
if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
