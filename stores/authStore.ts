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
  isAuthenticated: () => boolean;
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

      /**
       * Login user
       * Creates server-side session, token remains the same
       */
      login: async (data) => {
        set({ isLoading: true, error: null });

        try {
          const res = await authApiClient.login(data);

          if (res.success && res.data) {
            // Create user object (no token - using session cookies)
            const user: User = {
              customer_id: res.data.customer_id,
              firstname: res.data.firstname,
              lastname: res.data.lastname,
              email: res.data.email,
              telephone: res.data.telephone,
              country_code: res.data.country_code,
              dob: res.data.dob
            };

            set({ user, isLoading: false });
            console.log("✅ User state updated:", user.email);

            return { success: true };
          }

          const errMsg = res.error || "Login failed";
          set({ error: errMsg, isLoading: false });
          return { success: false, error: errMsg };
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "Login failed";
          set({ error: errMsg, isLoading: false });
          return { success: false, error: errMsg };
        }
      },

      /**
       * Sign up new user
       */
      signup: async (data) => {
        set({ isLoading: true, error: null });

        try {
          const res = await authApiClient.register(data);
          set({ isLoading: false });

          if (!res.success) {
            set({ error: res.error });
            return { success: false, error: res.error };
          }

          // Store pending registration data for OTP verification
          set({
            pendingCustomerId: res.data?.customer_id || null,
            pendingEmail: res.data?.email || null,
            pendingOTP: res.data?.otp || null
          });

          return { success: true };
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "Registration failed";
          set({ error: errMsg, isLoading: false });
          return { success: false, error: errMsg };
        }
      },

      /**
       * Verify OTP after registration
       */
      verifyOTP: async (otp) => {
        const customerId = get().pendingCustomerId;

        if (!customerId) {
          const errMsg = "No pending customer ID";
          set({ error: errMsg });
          return { success: false, error: errMsg };
        }

        set({ isLoading: true, error: null });

        try {
          const res = await authApiClient.verifyOTP({
            customer_id: customerId,
            otp
          });

          if (res.success) {
            // Clear pending data after successful verification
            set({
              pendingCustomerId: null,
              pendingEmail: null,
              pendingOTP: null,
              isLoading: false
            });
            return { success: true };
          } else {
            const errMsg = res.error || "OTP verification failed";
            set({ error: errMsg, isLoading: false });
            return { success: false, error: errMsg };
          }
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "OTP verification failed";
          set({ error: errMsg, isLoading: false });
          return { success: false, error: errMsg };
        }
      },

      /**
       * Fetch current account information
       */
      fetchAccountInfo: async () => {
        set({ isLoading: true, error: null });

        try {
          const res = await authApiClient.getAccountInfo();

          if (res.success && res.data) {
            const user: User = {
              customer_id: res.data.customer_id,
              firstname: res.data.firstname,
              lastname: res.data.lastname,
              email: res.data.email,
              telephone: res.data.telephone,
              country_code: res.data.country_code,
              dob: res.data.dob
            };

            set({ user, isLoading: false });
            return { success: true };
          }

          const errMsg = res.error || "Failed to fetch account info";
          set({ error: errMsg, isLoading: false, user: null });
          return { success: false, error: errMsg };
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "Failed to fetch account";
          set({ error: errMsg, isLoading: false, user: null });
          return { success: false, error: errMsg };
        }
      },

      /**
       * Update account information
       */
      updateAccountInfo: async (data) => {
        set({ isLoading: true, error: null });

        try {
          const res = await authApiClient.updateAccount(data);

          if (res.success) {
            // Fetch updated account info
            await get().fetchAccountInfo();
            set({ isLoading: false });
            return { success: true };
          }

          const errMsg = res.error || "Update failed";
          set({ error: errMsg, isLoading: false });
          return { success: false, error: errMsg };
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "Update failed";
          set({ error: errMsg, isLoading: false });
          return { success: false, error: errMsg };
        }
      },

      /**
       * Logout user
       */
      logout: async () => {
        try {
          await authApiClient.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          // Clear all user state
          set({
            user: null,
            error: null,
            pendingCustomerId: null,
            pendingEmail: null,
            pendingOTP: null
          });
          console.log("✅ User state cleared");
        }
      },

      /**
       * Check if user is authenticated
       */
      isAuthenticated: () => {
        const state = get();
        return authApiClient.isLoggedIn() && state.user !== null;
      },

      /**
       * Clear error message
       */
      clearError: () => set({ error: null })
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist user data, not loading/error states
      partialize: (state) => ({
        user: state.user,
        pendingCustomerId: state.pendingCustomerId,
        pendingEmail: state.pendingEmail,
        pendingOTP: state.pendingOTP
      })
    }
  )
);
