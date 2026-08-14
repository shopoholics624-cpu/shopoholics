"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";

export function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!currentPassword) {
      setErrorMessage("Please enter your current password.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirmation password do not match.");
      return;
    }

    setIsUpdating(true);

    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Failed to update password. Please try again.");
        setIsUpdating(false);
        return;
      }

      setSuccessMessage("Your account password has been updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsUpdating(false);
    } catch (err) {
      setErrorMessage("Unable to update password. Please check your network connection.");
      setIsUpdating(false);
    }
  };

  return (
    <form
      onSubmit={handlePasswordChange}
      className="p-6 sm:p-10 rounded-3xl bg-[#faf5f4] border border-[#e3beb8] space-y-6 shadow-sm"
    >
      <div className="flex items-center gap-3 pb-4 border-b border-[#e3beb8]">
        <div className="w-12 h-12 rounded-2xl bg-[#8b0000] text-white flex items-center justify-center shadow-md shrink-0">
          <KeyRound className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-[#261816]">Change Password</h2>
          <p className="text-xs text-[#5a403c]">Update your WooCommerce customer account login password</p>
        </div>
      </div>

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

      <div className="space-y-4">
        {/* Current Password */}
        <div>
          <label className="block text-xs font-bold uppercase text-[#8e706b] mb-1.5">
            Current Password *
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-[#e3beb8] rounded-xl px-4 py-2.5 pl-10 pr-10 text-xs text-[#261816] focus:outline-none focus:border-[#8b0000]"
            />
            <Lock className="w-4 h-4 text-[#8e706b] absolute left-3.5 top-3" />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3.5 top-3 text-[#8e706b] hover:text-[#261816]"
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#8e706b] mb-1.5">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-white border border-[#e3beb8] rounded-xl px-4 py-2.5 pl-10 pr-10 text-xs text-[#261816] focus:outline-none focus:border-[#8b0000]"
              />
              <Lock className="w-4 h-4 text-[#8e706b] absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-3 text-[#8e706b] hover:text-[#261816]"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#8e706b] mb-1.5">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-white border border-[#e3beb8] rounded-xl px-4 py-2.5 pl-10 pr-10 text-xs text-[#261816] focus:outline-none focus:border-[#8b0000]"
              />
              <Lock className="w-4 h-4 text-[#8e706b] absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-3 text-[#8e706b] hover:text-[#261816]"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={isUpdating}
          className="px-8 py-3 bg-gradient-to-r from-[#8b0000] to-[#e51c10] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Updating Password...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" /> Update Password
            </>
          )}
        </button>
      </div>
    </form>
  );
}
