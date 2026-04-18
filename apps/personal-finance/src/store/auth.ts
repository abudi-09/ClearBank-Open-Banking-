"use client";

import { create } from "zustand";

type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  kycStatus: "PENDING" | "VERIFIED" | "REJECTED";
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
    localStorage.setItem("cb_access_token", accessToken);
    localStorage.setItem("cb_user", JSON.stringify(currentUser));
    set({ currentUser, accessToken });
  },
  clearAuth: () => {
    localStorage.removeItem("cb_access_token");
    localStorage.removeItem("cb_user");
    set({ currentUser: null, accessToken: null });
  },
}));

export function hydrateAuthStore(): void {
  const accessToken = localStorage.getItem("cb_access_token");
  const user = localStorage.getItem("cb_user");
  if (!accessToken || !user) {
    return;
  }
  useAuthStore.setState({
    accessToken,
    currentUser: JSON.parse(user) as CurrentUser,
  });
}
