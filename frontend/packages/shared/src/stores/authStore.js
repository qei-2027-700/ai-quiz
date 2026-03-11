import { create } from "zustand";
export const useAuthStore = create((set) => ({
    accessToken: undefined,
    setAccessToken: (token) => set({ accessToken: token }),
    clear: () => set({ accessToken: undefined }),
}));
