"use client";

import { useState } from "react";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { KeyRound, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Failed to request password reset.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage(
        "If an account exists for this email address, password reset instructions have been dispatched by WooCommerce."
      );
      setIsLoading(false);
    } catch (err) {
      setErrorMessage("Network error during request. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 bg-white min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4 sm:px-6">
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
              Reset Your Password
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Enter your registered WooCommerce account email to receive reset instructions.
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
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 pl-10 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#8b0000] focus:ring-2 focus:ring-[#8b0000]/10 shadow-sm transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#8b0000] hover:bg-[#a00000] text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Dispatching Reset Request...
                </>
              ) : (
                <>
                  Send Reset Link <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Back Link */}
          <div className="pt-4 border-t border-slate-200/80 text-center relative z-10">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#8b0000] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
