"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { MapPin, Plus, Trash2, Check, X, Loader2, RefreshCw } from "lucide-react";
import { useAddressStore } from "@/stores/addressStore";
import { AddAddressRequest } from "@/types/address";

export default function AddressManagement() {
  const {
    addresses,
    isLoading,
    error,
    addAddress,
    deleteAddress,
    setDefaultAddress,
    getAllAddresses,
    clearError
  } = useAddressStore();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<AddAddressRequest>({
    name: "",
    address_1: "",
    address_2: "",
    road: "",
    area: "",
    landmark: "",
    mobile: "",
    mobile_country_code: "+971",
    latitude: "",
    longitude: "",
    default: "0"
  });

  // Optimized: Load addresses only once on mount
  useEffect(() => {
    getAllAddresses();
  }, []);

  // Optimized: Memoized form reset
  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      address_1: "",
      address_2: "",
      road: "",
      area: "",
      landmark: "",
      mobile: "",
      mobile_country_code: "+971",
      latitude: "",
      longitude: "",
      default: "0"
    });
    setShowForm(false);
  }, []);

  // Optimized: Form validation
  const isFormValid = useMemo(() => {
    return (
      formData.name.trim() &&
      formData.address_1.trim() &&
      formData.address_2.trim() &&
      formData.road.trim() &&
      formData.area.trim() &&
      formData.mobile.trim() &&
      formData.latitude.trim() &&
      formData.longitude.trim()
    );
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!isFormValid) return;

    const result = await addAddress(formData);
    if (result.success) {
      resetForm();
    }
  }, [formData, isFormValid, addAddress, resetForm]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (window.confirm("Are you sure you want to delete this address?")) {
        await deleteAddress(id);
      }
    },
    [deleteAddress]
  );

  const handleSetDefault = useCallback(
    async (id: string) => {
      await setDefaultAddress(id);
    },
    [setDefaultAddress]
  );

  const handleRefresh = useCallback(async () => {
    await getAllAddresses();
  }, [getAllAddresses]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-gray-900">Delivery Addresses</h1>
            <p className="text-gray-600">Manage your delivery locations for seamless checkout</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="group flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 font-semibold text-white transition-all duration-300 hover:bg-gray-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50">
            <RefreshCw
              className={`h-4 w-4 transition-transform duration-500 ${
                isLoading ? "animate-spin" : "group-hover:rotate-180"
              }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="animate-slideDown mb-6 overflow-hidden rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-red-100 p-1">
                  <X className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-900">Error</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 transition-colors hover:text-red-600">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Add Address Button */}
        {!showForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="group flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 text-gray-600 transition-all duration-300 hover:border-black hover:bg-black hover:text-white hover:shadow-xl">
              <Plus className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
              <span className="font-semibold">Add New Address</span>
            </button>
          </div>
        )}

        {/* Add Address Form */}
        {showForm && (
          <div className="animate-slideDown mb-6 overflow-hidden rounded-xl bg-white shadow-lg">
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">New Address</h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 transition-colors hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none"
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.mobile_country_code}
                      onChange={(e) =>
                        setFormData({ ...formData, mobile_country_code: e.target.value })
                      }
                      className="w-20 rounded-lg border border-gray-300 px-3 py-2.5 text-center transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none"
                    />
                    <input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none"
                      placeholder="501234567"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Address Line 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address_1}
                    onChange={(e) => setFormData({ ...formData, address_1: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none"
                    placeholder="Building name, floor, unit number"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Address Line 2 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address_2}
                    onChange={(e) => setFormData({ ...formData, address_2: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none"
                    placeholder="Street name, additional details"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Road <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.road}
                    onChange={(e) => setFormData({ ...formData, road: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none"
                    placeholder="Sheikh Zayed Road"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none"
                    placeholder="Dubai Marina"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none"
                    placeholder="Near Metro Station"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Latitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none"
                    placeholder="25.2048"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Longitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none"
                    placeholder="55.2708"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !isFormValid}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-gray-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      <span>Save Address</span>
                    </>
                  )}
                </button>
                <button
                  onClick={resetForm}
                  disabled={isLoading}
                  className="rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all duration-300 hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && addresses.length === 0 && !showForm && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-black" />
              <p className="mt-4 font-medium text-gray-600">Loading addresses...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && addresses.length === 0 && !showForm && (
          <div className="animate-fadeIn rounded-xl border-2 border-dashed border-gray-300 bg-white p-16 text-center">
            <MapPin className="mx-auto h-20 w-20 text-gray-300" />
            <h3 className="mt-6 text-2xl font-semibold text-gray-900">No addresses yet</h3>
            <p className="mt-2 text-gray-600">Add your first delivery address to get started</p>
          </div>
        )}

        {/* Address Grid */}
        {addresses.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {addresses.map((address, index) => (
              <div
                key={address.address_id || `address-${index}`}
                className="group animate-fadeIn relative overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-2xl"
                style={{ animationDelay: `${index * 0.05}s` }}>
                {/* Default Badge */}
                {(address.default === 1 || address.default === "1") && (
                  <div className="absolute top-0 right-0 z-10">
                    <div className="flex h-14 w-14 items-start justify-end bg-gradient-to-br from-green-400 to-green-600 p-2 shadow-lg">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {/* Header */}
                  <div className="mb-4 flex items-start gap-3">
                    <div className="rounded-full bg-gradient-to-br from-black to-gray-700 p-2.5 shadow-md">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-gray-900">{address.name}</h3>
                      <p className="text-sm text-gray-600">
                        {address.mobile_country_code} {address.mobile}
                      </p>
                    </div>
                  </div>

                  {/* Address Details */}
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="line-clamp-1">{address.address_1}</p>
                    <p className="line-clamp-1">{address.address_2}</p>
                    <p className="line-clamp-1">
                      {address.road}, {address.area}
                    </p>
                    {address.landmark && (
                      <p className="flex items-center gap-1 text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">{address.landmark}</span>
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex gap-2">
                    {address.default !== 1 && address.default !== "1" && (
                      <button
                        onClick={() => handleSetDefault(address.address_id!)}
                        disabled={isLoading}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-gray-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50">
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            <span>Set Default</span>
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(address.address_id!)}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-2 rounded-lg border-2 border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-all duration-300 hover:border-red-600 hover:bg-red-600 hover:text-white hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50">
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Hover Border Effect */}
                <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-transparent transition-all duration-300 group-hover:border-black" />
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
}
