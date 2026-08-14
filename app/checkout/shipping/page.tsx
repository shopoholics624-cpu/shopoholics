"use client";

import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { useDemo } from "@/hooks/use-demo";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { ShippingAddress } from "@/types/cart";
import { Truck, ArrowRight, Receipt, Building2, AlertCircle } from "lucide-react";

export default function ShippingPage() {
  const router = useRouter();
  const { shippingAddress, setShippingAddress, gstDetails, setGstDetails, total } = useCart();
  const { isDemoMode, handleDemoAction } = useDemo();

  // Local Form State initialized from shippingAddress
  const [formData, setFormData] = useState<ShippingAddress>({
    firstName: shippingAddress.firstName || shippingAddress.fullName?.split(" ")[0] || "Alexander",
    lastName: shippingAddress.lastName || shippingAddress.fullName?.split(" ").slice(1).join(" ") || "Wright",
    company: shippingAddress.company || "",
    email: shippingAddress.email || "alexander@crimsonluxe.com",
    phone: shippingAddress.phone || "9876543210",
    address1: shippingAddress.address1 || shippingAddress.addressLine1 || "742 Fifth Avenue",
    address2: shippingAddress.address2 || shippingAddress.addressLine2 || "Suite 1800",
    city: shippingAddress.city || "Mumbai",
    state: shippingAddress.state || "Maharashtra",
    postcode: shippingAddress.postcode || shippingAddress.postalCode || "400001",
    country: shippingAddress.country || "India",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = "Valid corporate email is required.";
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      newErrors.phone = "Valid 10-digit Indian mobile number is required.";
    }

    if (!formData.address1.trim()) {
      newErrors.address1 = "Street address is required.";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required.";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required.";
    }

    const pinRegex = /^\d{6}$/;
    if (!formData.postcode.trim() || !pinRegex.test(formData.postcode.trim())) {
      newErrors.postcode = "Valid 6-digit Indian PIN code is required.";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isDemoMode) {
      handleDemoAction(e);
      return;
    }

    if (!validateForm()) {
      return;
    }

    const validatedAddress: ShippingAddress = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      company: formData.company?.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address1: formData.address1.trim(),
      address2: formData.address2?.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      postcode: formData.postcode.trim(),
      country: formData.country.trim() || "India",
      fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      addressLine1: formData.address1.trim(),
      addressLine2: formData.address2?.trim(),
      postalCode: formData.postcode.trim(),
    };

    // Store in Cart Context (Temporary Checkout State for Phase 4.2)
    setShippingAddress(validatedAddress);

    // Proceed to Payment
    router.push("/checkout/payment");
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e3beb8]/60 shadow-lux space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#ffe9e6]">
        <div>
          <h2 className="text-xl font-extrabold text-[#261816]">Shipping & Delivery Details</h2>
          <p className="text-xs text-[#5a403c]">Enter your destination address for insured express courier delivery.</p>
        </div>
        <Truck className="w-6 h-6 text-[#8b0000]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5a403c] uppercase">First Name *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl bg-white text-xs font-semibold border ${
                errors.firstName ? "border-rose-500 bg-rose-50/20" : "border-[#e3beb8]"
              } focus:outline-none focus:border-[#8b0000]`}
            />
            {errors.firstName && (
              <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.firstName}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5a403c] uppercase">Last Name *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl bg-white text-xs font-semibold border ${
                errors.lastName ? "border-rose-500 bg-rose-50/20" : "border-[#e3beb8]"
              } focus:outline-none focus:border-[#8b0000]`}
            />
            {errors.lastName && (
              <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.lastName}
              </p>
            )}
          </div>
        </div>

        {/* Company & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5a403c] uppercase">Company (Optional)</label>
            <input
              type="text"
              value={formData.company || ""}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white text-xs font-semibold border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5a403c] uppercase">Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl bg-white text-xs font-semibold border ${
                errors.email ? "border-rose-500 bg-rose-50/20" : "border-[#e3beb8]"
              } focus:outline-none focus:border-[#8b0000]`}
            />
            {errors.email && (
              <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.email}
              </p>
            )}
          </div>
        </div>

        {/* Phone & Address 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5a403c] uppercase">Mobile Number (India) *</label>
            <input
              type="tel"
              maxLength={10}
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl bg-white text-xs font-semibold border ${
                errors.phone ? "border-rose-500 bg-rose-50/20" : "border-[#e3beb8]"
              } focus:outline-none focus:border-[#8b0000]`}
            />
            {errors.phone && (
              <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.phone}
              </p>
            )}
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-bold text-[#5a403c] uppercase">Street Address *</label>
            <input
              type="text"
              placeholder="House/Building No., Street Name"
              value={formData.address1}
              onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl bg-white text-xs font-semibold border ${
                errors.address1 ? "border-rose-500 bg-rose-50/20" : "border-[#e3beb8]"
              } focus:outline-none focus:border-[#8b0000]`}
            />
            {errors.address1 && (
              <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.address1}
              </p>
            )}
          </div>
        </div>

        {/* Apartment / Suite (Address 2) */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#5a403c] uppercase">Apartment / Suite / Unit (Optional)</label>
          <input
            type="text"
            placeholder="Apartment, suite, unit, building, floor, etc."
            value={formData.address2 || ""}
            onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-white text-xs font-semibold border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
          />
        </div>

        {/* City, State, PIN Code, Country */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5a403c] uppercase">City *</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl bg-white text-xs font-semibold border ${
                errors.city ? "border-rose-500 bg-rose-50/20" : "border-[#e3beb8]"
              } focus:outline-none focus:border-[#8b0000]`}
            />
            {errors.city && (
              <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.city}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5a403c] uppercase">State *</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl bg-white text-xs font-semibold border ${
                errors.state ? "border-rose-500 bg-rose-50/20" : "border-[#e3beb8]"
              } focus:outline-none focus:border-[#8b0000]`}
            />
            {errors.state && (
              <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.state}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5a403c] uppercase">PIN Code *</label>
            <input
              type="text"
              maxLength={6}
              placeholder="e.g. 400001"
              value={formData.postcode}
              onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl bg-white text-xs font-semibold border ${
                errors.postcode ? "border-rose-500 bg-rose-50/20" : "border-[#e3beb8]"
              } focus:outline-none focus:border-[#8b0000]`}
            />
            {errors.postcode && (
              <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.postcode}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5a403c] uppercase">Country *</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl bg-white text-xs font-semibold border ${
                errors.country ? "border-rose-500 bg-rose-50/20" : "border-[#e3beb8]"
              } focus:outline-none focus:border-[#8b0000]`}
            />
            {errors.country && (
              <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.country}
              </p>
            )}
          </div>
        </div>

        {/* GST Invoice for Business Purchases Section */}
        <div className="pt-4 border-t border-[#ffe9e6] space-y-3">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#fff8f6] border border-[#e3beb8]/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-[#261816] block">
                  GST Invoice for Business Purchase
                </span>
                <span className="text-[11px] text-[#5a403c] font-medium block">
                  Claim Input Tax Credit (ITC) with official tax invoice
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={gstDetails.isGstRequired}
                onChange={(e) => setGstDetails({ ...gstDetails, isGstRequired: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b0000]"></div>
            </label>
          </div>

          {/* Slide-down GST Form */}
          {gstDetails.isGstRequired && (
            <div className="p-4 rounded-2xl bg-white border border-[#e3beb8] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#ffe9e6]">
                <span className="text-xs font-extrabold text-[#8b0000] uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" /> Registered Entity Tax Details
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setGstDetails({
                      ...gstDetails,
                      isGstRequired: true,
                      gstin: "27AAAAA0000A1Z5",
                      businessName: "Crimson Luxe Enterprises Pvt Ltd",
                    })
                  }
                  className="text-[10px] font-bold text-[#8b0000] hover:underline bg-[#ffe9e6] px-2.5 py-1 rounded-full"
                >
                  Auto-fill Sample GSTIN
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#5a403c] uppercase">
                    GSTIN Number (15 Digits)
                  </label>
                  <input
                    type="text"
                    required={gstDetails.isGstRequired}
                    maxLength={15}
                    placeholder="e.g. 27AAAAA0000A1Z5"
                    value={gstDetails.gstin}
                    onChange={(e) =>
                      setGstDetails({ ...gstDetails, gstin: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white text-xs font-mono font-bold uppercase border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#5a403c] uppercase">
                    Registered Company / Entity Name
                  </label>
                  <input
                    type="text"
                    required={gstDetails.isGstRequired}
                    placeholder="e.g. Crimson Luxe Pvt Ltd"
                    value={gstDetails.businessName}
                    onChange={(e) => setGstDetails({ ...gstDetails, businessName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white text-xs font-semibold border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-[#ffe9e6]">
          <div>
            <span className="text-xs text-[#5a403c] font-medium block">Order Total:</span>
            <span className="text-xl font-extrabold text-[#8b0000]">{formatPrice(total)}</span>
          </div>

          <button
            type="submit"
            className="px-8 py-3.5 bg-[#8b0000] text-white font-bold text-xs rounded-xl shadow-lg hover:bg-[#bc0000] transition-colors flex items-center gap-2"
          >
            <span>Proceed to Payment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
