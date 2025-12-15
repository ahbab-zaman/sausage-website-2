// import React, { useState, useEffect } from "react";
// import { X, MapPin, Loader2, Phone, User, Navigation } from "lucide-react";
// import { useAddressStore } from "@/stores/addressStore";

// interface AddressModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   editAddress?: any;
//   onSuccess?: () => void;
// }

// export default function AddressModal({
//   isOpen,
//   onClose,
//   editAddress,
//   onSuccess
// }: AddressModalProps) {
//   const addressStore = useAddressStore();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState("");

//   const [formData, setFormData] = useState({
//     name: "",
//     address_1: "",
//     address_2: "",
//     road: "",
//     area: "",
//     landmark: "",
//     mobile: "",
//     mobile_country_code: "+880",
//     latitude: "",
//     longitude: "",
//     default: "0"
//   });

//   useEffect(() => {
//     if (editAddress) {
//       setFormData({
//         name: editAddress.name || "",
//         address_1: editAddress.address_1 || "",
//         address_2: editAddress.address_2 || "",
//         road: editAddress.road || "",
//         area: editAddress.area || "",
//         landmark: editAddress.landmark || "",
//         mobile: editAddress.mobile || "",
//         mobile_country_code: editAddress.mobile_country_code || "+880",
//         latitude: editAddress.latitude || "",
//         longitude: editAddress.longitude || "",
//         default: editAddress.default ? "1" : "0"
//       });
//     } else {
//       setFormData({
//         name: "",
//         address_1: "",
//         address_2: "",
//         road: "",
//         area: "",
//         landmark: "",
//         mobile: "",
//         mobile_country_code: "+880",
//         latitude: "",
//         longitude: "",
//         default: "0"
//       });
//     }
//     setError("");
//   }, [editAddress, isOpen]);

//   const handleChange = (field: string, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//     setError("");
//   };

//   const validateForm = () => {
//     if (!formData.name.trim()) {
//       setError("Name is required");
//       return false;
//     }
//     if (!formData.address_1.trim()) {
//       setError("Address line 1 is required");
//       return false;
//     }
//     if (!formData.road.trim()) {
//       setError("Road/Street is required");
//       return false;
//     }
//     if (!formData.area.trim()) {
//       setError("Area is required");
//       return false;
//     }
//     if (!formData.mobile.trim()) {
//       setError("Mobile number is required");
//       return false;
//     }
//     if (formData.mobile.length < 10) {
//       setError("Please enter a valid mobile number");
//       return false;
//     }
//     return true;
//   };

//   const getCurrentLocation = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setFormData((prev) => ({
//             ...prev,
//             latitude: position.coords.latitude.toString(),
//             longitude: position.coords.longitude.toString()
//           }));
//         },
//         (error) => {
//           console.error("Error getting location:", error);
//           setError("Unable to get location. Please enter manually.");
//         }
//       );
//     } else {
//       setError("Geolocation is not supported by your browser");
//     }
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) return;

//     setIsSubmitting(true);
//     setError("");

//     try {
//       let result;
//       if (editAddress) {
//         result = await addressStore.updateAddress(editAddress.address_id, formData);
//       } else {
//         result = await addressStore.addAddress(formData);
//       }

//       if (result.success) {
//         onSuccess?.();
//         onClose();
//       } else {
//         setError(result.error || "Failed to save address");
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to save address");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
//       <div className="animate-slideUp max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white">
//         {/* Header */}
//         <div className="flex items-center justify-between border-b border-gray-200 p-6">
//           <h2 className="flex items-center text-2xl font-bold text-gray-900">
//             <MapPin className="mr-3 text-black" size={28} />
//             {editAddress ? "Edit Address" : "Add New Address"}
//           </h2>
//           <button
//             onClick={onClose}
//             disabled={isSubmitting}
//             className="rounded-lg p-2 transition-colors hover:bg-gray-100">
//             <X size={24} />
//           </button>
//         </div>

//         {/* Form Content */}
//         <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
//           {error && (
//             <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4">
//               <span className="text-sm text-red-700">{error}</span>
//               <button onClick={() => setError("")} className="text-red-500">
//                 <X size={18} />
//               </button>
//             </div>
//           )}

//           <div className="space-y-5">
//             {/* Name / Label */}
//             <div>
//               <label className="mb-2 flex items-center text-sm font-medium text-gray-700">
//                 <User size={16} className="mr-2 text-gray-500" />
//                 Address Name / Label *
//               </label>
//               <input
//                 type="text"
//                 value={formData.name}
//                 onChange={(e) => handleChange("name", e.target.value)}
//                 placeholder="e.g., Home, Office, Mom's House"
//                 className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20"
//                 disabled={isSubmitting}
//               />
//               <p className="mt-1 text-xs text-gray-500">
//                 Give this address a name for easy identification
//               </p>
//             </div>

//             {/* Address Line 1 */}
//             <div>
//               <label className="mb-2 flex items-center text-sm font-medium text-gray-700">
//                 <MapPin size={16} className="mr-2 text-gray-500" />
//                 Address Line 1 *
//               </label>
//               <input
//                 type="text"
//                 value={formData.address_1}
//                 onChange={(e) => handleChange("address_1", e.target.value)}
//                 placeholder="House/Building number, Floor"
//                 className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20"
//                 disabled={isSubmitting}
//               />
//             </div>

//             {/* Address Line 2 */}
//             <div>
//               <label className="mb-2 flex items-center text-sm font-medium text-gray-700">
//                 <MapPin size={16} className="mr-2 text-gray-500" />
//                 Address Line 2
//               </label>
//               <input
//                 type="text"
//                 value={formData.address_2}
//                 onChange={(e) => handleChange("address_2", e.target.value)}
//                 placeholder="Apartment, Suite (Optional)"
//                 className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20"
//                 disabled={isSubmitting}
//               />
//             </div>

//             {/* Road/Street & Area */}
//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-700">
//                   Road/Street *
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.road}
//                   onChange={(e) => handleChange("road", e.target.value)}
//                   placeholder="Street name"
//                   className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20"
//                   disabled={isSubmitting}
//                 />
//               </div>
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-700">Area *</label>
//                 <input
//                   type="text"
//                   value={formData.area}
//                   onChange={(e) => handleChange("area", e.target.value)}
//                   placeholder="Area/Locality"
//                   className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20"
//                   disabled={isSubmitting}
//                 />
//               </div>
//             </div>

//             {/* Landmark */}
//             <div>
//               <label className="mb-2 flex items-center text-sm font-medium text-gray-700">
//                 <Navigation size={16} className="mr-2 text-gray-500" />
//                 Landmark
//               </label>
//               <input
//                 type="text"
//                 value={formData.landmark}
//                 onChange={(e) => handleChange("landmark", e.target.value)}
//                 placeholder="Nearby landmark for easy location"
//                 className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20"
//                 disabled={isSubmitting}
//               />
//             </div>

//             {/* Mobile Number */}
//             <div>
//               <label className="mb-2 flex items-center text-sm font-medium text-gray-700">
//                 <Phone size={16} className="mr-2 text-gray-500" />
//                 Mobile Number *
//               </label>
//               <div className="flex space-x-2">
//                 <select
//                   value={formData.mobile_country_code}
//                   onChange={(e) => handleChange("mobile_country_code", e.target.value)}
//                   className="rounded-lg border-2 border-gray-300 px-3 py-3 transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20"
//                   disabled={isSubmitting}>
//                   <option value="+880">🇧🇩 +880</option>
//                   <option value="+1">🇺🇸 +1</option>
//                   <option value="+44">🇬🇧 +44</option>
//                   <option value="+971">🇦🇪 +971</option>
//                   <option value="+91">🇮🇳 +91</option>
//                   <option value="+92">🇵🇰 +92</option>
//                 </select>
//                 <input
//                   type="tel"
//                   value={formData.mobile}
//                   onChange={(e) => handleChange("mobile", e.target.value.replace(/[^0-9]/g, ""))}
//                   placeholder="1234567890"
//                   className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-3 transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20"
//                   disabled={isSubmitting}
//                 />
//               </div>
//             </div>

//             {/* Location Coordinates */}
//             <div>
//               <label className="mb-2 flex items-center text-sm font-medium text-gray-700">
//                 <Navigation size={16} className="mr-2 text-gray-500" />
//                 Location Coordinates
//               </label>
//               <div className="grid grid-cols-2 gap-3">
//                 <input
//                   type="text"
//                   value={formData.latitude}
//                   onChange={(e) => handleChange("latitude", e.target.value)}
//                   placeholder="Latitude"
//                   className="rounded-lg border-2 border-gray-300 px-4 py-3 text-sm transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20"
//                   disabled={isSubmitting}
//                 />
//                 <input
//                   type="text"
//                   value={formData.longitude}
//                   onChange={(e) => handleChange("longitude", e.target.value)}
//                   placeholder="Longitude"
//                   className="rounded-lg border-2 border-gray-300 px-4 py-3 text-sm transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20"
//                   disabled={isSubmitting}
//                 />
//               </div>
//               <button
//                 type="button"
//                 onClick={getCurrentLocation}
//                 disabled={isSubmitting}
//                 className="mt-2 flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
//                 <Navigation size={14} className="mr-1" />
//                 Use my current location
//               </button>
//             </div>

//             {/* Set as Default */}
//             <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-4">
//               <input
//                 type="checkbox"
//                 id="defaultAddress"
//                 checked={formData.default === "1"}
//                 onChange={(e) => handleChange("default", e.target.checked ? "1" : "0")}
//                 className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
//                 disabled={isSubmitting}
//               />
//               <label
//                 htmlFor="defaultAddress"
//                 className="cursor-pointer text-sm font-medium text-gray-700">
//                 Set as default shipping address
//               </label>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="flex space-x-3 border-t border-gray-200 p-6">
//           <button
//             onClick={onClose}
//             disabled={isSubmitting}
//             className="flex-1 rounded-xl border-2 border-gray-300 px-6 py-3 font-bold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50">
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={isSubmitting}
//             className="flex flex-1 items-center justify-center rounded-xl bg-black px-6 py-3 font-bold text-white transition-all hover:bg-gray-900 disabled:bg-gray-300">
//             {isSubmitting ? (
//               <>
//                 <Loader2 className="mr-2 animate-spin" size={20} />
//                 Saving...
//               </>
//             ) : editAddress ? (
//               "Update Address"
//             ) : (
//               "Add Address"
//             )}
//           </button>
//         </div>
//       </div>

//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
//         @keyframes slideUp {
//           from { transform: translateY(20px); opacity: 0; }
//           to { transform: translateY(0); opacity: 1; }
//         }
//         .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
//         .animate-slideUp { animation: slideUp 0.3s ease-out; }
//       `}</style>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { X, MapPin, Loader2, Phone, User, Navigation } from "lucide-react";
import { useAddressStore } from "@/stores/addressStore";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  editAddress?: any;
  onSuccess?: () => void;
}

export default function AddressModal({
  isOpen,
  onClose,
  editAddress,
  onSuccess
}: AddressModalProps) {
  const addressStore = useAddressStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    address_1: "",
    address_2: "",
    road: "",
    area: "",
    landmark: "",
    mobile: "",
    mobile_country_code: "+880",
    latitude: "",
    longitude: "",
    default: "0"
  });

  useEffect(() => {
    if (editAddress) {
      setFormData({
        name: editAddress.name || "",
        address_1: editAddress.address_1 || "",
        address_2: editAddress.address_2 || "",
        road: editAddress.road || "",
        area: editAddress.area || "",
        landmark: editAddress.landmark || "",
        mobile: editAddress.mobile || "",
        mobile_country_code: editAddress.mobile_country_code || "+880",
        latitude: editAddress.latitude || "",
        longitude: editAddress.longitude || "",
        default: editAddress.default ? "1" : "0"
      });
    } else {
      setFormData({
        name: "",
        address_1: "",
        address_2: "",
        road: "",
        area: "",
        landmark: "",
        mobile: "",
        mobile_country_code: "+880",
        latitude: "",
        longitude: "",
        default: "0"
      });
    }
    setError("");
  }, [editAddress, isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.address_1.trim()) {
      setError("Address line 1 is required");
      return false;
    }
    if (!formData.road.trim()) {
      setError("Road/Street is required");
      return false;
    }
    if (!formData.area.trim()) {
      setError("Area is required");
      return false;
    }
    if (!formData.mobile.trim()) {
      setError("Mobile number is required");
      return false;
    }
    if (formData.mobile.length < 10) {
      setError("Please enter a valid mobile number");
      return false;
    }
    return true;
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Unable to get location. Please enter manually.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");

    try {
      let result;
      if (editAddress) {
        result = await addressStore.updateAddress(editAddress.address_id, formData);
      } else {
        result = await addressStore.addAddress(formData);
      }

      if (result.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(result.error || "Failed to save address");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-2 sm:p-4">
      <div className="animate-slideUp my-4 flex max-h-[95vh] w-full max-w-2xl flex-col rounded-2xl bg-white">
        {/* Header - Fixed */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 p-4 sm:p-6">
          <h2 className="flex items-center text-lg font-bold text-gray-900 sm:text-2xl">
            <MapPin className="mr-2 flex-shrink-0 text-black sm:mr-3" size={24} />
            <span className="truncate">{editAddress ? "Edit Address" : "Add New Address"}</span>
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-shrink-0 rounded-lg p-2 transition-colors hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {error && (
            <div className="mb-4 flex items-start justify-between rounded-lg border border-red-200 bg-red-50 p-3 sm:items-center sm:p-4">
              <span className="flex-1 pr-2 text-xs text-red-700 sm:text-sm">{error}</span>
              <button onClick={() => setError("")} className="flex-shrink-0 text-red-500">
                <X size={18} />
              </button>
            </div>
          )}

          <div className="space-y-4 sm:space-y-5">
            {/* Name / Label */}
            <div>
              <label className="mb-2 flex items-center text-xs font-medium text-gray-700 sm:text-sm">
                <User size={14} className="mr-2 flex-shrink-0 text-gray-500" />
                Address Name / Label *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Home, Office, Mom's House"
                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20 sm:px-4 sm:py-3 sm:text-base"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-500">
                Give this address a name for easy identification
              </p>
            </div>

            {/* Address Line 1 */}
            <div>
              <label className="mb-2 flex items-center text-xs font-medium text-gray-700 sm:text-sm">
                <MapPin size={14} className="mr-2 flex-shrink-0 text-gray-500" />
                Address Line 1 *
              </label>
              <input
                type="text"
                value={formData.address_1}
                onChange={(e) => handleChange("address_1", e.target.value)}
                placeholder="House/Building number, Floor"
                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20 sm:px-4 sm:py-3 sm:text-base"
                disabled={isSubmitting}
              />
            </div>

            {/* Address Line 2 */}
            <div>
              <label className="mb-2 flex items-center text-xs font-medium text-gray-700 sm:text-sm">
                <MapPin size={14} className="mr-2 flex-shrink-0 text-gray-500" />
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.address_2}
                onChange={(e) => handleChange("address_2", e.target.value)}
                placeholder="Apartment, Suite (Optional)"
                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20 sm:px-4 sm:py-3 sm:text-base"
                disabled={isSubmitting}
              />
            </div>

            {/* Road/Street & Area */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-700 sm:text-sm">
                  Road/Street *
                </label>
                <input
                  type="text"
                  value={formData.road}
                  onChange={(e) => handleChange("road", e.target.value)}
                  placeholder="Street name"
                  className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20 sm:px-4 sm:py-3 sm:text-base"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-700 sm:text-sm">
                  Area *
                </label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => handleChange("area", e.target.value)}
                  placeholder="Area/Locality"
                  className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20 sm:px-4 sm:py-3 sm:text-base"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Landmark */}
            <div>
              <label className="mb-2 flex items-center text-xs font-medium text-gray-700 sm:text-sm">
                <Navigation size={14} className="mr-2 flex-shrink-0 text-gray-500" />
                Landmark
              </label>
              <input
                type="text"
                value={formData.landmark}
                onChange={(e) => handleChange("landmark", e.target.value)}
                placeholder="Nearby landmark for easy location"
                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20 sm:px-4 sm:py-3 sm:text-base"
                disabled={isSubmitting}
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="mb-2 flex items-center text-xs font-medium text-gray-700 sm:text-sm">
                <Phone size={14} className="mr-2 flex-shrink-0 text-gray-500" />
                Mobile Number *
              </label>
              <div className="flex space-x-2">
                <select
                  value={formData.mobile_country_code}
                  onChange={(e) => handleChange("mobile_country_code", e.target.value)}
                  className="rounded-lg border-2 border-gray-300 px-2 py-2 text-sm transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20 sm:px-3 sm:py-3 sm:text-base"
                  disabled={isSubmitting}>
                  <option value="+880">🇧🇩 +880</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+971">🇦🇪 +971</option>
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+92">🇵🇰 +92</option>
                </select>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => handleChange("mobile", e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="1234567890"
                  className="flex-1 rounded-lg border-2 border-gray-300 px-3 py-2 text-sm transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20 sm:px-4 sm:py-3 sm:text-base"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Location Coordinates */}
            <div>
              <label className="mb-2 flex items-center text-xs font-medium text-gray-700 sm:text-sm">
                <Navigation size={14} className="mr-2 flex-shrink-0 text-gray-500" />
                Location Coordinates
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.latitude}
                  onChange={(e) => handleChange("latitude", e.target.value)}
                  placeholder="Latitude"
                  className="rounded-lg border-2 border-gray-300 px-3 py-2 text-xs transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20 sm:px-4 sm:py-3 sm:text-sm"
                  disabled={isSubmitting}
                />
                <input
                  type="text"
                  value={formData.longitude}
                  onChange={(e) => handleChange("longitude", e.target.value)}
                  placeholder="Longitude"
                  className="rounded-lg border-2 border-gray-300 px-3 py-2 text-xs transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20 sm:px-4 sm:py-3 sm:text-sm"
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isSubmitting}
                className="mt-2 flex items-center text-xs font-medium text-blue-600 hover:text-blue-700 sm:text-sm">
                <Navigation size={14} className="mr-1" />
                Use my current location
              </button>
            </div>

            {/* Set as Default */}
            <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3 sm:p-4">
              <input
                type="checkbox"
                id="defaultAddress"
                checked={formData.default === "1"}
                onChange={(e) => handleChange("default", e.target.checked ? "1" : "0")}
                className="h-4 w-4 flex-shrink-0 rounded border-gray-300 text-black focus:ring-black sm:h-5 sm:w-5"
                disabled={isSubmitting}
              />
              <label
                htmlFor="defaultAddress"
                className="cursor-pointer text-xs font-medium text-gray-700 sm:text-sm">
                Set as default shipping address
              </label>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex flex-shrink-0 flex-col space-y-2 border-t border-gray-200 p-4 sm:flex-row sm:space-y-0 sm:space-x-3 sm:p-6">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full rounded-xl border-2 border-gray-300 px-4 py-2.5 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50 sm:flex-1 sm:px-6 sm:py-3 sm:text-base">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-gray-900 disabled:bg-gray-300 sm:flex-1 sm:px-6 sm:py-3 sm:text-base">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={20} />
                Saving...
              </>
            ) : editAddress ? (
              "Update Address"
            ) : (
              "Add Address"
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
}
