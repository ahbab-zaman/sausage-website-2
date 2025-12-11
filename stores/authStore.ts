import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UpdateAccountRequest, User } from "@/types/auth";
import { authApiClient } from "@/lib/api/authClient";

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  pendingEmail: string | null;
  pendingCustomerId: string | null;
  pendingOTP: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    telephone: string,
    countryCode: string,
    dob: string
  ) => Promise<{ success: boolean; error: string | null }>;
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

      login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const { user, error } = await authApiClient.login({ email, password });

          if (user) {
            set({ user, isLoading: false, error: null });
            return { success: true, error: null };
          }

          set({ isLoading: false, error });
          return { success: false, error };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Login failed";
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      signup: async (email, password, firstName, lastName, telephone, countryCode, dob) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApiClient.register({
            firstname: firstName,
            lastname: lastName,
            telephone,
            email,
            password,
            country_code: countryCode,
            dob
          });

          if (response.success) {
            // Store customer_id and OTP from registration response
            set({
              isLoading: false,
              error: null,
              pendingEmail: email,
              pendingCustomerId: response.data?.customer_id || null,
              pendingOTP: response.data?.otp || null
            });
            return { success: true, error: null };
          }

          set({ isLoading: false, error: response.error });
          return { success: false, error: response.error };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Registration failed";
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      verifyOTP: async (otp: string) => {
        const { pendingCustomerId } = get();

        if (!pendingCustomerId) {
          return { success: false, error: "No pending customer verification" };
        }

        set({ isLoading: true, error: null });

        try {
          const { success, error } = await authApiClient.verifyOTP({
            customer_id: pendingCustomerId,
            otp
          });

          if (success) {
            set({
              isLoading: false,
              error: null,
              pendingEmail: null,
              pendingCustomerId: null,
              pendingOTP: null
            });
            return { success: true, error: null };
          }

          set({ isLoading: false, error });
          return { success: false, error };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "OTP verification failed";
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      logout: () => {
        set({
          user: null,
          error: null,
          pendingEmail: null,
          pendingCustomerId: null,
          pendingOTP: null
        });
      },

      clearError: () => {
        set({ error: null });
      },

      fetchAccountInfo: async () => {
        set({ isLoading: true, error: null });

        try {
          const { success, data, error } = await authApiClient.getAccountInfo();

          if (success && data) {
            set({ user: data, isLoading: false });
            return { success: true, error: null };
          }

          set({ isLoading: false, error });
          return { success: false, error };
        } catch (error: any) {
          const msg = error.message || "Failed to load account";
          set({ isLoading: false, error: msg });
          return { success: false, error: msg };
        }
      },
      updateAccountInfo: async (data: any) => {
        set({ isLoading: true, error: null });

        try {
          const { success, error } = await authApiClient.updateAccount(data);

          if (success) {
            await get().fetchAccountInfo();
            set({ isLoading: false });
            return { success: true, error: null };
          }

          set({ isLoading: false, error });
          return { success: false, error };
        } catch (e: any) {
          const msg = e.message || "Account update failed";
          set({ isLoading: false, error: msg });
          return { success: false, error: msg };
        }
      }
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => {
        // Only use localStorage on client side
        if (typeof window !== "undefined") {
          return localStorage;
        }
        // Return a dummy storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {}
        };
      }),
      // Only persist user, pendingEmail, pendingCustomerId, and pendingOTP
      partialize: (state) => ({
        user: state.user,
        pendingEmail: state.pendingEmail,
        pendingCustomerId: state.pendingCustomerId,
        pendingOTP: state.pendingOTP
      })
    }
  )
);
