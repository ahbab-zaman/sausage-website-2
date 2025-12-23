"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useAddressStore } from "@/stores/addressStore";
import { AddAddressRequest, UpdateAddressRequest } from "@/types/address";
import { UpdateAccountRequest } from "@/types/auth";
import {
  User,
  MapPin,
  Plus,
  Trash2,
  Loader2,
  X,
  AlertCircle,
  Edit,
  ChevronDown,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { useSearchParams } from "next/navigation";

// Success Popup Component
function SuccessPopup({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20">
      <div className="animate-slideDown rounded-2xl border border-green-200 bg-white shadow-2xl">
        <div className="flex items-start gap-4 p-6">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Success!</h3>
            <p className="mt-1 text-sm text-gray-600">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="animate-shrink h-1 bg-green-500" />
      </div>
    </div>
  );
}

// Error Popup Component
function ErrorPopup({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20">
      <div className="animate-slideDown rounded-2xl border border-red-200 bg-white shadow-2xl">
        <div className="flex items-start gap-4 p-6">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Error Occurred</h3>
            <p className="mt-1 text-sm text-gray-600">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="animate-shrink h-1 bg-red-500" />
      </div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="animate-fadeIn absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="animate-scaleIn relative z-10 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mx-auto flex h-20 w-20 animate-bounce items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>
        <div className="mt-6 text-center">
          <h3 className="text-2xl font-bold text-gray-900">Delete Address?</h3>
          <p className="mt-3 text-base text-gray-600">
            Are you sure you want to delete this address? This action cannot be undone.
          </p>
        </div>
        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-full border-2 border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-all duration-300 hover:scale-105 hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100">
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </span>
            ) : (
              "Delete Address"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Account Info Skeleton
function AccountInfoSkeleton() {
  return (
    <div className="animate-fadeIn space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6 h-7 w-48 animate-pulse rounded bg-gray-200" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-64 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Address Skeleton
function AddressSkeleton() {
  return (
    <div className="animate-fadeIn space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-4">
              <div className="h-5 w-32 animate-pulse rounded bg-gray-300" />
              <div className="h-6 w-full max-w-md animate-pulse rounded bg-gray-300" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProfileClient() {
  const [activeTab, setActiveTab] = useState("account");
  const {
    user,
    fetchAccountInfo,
    updateAccountInfo,
    isLoading: authLoading,
    error: authError,
    clearError: clearAuthError
  } = useAuthStore();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const {
    addresses,
    isLoading: addressLoading,
    error: addressError,
    cities,
    addAddress,
    updateAddress,
    deleteAddress,
    getAllAddresses,
    fetchCities,
    clearError: clearAddressError
  } = useAddressStore();

  // Account update states
  const [showAccountUpdateForm, setShowAccountUpdateForm] = useState(false);
  const [accountFormData, setAccountFormData] = useState<UpdateAccountRequest>({
    firstname: "",
    lastname: "",
    email: "",
    telephone: "",
    country_code: "+971",
    dob: ""
  });

  // Address states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [addressFormData, setAddressFormData] = useState<AddAddressRequest>({
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

  // Popup states
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    fetchAccountInfo();
  }, [fetchAccountInfo]);

  useEffect(() => {
    if (activeTab === "address") {
      getAllAddresses();
      fetchCities();
    }
  }, [activeTab, getAllAddresses, fetchCities]);

  useEffect(() => {
    if (tabParam && (tabParam === "account" || tabParam === "address")) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (addressError) {
      setPopupMessage(addressError);
      setShowErrorPopup(true);
    }
  }, [addressError]);

  useEffect(() => {
    if (authError) {
      setPopupMessage(authError);
      setShowErrorPopup(true);
    }
  }, [authError]);

  // Initialize account form with user data
  const handleShowAccountUpdateForm = useCallback(() => {
    if (user) {
      setAccountFormData({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email || "",
        telephone: user.telephone || "",
        country_code: user.country_code || "+971",
        dob: user.dob || ""
      });
      setShowAccountUpdateForm(true);

      // Scroll to form
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    }
  }, [user]);

  const resetAccountForm = useCallback(() => {
    setAccountFormData({
      firstname: "",
      lastname: "",
      email: "",
      telephone: "",
      country_code: "+971",
      dob: ""
    });
    setShowAccountUpdateForm(false);
  }, []);

  const isAccountFormValid = useMemo(() => {
    return (
      accountFormData.firstname?.trim() &&
      accountFormData.lastname?.trim() &&
      accountFormData.email?.trim() &&
      accountFormData.telephone?.trim()
    );
  }, [accountFormData]);

  const handleAccountSubmit = useCallback(async () => {
    if (!isAccountFormValid) return;

    const result = await updateAccountInfo(accountFormData);

    if (result.success) {
      setPopupMessage("Account updated successfully!");
      setShowSuccessPopup(true);
      resetAccountForm();
      // No need to manually fetch - updateAccountInfo now returns fresh data
    } else {
      setPopupMessage(result.error || "Failed to update account");
      setShowErrorPopup(true);
    }
  }, [accountFormData, isAccountFormValid, updateAccountInfo, resetAccountForm]);

  const resetAddressForm = useCallback(() => {
    setAddressFormData({
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
    setShowAddressForm(false);
    setEditingAddressId(null);
  }, []);

  const isAddressFormValid = useMemo(() => {
    return (
      addressFormData.name.trim() &&
      addressFormData.address_1.trim() &&
      addressFormData.address_2.trim() &&
      addressFormData.road.trim() &&
      addressFormData.area.trim() &&
      addressFormData.mobile.trim() &&
      addressFormData.latitude.trim() &&
      addressFormData.longitude.trim()
    );
  }, [addressFormData]);

  const handleAddressSubmit = useCallback(async () => {
    if (!isAddressFormValid) return;

    if (editingAddressId) {
      const updateData: UpdateAddressRequest = {
        name: addressFormData.name,
        address_1: addressFormData.address_1,
        address_2: addressFormData.address_2,
        road: addressFormData.road,
        area: addressFormData.area,
        landmark: addressFormData.landmark,
        mobile: addressFormData.mobile,
        mobile_country_code: addressFormData.mobile_country_code,
        latitude: addressFormData.latitude,
        longitude: addressFormData.longitude,
        default: addressFormData.default
      };

      const result = await updateAddress(editingAddressId, updateData);
      if (result.success) {
        setPopupMessage("Address updated successfully!");
        setShowSuccessPopup(true);
        resetAddressForm();
      }
    } else {
      const result = await addAddress(addressFormData);
      if (result.success) {
        setPopupMessage("Address added successfully!");
        setShowSuccessPopup(true);
        resetAddressForm();
      }
    }
  }, [
    addressFormData,
    isAddressFormValid,
    editingAddressId,
    addAddress,
    updateAddress,
    resetAddressForm
  ]);

  const handleEditAddress = useCallback(
    (addressId: string) => {
      const address = addresses.find((addr) => addr.address_id === addressId);
      if (address) {
        setAddressFormData({
          name: address.name || "",
          address_1: address.address_1 || "",
          address_2: address.address_2 || "",
          road: address.road || "",
          area: address.area || "",
          landmark: address.landmark || "",
          mobile: address.mobile || "",
          mobile_country_code: address.mobile_country_code || "+971",
          latitude: address.latitude || "",
          longitude: address.longitude || "",
          default: address.default?.toString() || "0"
        });
        setEditingAddressId(addressId);
        setShowAddressForm(true);

        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
      }
    },
    [addresses]
  );

  const handleDeleteClick = useCallback((addressId: string) => {
    setAddressToDelete(addressId);
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (addressToDelete) {
      const result = await deleteAddress(addressToDelete);
      if (result.success) {
        setPopupMessage("Address deleted successfully!");
        setShowSuccessPopup(true);
        setDeleteModalOpen(false);
        setAddressToDelete(null);
      }
    }
  }, [addressToDelete, deleteAddress]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setAddressToDelete(null);
  }, []);

  const handleCloseError = useCallback(() => {
    setShowErrorPopup(false);
    clearAuthError();
    clearAddressError();
  }, [clearAuthError, clearAddressError]);

  const handleCloseSuccess = useCallback(() => {
    setShowSuccessPopup(false);
  }, []);

  const getCityName = (cityId: string) => {
    const city = cities.find((c) => c.id === cityId);
    return city ? city.name : cityId;
  };

  const activeCities = useMemo(() => {
    return cities.filter((city) => city.status === "1");
  }, [cities]);

  return (
    <div className="min-h-screen bg-white">
      {showErrorPopup && <ErrorPopup message={popupMessage} onClose={handleCloseError} />}
      {showSuccessPopup && <SuccessPopup message={popupMessage} onClose={handleCloseSuccess} />}

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isLoading={addressLoading}
      />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="animate-fadeIn mb-8 text-4xl font-bold text-black">My Account</h1>

        {/* Tabs */}
        <div className="mb-8 flex gap-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("account")}
            className={`group relative flex items-center gap-2 pb-4 text-base font-medium transition-all duration-300 ${
              activeTab === "account" ? "text-black" : "text-gray-400 hover:text-gray-600"
            }`}>
            <User className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            Account Information
            <div
              className={`absolute bottom-0 left-0 h-0.5 bg-black transition-all duration-300 ${
                activeTab === "account" ? "w-full" : "w-0"
              }`}
            />
          </button>
          <button
            onClick={() => setActiveTab("address")}
            className={`group relative flex items-center gap-2 pb-4 text-base font-medium transition-all duration-300 ${
              activeTab === "address" ? "text-black" : "text-gray-400 hover:text-gray-600"
            }`}>
            <MapPin className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            My Addresses
            <div
              className={`absolute bottom-0 left-0 h-0.5 bg-black transition-all duration-300 ${
                activeTab === "address" ? "w-full" : "w-0"
              }`}
            />
          </button>
        </div>

        {/* Account Information Tab */}
        {activeTab === "account" && (
          <>
            {authLoading && !user ? (
              <AccountInfoSkeleton />
            ) : user ? (
              <div className="animate-fadeIn space-y-6">
                {/* Update Account Form */}
                {showAccountUpdateForm && (
                  <div className="animate-slideDown rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-black">
                        Update Account Information
                      </h3>
                      <button
                        onClick={resetAccountForm}
                        className="text-gray-400 transition-all duration-300 hover:rotate-90 hover:text-gray-600">
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div
                        className="animate-fadeIn grid gap-4 sm:grid-cols-2"
                        style={{ animationDelay: "0.05s" }}>
                        <div>
                          <label className="mb-2 block text-sm text-gray-600">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={accountFormData.firstname}
                            onChange={(e) =>
                              setAccountFormData({ ...accountFormData, firstname: e.target.value })
                            }
                            placeholder="John"
                            className="w-full rounded border border-gray-300 px-4 py-2 transition-all duration-300 focus:border-black focus:shadow-md focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm text-gray-600">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={accountFormData.lastname}
                            onChange={(e) =>
                              setAccountFormData({ ...accountFormData, lastname: e.target.value })
                            }
                            placeholder="Doe"
                            className="w-full rounded border border-gray-300 px-4 py-2 transition-all duration-300 focus:border-black focus:shadow-md focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="animate-fadeIn" style={{ animationDelay: "0.1s" }}>
                        <label className="mb-2 block text-sm text-gray-600">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={accountFormData.email}
                          onChange={(e) =>
                            setAccountFormData({ ...accountFormData, email: e.target.value })
                          }
                          placeholder="john@example.com"
                          className="w-full rounded border border-gray-300 px-4 py-2 transition-all duration-300 focus:border-black focus:shadow-md focus:outline-none"
                        />
                      </div>

                      <div
                        className="animate-fadeIn grid gap-4 sm:grid-cols-4"
                        style={{ animationDelay: "0.15s" }}>
                        <div>
                          <label className="mb-2 block text-sm text-gray-600">Code</label>
                          <input
                            type="text"
                            value={accountFormData.country_code}
                            onChange={(e) =>
                              setAccountFormData({
                                ...accountFormData,
                                country_code: e.target.value
                              })
                            }
                            placeholder="+971"
                            className="w-full rounded border border-gray-300 px-4 py-2 transition-all duration-300 focus:border-black focus:shadow-md focus:outline-none"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="mb-2 block text-sm text-gray-600">
                            Mobile Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={accountFormData.telephone}
                            onChange={(e) =>
                              setAccountFormData({ ...accountFormData, telephone: e.target.value })
                            }
                            placeholder="501234567"
                            className="w-full rounded border border-gray-300 px-4 py-2 transition-all duration-300 focus:border-black focus:shadow-md focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="animate-fadeIn" style={{ animationDelay: "0.2s" }}>
                        <label className="mb-2 block text-sm text-gray-600">Date of Birth</label>
                        <input
                          type="text"
                          value={accountFormData.dob}
                          onChange={(e) =>
                            setAccountFormData({ ...accountFormData, dob: e.target.value })
                          }
                          placeholder="DD-MM-YYYY"
                          className="w-full rounded border border-gray-300 px-4 py-2 transition-all duration-300 focus:border-black focus:shadow-md focus:outline-none"
                        />
                      </div>

                      <div
                        className="animate-fadeIn flex gap-3 pt-4"
                        style={{ animationDelay: "0.25s" }}>
                        <button
                          onClick={handleAccountSubmit}
                          disabled={authLoading || !isAccountFormValid}
                          className="group flex flex-1 items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-gray-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100">
                          {authLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <span className="transition-transform duration-300 group-hover:scale-110">
                              Update Account
                            </span>
                          )}
                        </button>
                        <button
                          onClick={resetAccountForm}
                          disabled={authLoading}
                          className="rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-all duration-300 hover:scale-105 hover:border-gray-400 hover:bg-gray-50 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Current Information */}
                {!showAccountUpdateForm && (
                  <div className="rounded-lg border border-gray-200 bg-white p-6 transition-all duration-300 hover:shadow-lg">
                    <h2 className="mb-6 text-xl font-bold text-black">Current Information</h2>

                    <div className="space-y-6">
                      <div className="transform transition-all duration-300 hover:translate-x-1">
                        <label className="mb-2 block text-sm text-gray-500">Full Name</label>
                        <p className="text-base text-black">
                          {user.firstname} {user.lastname}
                        </p>
                      </div>

                      <div className="transform transition-all duration-300 hover:translate-x-1">
                        <label className="mb-2 block text-sm text-gray-500">Email Address</label>
                        <p className="text-base text-black">{user.email}</p>
                      </div>

                      <div className="transform transition-all duration-300 hover:translate-x-1">
                        <label className="mb-2 block text-sm text-gray-500">Mobile Number</label>
                        <p className="text-base text-black">
                          {user.country_code} {user.telephone}
                        </p>
                      </div>

                      {user.dob && (
                        <div className="transform transition-all duration-300 hover:translate-x-1">
                          <label className="mb-2 block text-sm text-gray-500">Date of Birth</label>
                          <p className="text-base text-black">{user.dob}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={handleShowAccountUpdateForm}
                        className="group flex items-center gap-2 rounded-full bg-gray-800 px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-gray-700 hover:shadow-lg">
                        <Edit className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                        Update Information
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </>
        )}

        {/* My Addresses Tab */}
        {activeTab === "address" && (
          <div className="space-y-6">
            <div className="animate-fadeIn flex items-center justify-between">
              <h2 className="text-2xl font-bold text-black">My Addresses</h2>
              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="group flex items-center gap-2 rounded-full bg-gray-800 px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-gray-700 hover:shadow-lg">
                  <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                  Add New Address
                </button>
              )}
            </div>

            {showAddressForm && (
              <div className="animate-slideDown rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-black">
                    {editingAddressId ? "Edit Address" : "Add New Address"}
                  </h3>
                  <button
                    onClick={resetAddressForm}
                    className="text-gray-400 transition-all duration-300 hover:rotate-90 hover:text-gray-600">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="animate-fadeIn" style={{ animationDelay: "0.05s" }}>
                    <label className="mb-2 block text-sm text-gray-600">
                      Address Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressFormData.name}
                      onChange={(e) =>
                        setAddressFormData({ ...addressFormData, name: e.target.value })
                      }
                      placeholder="e.g., Home Address, Office"
                      className="w-full rounded border border-gray-300 px-4 py-2 transition-all duration-300 focus:border-black focus:shadow-md focus:outline-none"
                    />
                  </div>

                  <div
                    className="animate-fadeIn grid gap-4 sm:grid-cols-4"
                    style={{ animationDelay: "0.1s" }}>
                    <div>
                      <label className="mb-2 block text-sm text-gray-600">Code</label>
                      <input
                        type="text"
                        value={addressFormData.mobile_country_code}
                        onChange={(e) =>
                          setAddressFormData({
                            ...addressFormData,
                            mobile_country_code: e.target.value
                          })
                        }
                        placeholder="+971"
                        className="w-full rounded border border-gray-300 px-4 py-2 transition-all duration-300 focus:border-black focus:shadow-md focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="mb-2 block text-sm text-gray-600">
                        Mobile <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={addressFormData.mobile}
                        onChange={(e) =>
                          setAddressFormData({ ...addressFormData, mobile: e.target.value })
                        }
                        placeholder="501234567"
                        className="w-full rounded border border-gray-300 px-4 py-2 transition-all duration-300 focus:border-black focus:shadow-md focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="animate-fadeIn" style={{ animationDelay: "0.15s" }}>
                    <label className="mb-2 block text-sm text-gray-600">
                      Flat, House, Street, Block <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressFormData.address_1}
                      onChange={(e) =>
                        setAddressFormData({ ...addressFormData, address_1: e.target.value })
                      }
                      placeholder="Villa 234, Palm Jumeirah"
                      className="w-full rounded border border-gray-300 px-4 py-2 transition-all duration-300 focus:border-black focus:shadow-md focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-gray-600">
                      City <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCityDropdown(!showCityDropdown)}
                        className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-left transition-all duration-300 hover:border-gray-400 focus:border-black focus:shadow-lg focus:outline-none">
                        <span className={addressFormData.area ? "text-black" : "text-gray-400"}>
                          {addressFormData.area
                            ? activeCities.find((c) => c.id === addressFormData.area)?.name
                            : "Select City"}
                        </span>
                      </button>
                      <ChevronDown
                        className={`pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400 transition-transform duration-300 ${
                          showCityDropdown ? "rotate-180" : ""
                        }`}
                      />

                      {showCityDropdown && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowCityDropdown(false)}
                          />
                          <div className="animate-slideDown absolute z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-2xl">
                            <div className="scrollbar-hide max-h-60 overflow-y-auto p-2">
                              {activeCities.map((city) => (
                                <button
                                  key={city.id}
                                  type="button"
                                  onClick={() => {
                                    setAddressFormData({ ...addressFormData, area: city.id });
                                    setShowCityDropdown(false);
                                  }}
                                  className={`w-full rounded-lg px-4 py-3 text-left transition-all duration-200 hover:bg-gray-100 ${
                                    addressFormData.area === city.id
                                      ? "bg-black text-white hover:bg-gray-800"
                                      : "text-gray-700"
                                  }`}>
                                  {city.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="animate-fadeIn" style={{ animationDelay: "0.2s" }}>
                    <label className="mb-2 block text-sm text-gray-600">
                      Zip Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressFormData.address_2}
                      onChange={(e) =>
                        setAddressFormData({ ...addressFormData, address_2: e.target.value })
                      }
                      placeholder="2222"
                      className="w-full rounded border border-gray-300 px-4 py-2 transition-all duration-300 focus:border-black focus:shadow-md focus:outline-none"
                    />
                  </div>

                  <div className="animate-fadeIn" style={{ animationDelay: "0.25s" }}>
                    <label className="mb-2 block text-sm text-gray-600">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressFormData.road}
                      onChange={(e) =>
                        setAddressFormData({ ...addressFormData, road: e.target.value })
                      }
                      placeholder="Bahrain"
                      className="w-full rounded border border-gray-300 px-4 py-2 transition-all duration-300 focus:border-black focus:shadow-md focus:outline-none"
                    />
                  </div>

                  <div className="animate-fadeIn" style={{ animationDelay: "0.3s" }}>
                    <label className="mb-2 block text-sm text-gray-600">Landmark</label>
                    <input
                      type="text"
                      value={addressFormData.landmark}
                      onChange={(e) =>
                        setAddressFormData({ ...addressFormData, landmark: e.target.value })
                      }
                      placeholder="Near Nakheel Mall"
                      className="w-full rounded border border-gray-300 px-4 py-2 transition-all duration-300 focus:border-black focus:shadow-md focus:outline-none"
                    />
                  </div>

                  <div
                    className="animate-fadeIn grid gap-4 sm:grid-cols-2"
                    style={{ animationDelay: "0.35s" }}>
                    <div>
                      <label className="mb-2 block text-sm text-gray-600">
                        Latitude <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={addressFormData.latitude}
                        onChange={(e) =>
                          setAddressFormData({ ...addressFormData, latitude: e.target.value })
                        }
                        placeholder="25.112543"
                        className="w-full rounded border border-gray-300 px-4 py-2 transition-all duration-300 focus:border-black focus:shadow-md focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-gray-600">
                        Longitude <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={addressFormData.longitude}
                        onChange={(e) =>
                          setAddressFormData({ ...addressFormData, longitude: e.target.value })
                        }
                        placeholder="55.138573"
                        className="w-full rounded border border-gray-300 px-4 py-2 transition-all duration-300 focus:border-black focus:shadow-md focus:outline-none"
                      />
                    </div>
                  </div>

                  <div
                    className="animate-fadeIn flex gap-3 pt-4"
                    style={{ animationDelay: "0.4s" }}>
                    <button
                      onClick={handleAddressSubmit}
                      disabled={addressLoading || !isAddressFormValid}
                      className="group flex flex-1 items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-gray-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100">
                      {addressLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {editingAddressId ? "Updating..." : "Saving..."}
                        </>
                      ) : (
                        <span className="transition-transform duration-300 group-hover:scale-110">
                          {editingAddressId ? "Update Address" : "Save Address"}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={resetAddressForm}
                      disabled={addressLoading}
                      className="rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-all duration-300 hover:scale-105 hover:border-gray-400 hover:bg-gray-50 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {addressLoading && addresses.length === 0 && !showAddressForm && <AddressSkeleton />}

            {!addressLoading && addresses.length === 0 && !showAddressForm && (
              <div className="animate-fadeIn rounded-lg border-2 border-dashed border-gray-300 bg-white p-16 text-center transition-all duration-300 hover:border-gray-400">
                <MapPin className="mx-auto h-16 w-16 animate-bounce text-gray-300" />
                <h3 className="mt-4 text-xl font-semibold text-gray-900">No addresses yet</h3>
                <p className="mt-2 text-gray-600">Add your first delivery address to get started</p>
              </div>
            )}

            {addresses.length > 0 && (
              <div className="space-y-4">
                {addresses.map((address, index) => (
                  <div
                    key={address.address_id}
                    className="group animate-fadeIn rounded-lg border border-gray-200 bg-gray-50 p-6 transition-all duration-300 hover:border-gray-400 hover:shadow-lg"
                    style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-4 transform transition-all duration-300 group-hover:translate-x-1">
                          <h3 className="mb-1 text-sm font-semibold text-black">Address</h3>
                          <p className="text-base text-gray-700">
                            {address.address_1}, {address.address_2}, {address.road},{" "}
                            {getCityName(address.area)}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                          <div className="transform transition-all duration-300 hover:translate-x-1">
                            <p className="text-gray-500">City</p>
                            <p className="text-black">{getCityName(address.area)}</p>
                          </div>
                          <div className="transform transition-all duration-300 hover:translate-x-1">
                            <p className="text-gray-500">Zip Code</p>
                            <p className="text-black">{address.address_2}</p>
                          </div>
                          <div className="transform transition-all duration-300 hover:translate-x-1">
                            <p className="text-gray-500">Country</p>
                            <p className="text-black">{address.road}</p>
                          </div>
                          <div className="transform transition-all duration-300 hover:translate-x-1">
                            <p className="text-gray-500">Phone</p>
                            <p className="text-black">
                              {address.mobile_country_code} {address.mobile}
                            </p>
                          </div>
                          {address.landmark && (
                            <div className="col-span-2 transform transition-all duration-300 hover:translate-x-1">
                              <p className="text-gray-500">Landmark</p>
                              <p className="text-black">{address.landmark}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleEditAddress(address.address_id!)}
                          className="group/btn rounded bg-gray-800 p-2 text-white transition-all duration-300 hover:scale-110 hover:bg-gray-700 hover:shadow-lg">
                          <Edit className="h-4 w-4 transition-transform duration-300 group-hover/btn:rotate-12" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(address.address_id!)}
                          disabled={addressLoading}
                          className="group/btn rounded bg-red-100 p-2 text-red-600 transition-all duration-300 hover:scale-110 hover:bg-red-200 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100">
                          <Trash2 className="h-4 w-4 transition-transform duration-300 group-hover/btn:rotate-12" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          animation-fill-mode: both;
        }

        .animate-shrink {
          animation: shrink 5s linear;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
