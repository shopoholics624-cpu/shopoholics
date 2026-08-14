"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, Loader2, X, ShieldAlert } from "lucide-react";

export function DeleteAccountSection() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [understandChecked, setUnderstandChecked] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canDelete = understandChecked && confirmInput.trim().toUpperCase() === "DELETE" && !isDeleting;

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canDelete) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "We couldn't complete the account deletion. Please try again.");
        setIsDeleting(false);
        return;
      }

      // Cleanup client-side browser storage
      try {
        localStorage.removeItem("shop_oholics_cart");
        localStorage.removeItem("shopoholics_wishlist");
        localStorage.removeItem("shopoholics_last_order");
        sessionStorage.clear();
      } catch {}

      // Close modal and redirect to login page with deletion message
      setIsModalOpen(false);
      router.push("/login?deleted=true");
      router.refresh();
    } catch (err) {
      setErrorMessage("We couldn't complete the account deletion. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Danger Zone Section Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-red-50/50 border border-red-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-red-950">Danger Zone — Permanent Account Deletion</h3>
            <p className="text-xs text-red-800/80">Irreversible WooCommerce customer profile removal</p>
          </div>
        </div>

        <p className="text-xs text-red-900/90 leading-relaxed">
          Deleting your account is permanent. Your customer profile, saved addresses, wishlist, and personal account data will be permanently removed from WooCommerce. This action cannot be undone.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              setIsModalOpen(true);
              setErrorMessage(null);
              setUnderstandChecked(false);
              setConfirmInput("");
            }}
            className="px-5 py-2.5 rounded-xl border border-red-300 text-red-700 bg-white hover:bg-red-600 hover:text-white text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Trash2 className="w-4 h-4" /> Delete My Account
          </button>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-red-200 shadow-2xl relative space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-[#261816]">Delete your account permanently?</h2>
                  <p className="text-xs text-red-600 font-bold">This action cannot be undone</p>
                </div>
              </div>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning Message */}
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs leading-relaxed space-y-2">
              <p className="font-bold">
                This will permanently remove your WooCommerce customer account and associated personal data.
              </p>
              <p className="text-red-800">
                Your personal profile, saved shipping addresses, active cart associations, and wishlist items will be erased from the store.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs font-bold">
                {errorMessage}
              </div>
            )}

            {/* Confirmation Controls */}
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  disabled={isDeleting}
                  checked={understandChecked}
                  onChange={(e) => setUnderstandChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
                />
                <span className="text-xs font-medium text-[#261816]">
                  I understand that this action is permanent and my account cannot be recovered.
                </span>
              </label>

              <div>
                <label className="block text-xs font-bold uppercase text-[#8e706b] mb-1.5">
                  Type <span className="text-red-700 font-extrabold">DELETE</span> to confirm *
                </label>
                <input
                  type="text"
                  disabled={isDeleting}
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full bg-gray-50 border border-[#e3beb8] rounded-xl px-4 py-2.5 text-xs text-[#261816] font-bold focus:outline-none focus:border-red-600 uppercase tracking-widest"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!canDelete}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Deleting account...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" /> Yes, Delete My Account
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
