"use client";

import { useCart } from "@/hooks/use-cart";
import { useDemo } from "@/hooks/use-demo";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import {
  Lock,
  ArrowRight,
  Receipt,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldCheck,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function PaymentPage() {
  const router = useRouter();
  const { shippingAddress, paymentDetails, gstDetails, total, clearCart } = useCart();
  const { isDemoMode, handleDemoAction } = useDemo();

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentStatusNotice, setPaymentStatusNotice] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  const pendingCreationRef = useRef(false);

  // Load Razorpay JS SDK dynamically
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Initialize or fetch the pending WooCommerce order server-side without clearing cart
  useEffect(() => {
    async function ensureOrderCreated() {
      if (createdOrder || pendingCreationRef.current) return;
      if (!shippingAddress || !shippingAddress.email) return;

      pendingCreationRef.current = true;
      setIsCreatingOrder(true);

      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shippingAddress,
            paymentDetails: { method: "razorpay" },
            gstDetails,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success && data.order) {
          setCreatedOrder(data.order);
        } else {
          setErrorMessage(data.message || "Failed to initialize checkout order.");
        }
      } catch (err) {
        console.error("[PaymentPage Order Creation Error]:", err);
        setErrorMessage("Unable to connect to order creation server.");
      } finally {
        setIsCreatingOrder(false);
      }
    }

    ensureOrderCreated();
  }, [shippingAddress, gstDetails, createdOrder]);

  // Handle Razorpay Payment Flow
  const handleRazorpayPayment = async () => {
    setErrorMessage(null);
    setPaymentStatusNotice(null);

    if (isDemoMode) {
      handleDemoAction({} as any);
      return;
    }

    let activeOrder = createdOrder;

    if (!activeOrder) {
      setIsCreatingOrder(true);
      try {
        const createRes = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shippingAddress,
            paymentDetails: { method: "razorpay" },
            gstDetails,
          }),
        });
        const createData = await createRes.json();
        if (createRes.ok && createData.success && createData.order) {
          activeOrder = createData.order;
          setCreatedOrder(activeOrder);
        } else {
          setErrorMessage(createData.message || "Failed to create order reference.");
          setIsCreatingOrder(false);
          return;
        }
      } catch (err) {
        setErrorMessage("Connection error during order creation.");
        setIsCreatingOrder(false);
        return;
      } finally {
        setIsCreatingOrder(false);
      }
    }

    setIsProcessingPayment(true);

    try {
      // 1. Create Razorpay Payment Order Server-side using authoritative WooCommerce amount
      const res = await fetch("/api/payment/razorpay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wooOrderId: activeOrder.id }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Failed to launch Razorpay payment order.");
        setIsProcessingPayment(false);
        return;
      }

      // Check if Razorpay JS SDK loaded
      if (typeof window.Razorpay !== "function") {
        setErrorMessage("Razorpay Checkout SDK is loading. Please try clicking again in a few seconds.");
        setIsProcessingPayment(false);
        return;
      }

      // 2. Launch Razorpay Checkout Modal
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "Shop-O-Holics Luxury Retail",
        description: `Order ${activeOrder.orderNumber}`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
          email: shippingAddress.email,
          contact: shippingAddress.phone,
        },
        theme: {
          color: "#8b0000",
        },
        handler: async function (response: any) {
          try {
            // 3. Server-side HMAC Signature Verification
            const verifyRes = await fetch("/api/payment/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                wooOrderId: activeOrder.id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              const finalPaidOrder = {
                ...activeOrder,
                status: "processing",
                paymentMethod: "Razorpay Secure Gateway (Test Mode)",
                razorpayPaymentId: response.razorpay_payment_id,
                paidAt: new Date().toISOString(),
              };

              try {
                localStorage.setItem("shopoholics_last_order", JSON.stringify(finalPaidOrder));
              } catch {
                // ignore
              }

              // Clear cart ONLY upon verified payment
              clearCart();
              router.push("/checkout/success");
            } else {
              setErrorMessage(
                verifyData.message || "Razorpay payment verification failed. Your cart remains intact."
              );
            }
          } catch (err) {
            console.error("[Razorpay Verify Callback Error]:", err);
            setErrorMessage("Error verifying payment signature with server. Cart remains intact.");
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            setPaymentStatusNotice({
              type: "warning",
              message: "Razorpay payment modal closed. Your cart and order remain intact.",
            });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("[Razorpay Launch Error]:", err);
      setErrorMessage("Network error initializing Razorpay checkout.");
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e3beb8]/60 shadow-lux space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#ffe9e6]">
        <div>
          <h2 className="text-xl font-extrabold text-[#261816]">256-Bit Encrypted Payment</h2>
          <p className="text-xs text-[#5a403c]">
            Secure checkout powered exclusively by Razorpay Payment Gateway.
          </p>
        </div>
        <Lock className="w-6 h-6 text-[#8b0000]" />
      </div>

      {/* Error & Warning Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {paymentStatusNotice && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 ${
            paymentStatusNotice.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-700"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}
        >
          {paymentStatusNotice.type === "error" ? (
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span>{paymentStatusNotice.message}</span>
        </div>
      )}

      {/* GST Invoice Callout Badge */}
      {gstDetails.isGstRequired && (
        <div className="p-4 rounded-2xl bg-[#fff8f6] border border-[#e3beb8]/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-[#261816] block">
                GST Tax Credit Invoice Included
              </span>
              <span className="text-[11px] text-[#5a403c] font-medium block">
                GSTIN: <span className="font-mono font-bold text-[#8b0000]">{gstDetails.gstin || "27AAAAA0000A1Z5"}</span> ({gstDetails.businessName || "Registered Entity"})
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ffe9e6] text-[#8b0000] text-[10px] font-extrabold uppercase shrink-0">
            <CheckCircle2 className="w-3 h-3 text-[#8b0000]" /> ITC Ready
          </span>
        </div>
      )}

      {/* RAZORPAY TEST MODE PAYMENT CARD */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#fff7f5] via-white to-[#fff0ee] border-2 border-[#8b0000]/30 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#f3d2cc]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8b0000] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-[#261816]">Razorpay Secure Gateway</span>
                <span className="px-2 py-0.5 rounded-full bg-[#ffe9e6] text-[#8b0000] text-[10px] font-black uppercase border border-[#e3beb8]">
                  Test Mode
                </span>
              </div>
              <p className="text-xs text-[#5a403c]">
                Official sandbox environment with instant server signature verification.
              </p>
            </div>
          </div>

          {createdOrder && (
            <span className="px-2.5 py-1 bg-[#8b0000] text-white text-[10px] font-mono font-bold rounded-lg shrink-0 hidden sm:inline">
              Order #{createdOrder.orderNumber}
            </span>
          )}
        </div>

        <div className="space-y-2 text-xs text-[#5a403c]">
          <div className="flex items-center justify-between py-1 border-b border-[#f3d2cc]/50">
            <span>Payment Method:</span>
            <strong className="text-[#261816]">Razorpay (Cards, UPI, Netbanking, Wallets)</strong>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-[#f3d2cc]/50">
            <span>Authoritative Amount:</span>
            <strong className="text-[#8b0000] text-sm">{formatPrice(total)}</strong>
          </div>
          <div className="flex items-center justify-between py-1">
            <span>Transaction Security:</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 256-Bit SHA-256 HMAC Verified
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-[#e3beb8] flex items-center gap-3 text-xs text-[#5a403c]">
          <Sparkles className="w-4 h-4 text-[#8b0000] shrink-0" />
          <span>
            Clicking <strong>Pay with Razorpay</strong> will open the official Razorpay test window. You can use any test card / UPI ID.
          </span>
        </div>
      </div>

      {/* Footer & Primary Action */}
      <div className="pt-4 flex items-center justify-between border-t border-[#ffe9e6]">
        <div>
          <span className="text-xs text-[#5a403c] font-medium block">Total Payable:</span>
          <span className="text-xl font-extrabold text-[#8b0000]">{formatPrice(total)}</span>
        </div>

        <button
          type="button"
          disabled={isProcessingPayment || isCreatingOrder}
          onClick={handleRazorpayPayment}
          className="px-8 py-3.5 bg-[#8b0000] hover:bg-[#a00000] active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isProcessingPayment ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Payment...</span>
            </>
          ) : isCreatingOrder ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Order...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Pay with Razorpay (Test Mode)</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
