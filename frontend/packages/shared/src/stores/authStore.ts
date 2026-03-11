import { create } from "zustand";

export interface AuthState {
  accessToken?: string;
  setAccessToken: (token?: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: undefined,
  setAccessToken: (token) => set({ accessToken: token }),
  clear: () => set({ accessToken: undefined }),
}));

