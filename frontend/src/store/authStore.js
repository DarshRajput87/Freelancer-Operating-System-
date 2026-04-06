import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authAPI.login(credentials);
          localStorage.setItem('fos_token', res.token);
          set({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false });
          return res;
        } catch (err) {
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authAPI.register(data);
          localStorage.setItem('fos_token', res.token);
          set({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false });
          return res;
        } catch (err) {
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try { await authAPI.logout(); } catch (_) {}
        localStorage.removeItem('fos_token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const res = await authAPI.getMe();
          set({ user: res.data, isAuthenticated: true });
        } catch (_) {
          get().logout();
        }
      },

      updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),
      clearError: () => set({ error: null }),
    }),
    { name: 'fos-auth', partialize: (s) => ({ token: s.token, user: s.user, isAuthenticated: s.isAuthenticated }) }
  )
);

export default useAuthStore;
