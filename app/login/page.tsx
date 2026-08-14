"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("deleted") === "true") {
      setSuccessMessage("Your customer account and personal data have been permanently deleted.");
    }
  }, [searchParams]);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await login(email, password, rememberMe);

      if (!res.success) {
        setErrorMessage(res.message || "Invalid email address or password.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Authentication successful. Redirecting to home...");
      setTimeout(() => {
        router.replace("/");
      }, 500);
    } catch (err) {
      setErrorMessage("Unable to connect to the account service. Please try again.");
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
              Customer Sign In
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Access your Shop-O-Holics account, orders & saved details.
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

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-bold text-[#8b0000] hover:text-[#a00000] transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
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

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 select-none font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#8b0000] cursor-pointer"
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#8b0000] hover:bg-[#a00000] text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  Sign In to Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Register Link */}
          <div className="pt-4 border-t border-slate-200/80 text-center text-xs text-slate-600 relative z-10">
            Don&apos;t have a WooCommerce customer account?{" "}
            <Link href="/register" className="font-extrabold text-[#8b0000] hover:underline ml-1">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 bg-white min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-[#8b0000] animate-spin" />
          <p className="text-xs font-bold text-[#8e706b] uppercase tracking-wider">Loading Sign In...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
