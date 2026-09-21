import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../services/api";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      loading: true,
      error: null,

      // check login on app load
      checkAuth: async () => {
        try {
          const res = await api.get("/auth/me");
          set({ user: res.data.user, loading: false });
        } catch (err) {
          set({ user: null, loading: false });
        }
      },

      login: async (email, password) => {
        try {
          const res = await api.post("/auth/login", { email, password });
          console.log("data from backend in auth store login \n", res.data);
          set({ user: res.data.user, error: null });
          return true;
        } catch (err) {
          set({ error: err.response?.data?.message || "Login failed" });
          return false;
        }
      },

      signup: async (name, email, password) => {
        try {
          const res = await api.post("/auth/signup", {
            name,
            email,
            password,
          });
          set({ user: res.data.user, error: null });
          return true;
        } catch (err) {
          set({ error: err.response?.data?.message || "Signup failed" });
          return false;
        }
      },

      logout: async () => {
        await api.post("/auth/logout");
        set({ user: null });
      },
    }),
    {
      name: 'auth-storage', 
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }), // only persist the user object, not loading state
    }
  )
);
