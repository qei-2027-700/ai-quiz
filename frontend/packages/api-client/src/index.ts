// buf generate によって gen/ 配下に生成されたコードを re-export する
// このファイルは buf generate 後に自動更新される想定

// quiz_pb.ts には型・スキーマ・サービス定義が含まれる（protobuf-es v2）
export * from "./gen/quiz/v2/quiz_pb.js";
export * from "./gen/quiz/v2/admin_pb.js";

// Connect-RPC クライアント（quiz_pb.ts の GenService 形式の QuizService を使用）
import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { QuizService } from "./gen/quiz/v2/quiz_pb.js";
import { AdminService } from "./gen/quiz/v2/admin_pb.js";

function resolveBaseUrl(): string {
  // Vite (frontend) environment.
  const viteUrl = (import.meta as unknown as { env?: Record<string, unknown> }).env?.VITE_API_URL;
  if (typeof viteUrl === "string" && viteUrl.length > 0) return viteUrl;

  // Node/Vitest environment.
  const nodeUrl = (globalThis as unknown as { process?: { env?: Record<string, unknown> } }).process?.env?.VITE_API_URL;
  if (typeof nodeUrl === "string" && nodeUrl.length > 0) return nodeUrl;

  return "http://localhost:8081";
}

export function createQuizClient(baseUrl?: string) {
  const transport = createConnectTransport({
    baseUrl: baseUrl && baseUrl.length > 0 ? baseUrl : resolveBaseUrl(),
    interceptors: [
      (next) => async (req) => {
        const token = authTokenGetter?.();
        if (token && token.length > 0) {
          req.header.set("Authorization", `Bearer ${token}`);
        }
        return next(req);
      },
    ],
  });
  return createClient(QuizService, transport);
}

let authTokenGetter: (() => string | undefined) | undefined;

export function setAuthTokenGetter(getter: () => string | undefined) {
  authTokenGetter = getter;
}

export function createAdminClient(params: { baseUrl?: string; basicAuth?: { user: string; pass: string } } = {}) {
  const { baseUrl, basicAuth } = params;
  const transport = createConnectTransport({
    baseUrl: baseUrl && baseUrl.length > 0 ? baseUrl : resolveBaseUrl(),
    interceptors: [
      (next) => async (req) => {
        if (basicAuth && basicAuth.user.length > 0) {
          const raw = `${basicAuth.user}:${basicAuth.pass}`;
          const token = typeof btoa === "function"
            ? btoa(raw)
            : Buffer.from(raw, "utf-8").toString("base64");
          req.header.set("Authorization", `Basic ${token}`);
        }
        return next(req);
      },
    ],
  });
  return createClient(AdminService, transport);
}

import { createMockQuizClient } from "./mockClient.js";

function isMockMode(): boolean {
  const viteFlag = (import.meta as unknown as { env?: Record<string, unknown> }).env?.VITE_USE_MOCK;
  if (viteFlag === "true" || viteFlag === true) return true;
  const nodeFlag = (globalThis as unknown as { process?: { env?: Record<string, unknown> } }).process?.env?.VITE_USE_MOCK;
  return nodeFlag === "true";
}

const _mockInst = isMockMode() ? createMockQuizClient() : null;

export const quizClient = isMockMode()
  ? (_mockInst as unknown as ReturnType<typeof createQuizClient>)
  : createQuizClient();

interface AuthClient {
  register: (p: { email: string; password: string; name: string }) => Promise<{ accessToken: string; displayName: string }>;
  login: (p: { email: string; password: string }) => Promise<{ accessToken: string; displayName: string }>;
}

function createRealAuthClient(): AuthClient {
  const baseUrl = resolveBaseUrl();
  return {
    async register({ email, password, name }) {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text.trim() || "registration failed");
      }
      const data = await res.json() as { access_token: string; display_name: string };
      return { accessToken: data.access_token, displayName: data.display_name };
    },
    async login({ email, password }) {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text.trim() || "invalid email or password");
      }
      const data = await res.json() as { access_token: string; display_name: string };
      return { accessToken: data.access_token, displayName: data.display_name };
    },
  };
}

export const authClient: AuthClient = isMockMode()
  ? {
      register: (p) => _mockInst!.register(p) as Promise<{ accessToken: string; displayName: string }>,
      login: (p) => _mockInst!.login(p) as Promise<{ accessToken: string; displayName: string }>,
    }
  : createRealAuthClient();
