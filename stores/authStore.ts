import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { LoginRequest, LoginResponse, UpdateAccountRequest, User } from "@/types/auth";
import { authApiClient } from "@/lib/api/authClient";

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  pendingEmail: string | null;
  pendingCustomerId: string | null;
  pendingOTP: string | null;

  login: (data: LoginRequest) => Promise<LoginResponse>;
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

      login: async ({ email, password }: LoginRequest): Promise<LoginResponse> => {
        try {
          const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
          });

          const json = await res.json();

          if (json.success) {
            // Map API user to your User type
            const user: User = {
              customer_id: json.data.customer_id,
              firstname: json.data.firstname,
              lastname: json.data.lastname,
              email: json.data.email,
              telephone: json.data.telephone,
              country_code: json.data.country_code,
              dob: json.data.dob,
              token: json.data.token
            };

            return {
              success: true,
              data: user
            };
          } else {
            return {
              success: false,
              error: json.error || "Login failed"
            };
          }
        } catch (err) {
          return {
            success: false,
            error: err instanceof Error ? err.message : "Login failed"
          };
        }
      },

      // ----------------- SIGNUP -----------------
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
            set({
              isLoading: false,
              error: null,
              pendingEmail: email,
              pendingCustomerId: response.data?.customer_id || null,
              pendingOTP: response.data?.otp || null
            });
            return { success: true, error: null };
          }

          set({ isLoading: false, error: response.error || "Registration failed" });
          return { success: false, error: response.error || "Registration failed" };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Registration failed";
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // ----------------- VERIFY OTP -----------------
      verifyOTP: async (otp: string) => {
        const { pendingCustomerId } = get();
        if (!pendingCustomerId) {
          return { success: false, error: "No pending customer verification" };
        }

        set({ isLoading: true, error: null });

        try {
          const response = await authApiClient.verifyOTP({ customer_id: pendingCustomerId, otp });

          if (response.success) {
            set({
              isLoading: false,
              error: null,
              pendingEmail: null,
              pendingCustomerId: null,
              pendingOTP: null
            });
            return { success: true, error: null };
          }

          set({ isLoading: false, error: response.error || "OTP verification failed" });
          return { success: false, error: response.error || "OTP verification failed" };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "OTP verification failed";
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // ----------------- LOGOUT -----------------
      logout: () => {
        set({
          user: null,
          error: null,
          pendingEmail: null,
          pendingCustomerId: null,
          pendingOTP: null
        });
      },

      clearError: () => set({ error: null }),

      // ----------------- FETCH ACCOUNT INFO -----------------
      fetchAccountInfo: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApiClient.getAccountInfo();

          if (response.success && response.data) {
            set({ user: response.data, isLoading: false });
            return { success: true, error: null };
          }

          set({ isLoading: false, error: response.error || "Failed to load account" });
          return { success: false, error: response.error || "Failed to load account" };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to load account";
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // ----------------- UPDATE ACCOUNT INFO -----------------
      updateAccountInfo: async (data: UpdateAccountRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApiClient.updateAccount(data);

          if (response.success) {
            await get().fetchAccountInfo();
            set({ isLoading: false });
            return { success: true, error: null };
          }

          set({ isLoading: false, error: response.error || "Account update failed" });
          return { success: false, error: response.error || "Account update failed" };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Account update failed";
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      }
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") return localStorage;
        return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
      }),
      partialize: (state) => ({
        user: state.user,
        pendingEmail: state.pendingEmail,
        pendingCustomerId: state.pendingCustomerId,
        pendingOTP: state.pendingOTP
      })
    }
  )
);
