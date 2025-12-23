import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { addressApiClient } from "@/lib/api/addressClient";
import { Address, AddAddressRequest, UpdateAddressRequest } from "@/types/address";

interface City {
  id: string;
  name: string;
  status: string;
}

interface AddressStore {
  addresses: Address[];
  cities: City[];
  currentAddress: Address | null;
  isLoading: boolean;
  error: string | null;

  addAddress: (
    data: AddAddressRequest
  ) => Promise<{ success: boolean; error?: string; addressId?: number }>;
  updateAddress: (
    addressId: string,
    data: UpdateAddressRequest
  ) => Promise<{ success: boolean; error?: string }>;
  getAddress: (addressId: string) => Promise<{ success: boolean; error?: string }>;
  deleteAddress: (addressId: string) => Promise<{ success: boolean; error?: string }>;
  getAllAddresses: () => Promise<{ success: boolean; error?: string }>;
  setDefaultAddress: (addressId: string) => Promise<{ success: boolean; error?: string }>;
  fetchCities: () => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
  clearCurrentAddress: () => void;
}

export const useAddressStore = create<AddressStore>()(
  persist(
    (set, get) => ({
      addresses: [],
      cities: [],
      currentAddress: null,
      isLoading: false,
      error: null,

      /**
       * Fetch available cities
       */
      fetchCities: async () => {
        // Don't set loading if cities already exist
        if (get().cities.length > 0) {
          return { success: true };
        }

        set({ isLoading: true, error: null });

        try {
          const res = await addressApiClient.getCities();

          if (res.success && res.data) {
            console.log("✅ Cities fetched successfully:", res.data.length);
            set({ cities: res.data, isLoading: false });
            return { success: true };
          }

          const errMsg = res.error || "Failed to fetch cities";
          set({ error: errMsg, isLoading: false });
          return { success: false, error: errMsg };
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "Failed to fetch cities";
          set({ error: errMsg, isLoading: false });
          return { success: false, error: errMsg };
        }
      },

      /**
       * Add a new address
       */
      addAddress: async (data) => {
        set({ isLoading: true, error: null });

        try {
          const res = await addressApiClient.addAddress(data);

          if (res.success && res.data) {
            console.log("✅ Address added successfully:", res.data.address_id);

            // Refresh addresses list
            await get().getAllAddresses();

            set({ isLoading: false });
            return { success: true, addressId: res.data.address_id };
          }

          const errMsg = res.error || "Failed to add address";
          set({ error: errMsg, isLoading: false });
          return { success: false, error: errMsg };
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "Failed to add address";
          set({ error: errMsg, isLoading: false });
          return { success: false, error: errMsg };
        }
      },

      /**
       * Update an existing address
       */
      updateAddress: async (addressId, data) => {
        set({ isLoading: true, error: null });

        try {
          const res = await addressApiClient.updateAddress(addressId, data);

          if (res.success) {
            console.log("✅ Address updated successfully:", addressId);

            // Refresh addresses list
            await get().getAllAddresses();

            set({ isLoading: false });
            return { success: true };
          }

          const errMsg = res.error || "Failed to update address";
          set({ error: errMsg, isLoading: false });
          return { success: false, error: errMsg };
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "Failed to update address";
          set({ error: errMsg, isLoading: false });
          return { success: false, error: errMsg };
        }
      },

      /**
       * Get a specific address by ID
       */
      getAddress: async (addressId) => {
        set({ isLoading: true, error: null });

        try {
          const res = await addressApiClient.getAddress(addressId);

          if (res.success && res.data) {
            console.log("✅ Address fetched successfully:", addressId);

            set({
              currentAddress: res.data,
              isLoading: false
            });
            return { success: true };
          }

          const errMsg = res.error || "Failed to fetch address";
          set({ error: errMsg, isLoading: false, currentAddress: null });
          return { success: false, error: errMsg };
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "Failed to fetch address";
          set({ error: errMsg, isLoading: false, currentAddress: null });
          return { success: false, error: errMsg };
        }
      },

      /**
       * Delete an address
       */
      deleteAddress: async (addressId) => {
        set({ isLoading: true, error: null });

        try {
          const res = await addressApiClient.deleteAddress(addressId);

          if (res.success) {
            console.log("✅ Address deleted successfully:", addressId);

            // Remove from local state
            set((state) => ({
              addresses: state.addresses.filter((addr) => addr.address_id !== addressId),
              currentAddress:
                state.currentAddress?.address_id === addressId ? null : state.currentAddress,
              isLoading: false
            }));

            return { success: true };
          }

          const errMsg = res.error || "Failed to delete address";
          set({ error: errMsg, isLoading: false });
          return { success: false, error: errMsg };
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "Failed to delete address";
          set({ error: errMsg, isLoading: false });
          return { success: false, error: errMsg };
        }
      },

      /**
       * Get all addresses for the current user
       */
      getAllAddresses: async () => {
        set({ isLoading: true, error: null });

        try {
          const res = await addressApiClient.getAllAddresses();

          if (res.success) {
            // Ensure we always have an array
            const addressList = Array.isArray(res.data) ? res.data : [];
            console.log("✅ Addresses fetched successfully:", addressList.length);

            set({
              addresses: addressList,
              isLoading: false
            });
            return { success: true };
          }

          const errMsg = res.error || "Failed to fetch addresses";
          set({ error: errMsg, isLoading: false, addresses: [] });
          return { success: false, error: errMsg };
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "Failed to fetch addresses";
          set({ error: errMsg, isLoading: false, addresses: [] });
          return { success: false, error: errMsg };
        }
      },

      /**
       * Set an address as default
       */
      setDefaultAddress: async (addressId) => {
        set({ isLoading: true, error: null });

        try {
          // First, get the current address details
          const getRes = await addressApiClient.getAddress(addressId);

          if (!getRes.success || !getRes.data) {
            const errMsg = getRes.error || "Failed to fetch address";
            set({ error: errMsg, isLoading: false });
            return { success: false, error: errMsg };
          }

          // Update with default: "1"
          const updateData: UpdateAddressRequest = {
            name: getRes.data.name,
            address_1: getRes.data.address_1,
            address_2: getRes.data.address_2,
            road: getRes.data.road,
            area: getRes.data.area,
            landmark: getRes.data.landmark,
            mobile: getRes.data.mobile,
            mobile_country_code: getRes.data.mobile_country_code,
            latitude: getRes.data.latitude,
            longitude: getRes.data.longitude,
            default: "1"
          };

          const res = await addressApiClient.updateAddress(addressId, updateData);

          if (res.success) {
            console.log("✅ Default address set successfully:", addressId);

            // Refresh addresses list
            await get().getAllAddresses();

            set({ isLoading: false });
            return { success: true };
          }

          const errMsg = res.error || "Failed to set default address";
          set({ error: errMsg, isLoading: false });
          return { success: false, error: errMsg };
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "Failed to set default address";
          set({ error: errMsg, isLoading: false });
          return { success: false, error: errMsg };
        }
      },

      /**
       * Clear error message
       */
      clearError: () => set({ error: null }),

      /**
       * Clear current address
       */
      clearCurrentAddress: () => set({ currentAddress: null })
    }),
    {
      name: "address-storage",
      storage: createJSONStorage(() => localStorage),
      // Persist addresses and cities
      partialize: (state) => ({
        addresses: state.addresses,
        cities: state.cities,
        currentAddress: state.currentAddress
      })
    }
  )
);
