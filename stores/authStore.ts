import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authApiClient } from "@/lib/api/authClient";
import { LoginRequest, User, UpdateAccountRequest } from "@/types/auth";

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  pendingEmail: string | null;
  pendingCustomerId: string | null;
  pendingOTP: string | null;

  login: (data: LoginRequest) => Promise<{ success: boolean; error: string | null }>;
  signup: (data: any) => Promise<{ success: boolean; error: string | null }>;
  verifyOTP: (otp: string) => Promise<{ success: boolean; error: string | null }>;
  logout: () => void;
  clearError: () => void;
  fetchAccountInfo: () => Promise<{ success: boolean; error: string | null }>;
  updateAccountInfo: (
    data: UpdateAccountRequest
  ) => Promise<{ success: boolean; error: string | null }>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      pendingEmail: null,
      pendingCustomerId: null,
      pendingOTP: null,

      login: async (data) => {
        set({ isLoading: true, error: null });
        const res = await authApiClient.login(data);
        if (res.user) set({ user: res.user });
        set({ isLoading: false, error: res.error ?? null });
        return { success: !!res.user, error: res.error ?? null };
      },

      signup: async (data) => {
        set({ isLoading: true, error: null });
        const res = await authApiClient.register(data);
        if (res.success) {
          set({
            pendingCustomerId: res.data?.customer_id ?? null,
            pendingOTP: res.data?.otp ?? null
          });
        } else set({ error: res.error });
        set({ isLoading: false });
        return { success: res.success, error: res.error };
      },

      verifyOTP: async (otp) => {
        const customerId = get().pendingCustomerId;
        if (!customerId) return { success: false, error: "No pending customer ID" };
        set({ isLoading: true, error: null });
        const res = await authApiClient.verifyOTP({ customer_id: customerId, otp });
        if (res.success) set({ pendingCustomerId: null, pendingOTP: null, pendingEmail: null });
        set({ isLoading: false, error: res.error });
        return { success: res.success, error: res.error };
      },

      logout: () =>
        set({
          user: null,
          error: null,
          pendingCustomerId: null,
          pendingOTP: null,
          pendingEmail: null
        }),

      clearError: () => set({ error: null }),

      fetchAccountInfo: async () => {
        set({ isLoading: true, error: null });
        const res = await authApiClient.getAccountInfo();
        if (res.success && res.data) set({ user: res.data });
        set({ isLoading: false, error: res.error ?? null });
        return { success: res.success, error: res.error ?? null };
      },

      updateAccountInfo: async (data) => {
        set({ isLoading: true, error: null });
        const res = await authApiClient.updateAccount(data);
        if (res.success) await get().fetchAccountInfo();
        set({ isLoading: false, error: res.error ?? null });
        return { success: res.success, error: res.error ?? null };
      }
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      partialize: (state) => ({
        user: state.user,
        pendingCustomerId: state.pendingCustomerId,
        pendingOTP: state.pendingOTP,
        pendingEmail: state.pendingEmail
      })
    }
  )
);
