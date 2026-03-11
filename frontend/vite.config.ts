import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    // Local workspace packages can change frequently; pre-bundling them tends to go stale.
    exclude: ["@ai-quiz/shared", "@ai-quiz/api-client"],
  },
  server: {
    port: 5173,
    host: "127.0.0.1",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@ai-quiz/shared": path.resolve(__dirname, "./packages/shared/src"),
      "@ai-quiz/api-client": path.resolve(__dirname, "./packages/api-client/src"),
    },
  },
});
