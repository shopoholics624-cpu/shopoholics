"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { User, ArrowLeft, Loader2, AlertCircle, CheckCircle2, Save, Mail, Phone } from "lucide-react";
import { DeleteAccountSection } from "@/components/account/delete-account-section";
import { ChangePasswordSection } from "@/components/account/change-password-section";

export default function AccountDetailsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
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
          setFirstName(c.firstName || "");
          setLastName(c.lastName || "");
          setEmail(c.email || "");
          setPhone(c.phone || c.billing?.phone || "");
        }
      } catch (err) {
        if (isMounted) setErrorMessage("Failed to load customer account profile.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (!cleanFirstName || !cleanLastName) {
      setErrorMessage("First Name and Last Name are required.");
      return;
    }

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (cleanPhone && !/^[0-9+\s-]{10,15}$/.test(cleanPhone)) {
      setErrorMessage("Please enter a valid phone number.");
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: cleanFirstName,
          lastName: cleanLastName,
          email: cleanEmail,
          phone: cleanPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Unable to save your changes. Please try again.");
        setIsSaving(false);
        return;
      }

      // Update UI state directly from authoritative WooCommerce response
      if (data.customer) {
        setFirstName(data.customer.firstName || cleanFirstName);
        setLastName(data.customer.lastName || cleanLastName);
        setEmail(data.customer.email || cleanEmail);
        setPhone(data.customer.phone || cleanPhone);
      }

      setSuccessMessage("Account profile details updated and saved to WooCommerce successfully!");
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
          Loading Account Profile...
        </p>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Navigation */}
        <div className="space-y-2">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#8b0000] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Account Dashboard
          </Link>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#261816] tracking-tight">
            Account Profile Details
          </h1>
          <p className="text-xs sm:text-sm text-[#5a403c]">
            Update your personal name, contact information, and email address.
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

        {/* Form Box */}
        <form onSubmit={handleSaveProfile} className="p-6 sm:p-10 rounded-3xl bg-[#faf5f4] border border-[#e3beb8] space-y-6 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-[#e3beb8]">
            <div className="w-12 h-12 rounded-2xl bg-[#8b0000] text-white flex items-center justify-center shadow-md">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#261816]">Personal Information</h2>
              <p className="text-xs text-[#5a403c]">Synchronized with WooCommerce Customer Record</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#8e706b] mb-1.5">
                First Name *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-white border border-[#e3beb8] rounded-xl px-4 py-2.5 text-xs text-[#261816] focus:outline-none focus:border-[#8b0000]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#8e706b] mb-1.5">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-white border border-[#e3beb8] rounded-xl px-4 py-2.5 text-xs text-[#261816] focus:outline-none focus:border-[#8b0000]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#8e706b] mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#e3beb8] rounded-xl px-4 py-2.5 pl-10 text-xs text-[#261816] focus:outline-none focus:border-[#8b0000]"
                />
                <Mail className="w-4 h-4 text-[#8e706b] absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#8e706b] mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-white border border-[#e3beb8] rounded-xl px-4 py-2.5 pl-10 text-xs text-[#261816] focus:outline-none focus:border-[#8b0000]"
                />
                <Phone className="w-4 h-4 text-[#8e706b] absolute left-3.5 top-3" />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3.5 bg-gradient-to-r from-[#8b0000] to-[#e51c10] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Profile Details
                </>
              )}
            </button>
          </div>
        </form>

        {/* Change Password Section */}
        <div className="pt-2">
          <ChangePasswordSection />
        </div>

        {/* Danger Zone - Permanent Account Deletion */}
        <div className="pt-2">
          <DeleteAccountSection />
        </div>
      </div>
    </div>
  );
}
