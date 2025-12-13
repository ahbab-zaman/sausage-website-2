import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authApiClient } from "@/lib/api/authClient";
import { LoginRequest, User, UpdateAccountRequest, RegisterRequest } from "@/types/auth";

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  pendingCustomerId: string | null;
  pendingEmail: string | null;
  pendingOTP: string | null;
  login: (data: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  signup: (data: RegisterRequest) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (otp: string) => Promise<{ success: boolean; error?: string }>;
  fetchAccountInfo: () => Promise<{ success: boolean; error?: string }>;
  updateAccountInfo: (data: UpdateAccountRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      pendingCustomerId: null,
      pendingEmail: null,
      pendingOTP: null,

      login: async (data) => {
        set({ isLoading: true, error: null });
        const res = await authApiClient.login(data);

        if (res.success && res.data) {
          set({ user: res.data, isLoading: false });
          return { success: true };
        }

        const errMsg = res.error || "Login failed";
        set({ error: errMsg, isLoading: false });
        return { success: false, error: errMsg };
      },

      signup: async (data) => {
        set({ isLoading: true, error: null });
        const res = await authApiClient.register(data);
        set({ isLoading: false });

        if (!res.success) {
          set({ error: res.error });
          return { success: false, error: res.error };
        }

        set({
          pendingCustomerId: res.data?.customer_id || null,
          pendingEmail: res.data?.email || null,
          pendingOTP: res.data?.otp || null
        });

        return { success: true };
      },

      verifyOTP: async (otp) => {
        const customerId = get().pendingCustomerId;
        if (!customerId) {
          const errMsg = "No pending customer ID";
          set({ error: errMsg });
          return { success: false, error: errMsg };
        }

        set({ isLoading: true, error: null });
        const res = await authApiClient.verifyOTP({ customer_id: customerId, otp });

        if (res.success) {
          set({ pendingCustomerId: null, pendingEmail: null, pendingOTP: null, isLoading: false });
          return { success: true };
        } else {
          const errMsg = res.error || "OTP verification failed";
          set({ error: errMsg, isLoading: false });
          return { success: false, error: errMsg };
        }
      },

      fetchAccountInfo: async () => {
        set({ isLoading: true, error: null });
        const res = await authApiClient.getAccountInfo();

        if (res.success && res.data) {
          set({ user: res.data, isLoading: false });
          return { success: true };
        }

        const errMsg = res.error || "Unauthorized";
        set({ error: errMsg, isLoading: false });
        return { success: false, error: errMsg };
      },

      updateAccountInfo: async (data) => {
        set({ isLoading: true, error: null });
        const res = await authApiClient.updateAccount(data);

        if (res.success) {
          await get().fetchAccountInfo();
          set({ isLoading: false });
          return { success: true };
        }

        const errMsg = res.error || "Update failed";
        set({ error: errMsg, isLoading: false });
        return { success: false, error: errMsg };
      },

      logout: async () => {
        await authApiClient.logout();
        set({
          user: null,
          error: null,
          pendingCustomerId: null,
          pendingEmail: null,
          pendingOTP: null
        });
      },

      clearError: () => set({ error: null })
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
