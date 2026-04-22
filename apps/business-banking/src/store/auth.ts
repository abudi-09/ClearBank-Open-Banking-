"use client";

import { create } from "zustand";

type UserRole = "VIEWER" | "APPROVER" | "ADMIN";
type CurrentUser = {
  id: string;
  email: string;
  companyName: string;
  role: UserRole;
};

type AuthState = {
  currentUser: CurrentUser | null;
  accessToken: string | null;
  setAuth: (payload: { currentUser: CurrentUser; accessToken: string }) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  accessToken: null,
  setAuth: ({ currentUser, accessToken }) => {
    localStorage.setItem("bb_access_token", accessToken);
    localStorage.setItem("bb_user", JSON.stringify(currentUser));
    set({ currentUser, accessToken });
  },
  clearAuth: () => {
    localStorage.removeItem("bb_access_token");
    localStorage.removeItem("bb_user");
    set({ currentUser: null, accessToken: null });
  },
}));

export function hydrateAuthStore() {
  const accessToken = localStorage.getItem("bb_access_token");
  const user = localStorage.getItem("bb_user");
  if (!accessToken || !user) return;
  useAuthStore.setState({ accessToken, currentUser: JSON.parse(user) as CurrentUser });
}
