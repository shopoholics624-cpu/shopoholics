"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { User, Mail, Lock, Phone, ArrowRight, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage("Password and Confirm Password do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (!termsAccepted) {
      setErrorMessage("Please accept the Terms & Conditions to register.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Failed to create customer account.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Account created successfully! Redirecting to your account...");
      setTimeout(() => {
        router.push("/account");
        router.refresh();
      }, 1000);
    } catch (err) {
      setErrorMessage("Network error during registration. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 bg-white min-h-screen flex items-center justify-center">
      <div className="w-full max-w-lg mx-auto px-4 sm:px-6">
        <div className="bg-[#f4f4f6] text-[#261816] p-8 sm:p-10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-[#e3beb8]/60 space-y-6 relative overflow-hidden">
          {/* Header */}
          <div className="text-center space-y-2 relative z-10">
            <Link href="/" className="inline-block mb-3">
              {/* eslint-disable-next-img-element */}
              <img
                src="/images/logo-cropped.png"
                alt="Shop-O-Holics - Spend Less, Save More... Shop Smart!!!"
                className="h-8 sm:h-9 max-w-[180px] sm:max-w-[210px] w-auto object-contain mx-auto"
              />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#261816] tracking-tight">
              Create Customer Account
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Join Shop-O-Holics for order tracking, saved addresses & fast checkout.
            </p>
          </div>

          {/* Alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Alexander"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#8b0000] focus:ring-2 focus:ring-[#8b0000]/10 shadow-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Wright"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#8b0000] focus:ring-2 focus:ring-[#8b0000]/10 shadow-sm transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alexander@example.com"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 pl-10 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#8b0000] focus:ring-2 focus:ring-[#8b0000]/10 shadow-sm transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 pl-10 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#8b0000] focus:ring-2 focus:ring-[#8b0000]/10 shadow-sm transition-all"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 pl-10 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#8b0000] focus:ring-2 focus:ring-[#8b0000]/10 shadow-sm transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 pl-10 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#8b0000] focus:ring-2 focus:ring-[#8b0000]/10 shadow-sm transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 select-none font-medium">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#8b0000] cursor-pointer mt-0.5"
                />
                <span>
                  I agree to the Shop-O-Holics Terms & Conditions and Privacy Policy.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#8b0000] hover:bg-[#a00000] text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Registering Customer Account...
                </>
              ) : (
                <>
                  Complete Registration <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Login Link */}
          <div className="pt-4 border-t border-slate-200/80 text-center text-xs text-slate-600 relative z-10">
            Already have an account?{" "}
            <Link href="/login" className="font-extrabold text-[#8b0000] hover:underline ml-1">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
