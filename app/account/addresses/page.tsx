"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { MapPin, ArrowLeft, Loader2, AlertCircle, CheckCircle2, Save } from "lucide-react";

export default function AddressesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Billing Form State
  const [billingFirstName, setBillingFirstName] = useState("");
  const [billingLastName, setBillingLastName] = useState("");
  const [billingCompany, setBillingCompany] = useState("");
  const [billingAddress1, setBillingAddress1] = useState("");
  const [billingAddress2, setBillingAddress2] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingPostcode, setBillingPostcode] = useState("");
  const [billingCountry, setBillingCountry] = useState("India");
  const [billingPhone, setBillingPhone] = useState("");

  // Shipping Form State
  const [shippingFirstName, setShippingFirstName] = useState("");
  const [shippingLastName, setShippingLastName] = useState("");
  const [shippingCompany, setShippingCompany] = useState("");
  const [shippingAddress1, setShippingAddress1] = useState("");
  const [shippingAddress2, setShippingAddress2] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingPostcode, setShippingPostcode] = useState("");
  const [shippingCountry, setShippingCountry] = useState("India");
  const [shippingPhone, setShippingPhone] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCustomerProfile() {
      try {
        const res = await fetch("/api/auth/me?full=true", { cache: "no-store" });
        if (!res.ok) {
          if (isMounted) router.push("/login");
          return;
        }

        const data = await res.json();
        if (!data.success || !data.customer) {
          if (isMounted) router.push("/login");
          return;
        }

        if (isMounted) {
          const c = data.customer;
          const b = c.billing || {};
          const s = c.shipping || {};

          setBillingFirstName(b.first_name || c.firstName || "");
          setBillingLastName(b.last_name || c.lastName || "");
          setBillingCompany(b.company || "");
          setBillingAddress1(b.address_1 || "");
          setBillingAddress2(b.address_2 || "");
          setBillingCity(b.city || "");
          setBillingState(b.state || "");
          setBillingPostcode(b.postcode || "");
          setBillingCountry(b.country === "IN" ? "India" : b.country || "India");
          setBillingPhone(b.phone || c.phone || "");

          setShippingFirstName(s.first_name || c.firstName || "");
          setShippingLastName(s.last_name || c.lastName || "");
          setShippingCompany(s.company || "");
          setShippingAddress1(s.address_1 || "");
          setShippingAddress2(s.address_2 || "");
          setShippingCity(s.city || "");
          setShippingState(s.state || "");
          setShippingPostcode(s.postcode || "");
          setShippingCountry(s.country === "IN" ? "India" : s.country || "India");
          setShippingPhone(s.phone || b.phone || c.phone || "");
        }
      } catch (err) {
        if (isMounted) setErrorMessage("Failed to load saved addresses.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadCustomerProfile();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSaveAddresses = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Form Validations
    if (!billingFirstName.trim() || !billingLastName.trim()) {
      setErrorMessage("Billing First Name and Last Name are required.");
      return;
    }

    if (!billingAddress1.trim()) {
      setErrorMessage("Billing Address Line 1 is required.");
      return;
    }

    if (!billingCity.trim() || !billingState.trim()) {
      setErrorMessage("Billing City and State are required.");
      return;
    }

    if (billingPostcode.trim() && !/^\d{6}$/.test(billingPostcode.trim())) {
      setErrorMessage("Please enter a valid 6-digit Indian Postal PIN code for Billing Address.");
      return;
    }

    if (shippingPostcode.trim() && !/^\d{6}$/.test(shippingPostcode.trim())) {
      setErrorMessage("Please enter a valid 6-digit Indian Postal PIN code for Shipping Address.");
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing: {
            firstName: billingFirstName.trim(),
            lastName: billingLastName.trim(),
            company: billingCompany.trim(),
            address1: billingAddress1.trim(),
            address2: billingAddress2.trim(),
            city: billingCity.trim(),
            state: billingState.trim(),
            postcode: billingPostcode.trim(),
            country: billingCountry.trim(),
            phone: billingPhone.trim(),
          },
          shipping: {
            firstName: shippingFirstName.trim() || billingFirstName.trim(),
            lastName: shippingLastName.trim() || billingLastName.trim(),
            company: shippingCompany.trim(),
            address1: shippingAddress1.trim() || billingAddress1.trim(),
            address2: shippingAddress2.trim() || billingAddress2.trim(),
            city: shippingCity.trim() || billingCity.trim(),
            state: shippingState.trim() || billingState.trim(),
            postcode: shippingPostcode.trim() || billingPostcode.trim(),
            country: shippingCountry.trim() || billingCountry.trim(),
            phone: shippingPhone.trim() || billingPhone.trim(),
          },
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Unable to save your changes. Please try again.");
        setIsSaving(false);
        return;
      }

      // Update state directly from fresh WooCommerce customer response
      if (data.customer) {
        const b = data.customer.billing || {};
        const s = data.customer.shipping || {};

        setBillingFirstName(b.first_name || billingFirstName);
        setBillingLastName(b.last_name || billingLastName);
        setBillingCompany(b.company || billingCompany);
        setBillingAddress1(b.address_1 || billingAddress1);
        setBillingAddress2(b.address_2 || billingAddress2);
        setBillingCity(b.city || billingCity);
        setBillingState(b.state || billingState);
        setBillingPostcode(b.postcode || billingPostcode);
        setBillingCountry(b.country === "IN" ? "India" : b.country || "India");
        setBillingPhone(b.phone || billingPhone);

        setShippingFirstName(s.first_name || shippingFirstName);
        setShippingLastName(s.last_name || shippingLastName);
        setShippingCompany(s.company || shippingCompany);
        setShippingAddress1(s.address_1 || shippingAddress1);
        setShippingAddress2(s.address_2 || shippingAddress2);
        setShippingCity(s.city || shippingCity);
        setShippingState(s.state || shippingState);
        setShippingPostcode(s.postcode || shippingPostcode);
        setShippingCountry(s.country === "IN" ? "India" : s.country || "India");
        setShippingPhone(s.phone || shippingPhone);
      }

      setSuccessMessage("Billing and shipping addresses saved to WooCommerce successfully!");
      setIsSaving(false);
      router.refresh();
    } catch (err) {
      setErrorMessage("Unable to save your changes. Please try again.");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 bg-white min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#8b0000] animate-spin" />
        <p className="text-xs font-bold text-[#8e706b] uppercase tracking-wider">
          Loading Saved Addresses...
        </p>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Navigation */}
        <div className="space-y-2">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#8b0000] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Account Dashboard
          </Link>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#261816] tracking-tight">
            Saved Addresses
          </h1>
          <p className="text-xs sm:text-sm text-[#5a403c]">
            Manage your default billing and shipping locations synchronized with your WooCommerce customer profile.
          </p>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSaveAddresses} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Billing Address Column */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#faf5f4] border border-[#e3beb8] space-y-4">
              <h2 className="text-lg font-extrabold text-[#261816] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#8b0000]" /> Billing Address
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#8e706b] mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={billingFirstName}
                    onChange={(e) => setBillingFirstName(e.target.value)}
                    className="w-full bg-white border border-[#e3beb8] rounded-xl px-3 py-2 text-xs text-[#261816]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#8e706b] mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={billingLastName}
                    onChange={(e) => setBillingLastName(e.target.value)}
                    className="w-full bg-white border border-[#e3beb8] rounded-xl px-3 py-2 text-xs text-[#261816]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#8e706b] mb-1">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  value={billingCompany}
                  onChange={(e) => setBillingCompany(e.target.value)}
                  className="w-full bg-white border border-[#e3beb8] rounded-xl px-3 py-2 text-xs text-[#261816]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#8e706b] mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  required
                  value={billingAddress1}
                  onChange={(e) => setBillingAddress1(e.target.value)}
                  className="w-full bg-white border border-[#e3beb8] rounded-xl px-3 py-2 text-xs text-[#261816]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#8e706b] mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={billingAddress2}
                  onChange={(e) => setBillingAddress2(e.target.value)}
                  className="w-full bg-white border border-[#e3beb8] rounded-xl px-3 py-2 text-xs text-[#261816]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#8e706b] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={billingCity}
                    onChange={(e) => setBillingCity(e.target.value)}
                    className="w-full bg-white border border-[#e3beb8] rounded-xl px-3 py-2 text-xs text-[#261816]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#8e706b] mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={billingState}
                    onChange={(e) => setBillingState(e.target.value)}
                    className="w-full bg-white border border-[#e3beb8] rounded-xl px-3 py-2 text-xs text-[#261816]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#8e706b] mb-1">
                    Postal PIN *
                  </label>
                  <input
                    type="text"
                    required
                    value={billingPostcode}
                    onChange={(e) => setBillingPostcode(e.target.value)}
                    placeholder="600001"
                    className="w-full bg-white border border-[#e3beb8] rounded-xl px-3 py-2 text-xs text-[#261816]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#8e706b] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={billingPhone}
                  onChange={(e) => setBillingPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-white border border-[#e3beb8] rounded-xl px-3 py-2 text-xs text-[#261816]"
                />
              </div>
            </div>

            {/* Shipping Address Column */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#faf5f4] border border-[#e3beb8] space-y-4">
              <h2 className="text-lg font-extrabold text-[#261816] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#8b0000]" /> Shipping Address
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#8e706b] mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={shippingFirstName}
                    onChange={(e) => setShippingFirstName(e.target.value)}
                    className="w-full bg-white border border-[#e3beb8] rounded-xl px-3 py-2 text-xs text-[#261816]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#8e706b] mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={shippingLastName}
                    onChange={(e) => setShippingLastName(e.target.value)}
                    className="w-full bg-white border border-[#e3beb8] rounded-xl px-3 py-2 text-xs text-[#261816]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#8e706b] mb-1">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  value={shippingCompany}
                  onChange={(e) => setShippingCompany(e.target.value)}
                  className="w-full bg-white border border-[#e3beb8] rounded-xl px-3 py-2 text-xs text-[#261816]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#8e706b] mb-1">
                  Address Line 1
                </label>
                <input
                  type="text"
                  value={shippingAddress1}
                  onChange={(e) => setShippingAddress1(e.target.value)}
                  className="w-full bg-white border border-[#e3beb8] rounded-xl px-3 py-2 text-xs text-[#261816]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#8e706b] mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={shippingAddress2}
                  onChange={(e) => setShippingAddress2(e.target.value)}
                  className="w-full bg-white border border-[#e3beb8] rounded-xl px-3 py-2 text-xs text-[#261816]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#8e706b] mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    className="w-full bg-white border border-[#e3beb8] rounded-xl px-3 py-2 text-xs text-[#261816]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#8e706b] mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    className="w-full bg-white border border-[#e3beb8] rounded-xl px-3 py-2 text-xs text-[#261816]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#8e706b] mb-1">
                    Postal PIN
                  </label>
                  <input
                    type="text"
                    value={shippingPostcode}
                    onChange={(e) => setShippingPostcode(e.target.value)}
                    placeholder="600001"
                    className="w-full bg-white border border-[#e3beb8] rounded-xl px-3 py-2 text-xs text-[#261816]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#8e706b] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={shippingPhone}
                  onChange={(e) => setShippingPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-white border border-[#e3beb8] rounded-xl px-3 py-2 text-xs text-[#261816]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3.5 bg-gradient-to-r from-[#8b0000] to-[#e51c10] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Addresses...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Address Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
