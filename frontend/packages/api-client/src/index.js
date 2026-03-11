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
function resolveBaseUrl() {
    // Vite (frontend) environment.
    const viteUrl = import.meta.env?.VITE_API_URL;
    if (typeof viteUrl === "string" && viteUrl.length > 0)
        return viteUrl;
    // Node/Vitest environment.
    const nodeUrl = globalThis.process?.env?.VITE_API_URL;
    if (typeof nodeUrl === "string" && nodeUrl.length > 0)
        return nodeUrl;
    return "http://localhost:8081";
}
export function createQuizClient(baseUrl) {
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
let authTokenGetter;
export function setAuthTokenGetter(getter) {
    authTokenGetter = getter;
}
export function createAdminClient(params = {}) {
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
function isMockMode() {
    const viteFlag = import.meta.env?.VITE_USE_MOCK;
    if (viteFlag === "true" || viteFlag === true)
        return true;
    const nodeFlag = globalThis.process?.env?.VITE_USE_MOCK;
    return nodeFlag === "true";
}
export const quizClient = isMockMode()
    ? createMockQuizClient()
    : createQuizClient();
