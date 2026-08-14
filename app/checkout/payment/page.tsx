"use client";

import { useCart } from "@/hooks/use-cart";
import { useDemo } from "@/hooks/use-demo";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import {
  CreditCard,
  Lock,
  ArrowRight,
  Receipt,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FlaskConical,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function PaymentPage() {
  const router = useRouter();
  const { shippingAddress, paymentDetails, setPaymentDetails, gstDetails, total, clearCart } = useCart();
  const { isDemoMode, handleDemoAction } = useDemo();

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [providerMode, setProviderMode] = useState<"development" | "razorpay">("development");
  const [paymentStatusNotice, setPaymentStatusNotice] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  const pendingCreationRef = useRef(false);

  // Load Razorpay JS SDK script dynamically if in Razorpay mode
  useEffect(() => {
    if (providerMode === "razorpay" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [providerMode]);

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
            paymentDetails,
            gstDetails,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success && data.order) {
          setCreatedOrder(data.order);
        } else {
          setErrorMessage(data.message || "Failed to initialize WooCommerce checkout order.");
        }
      } catch (err) {
        console.error("[PaymentPage Order Creation Error]:", err);
        setErrorMessage("Unable to connect to order creation server.");
      } finally {
        setIsCreatingOrder(false);
      }
    }

    ensureOrderCreated();
  }, [shippingAddress, paymentDetails, gstDetails, createdOrder]);

  // Handle Razorpay Payment Flow
  const handleRazorpayPayment = async () => {
    setErrorMessage(null);
    setPaymentStatusNotice(null);

    let activeOrder = createdOrder;

    if (!activeOrder) {
      setIsCreatingOrder(true);
      try {
        const createRes = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shippingAddress, paymentDetails, gstDetails }),
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
      // 1. Create Razorpay Payment Order Server-side
      const res = await fetch("/api/payment/razorpay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wooOrderId: activeOrder.id }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.mode === "development") {
          setProviderMode("development");
          setPaymentStatusNotice({
            type: "warning",
            message: data.message || "Switching to Development Test Mode as Razorpay credentials are not yet set.",
          });
        } else {
          setErrorMessage(data.message || "Failed to launch Razorpay payment order.");
        }
        setIsProcessingPayment(false);
        return;
      }

      // Check if Razorpay JS SDK loaded
      if (typeof window.Razorpay !== "function") {
        setErrorMessage("Razorpay Checkout SDK failed to load. Please check your internet connection.");
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
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
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
                paymentMethod: "Razorpay Secure Gateway",
                razorpayPaymentId: response.razorpay_payment_id,
                paidAt: new Date().toISOString(),
              };

              try {
                localStorage.setItem("shopoholics_last_order", JSON.stringify(finalPaidOrder));
              } catch {
                // ignore
              }

              clearCart();
              router.push("/checkout/success");
            } else {
              setErrorMessage(
                verifyData.message || "Razorpay payment signature verification failed. Cart remains intact."
              );
            }
          } catch (err) {
            console.error("[Razorpay Verify Callback Error]:", err);
            setErrorMessage("Error verifying payment signature with server.");
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            setPaymentStatusNotice({
              type: "warning",
              message: "Razorpay payment window closed. Your order and cart remain intact for retry.",
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

  // Execute Development Test Payment Simulation
  const handleTestPaymentSimulation = async (result: "success" | "failed" | "cancelled") => {
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
          body: JSON.stringify({ shippingAddress, paymentDetails, gstDetails }),
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
      const res = await fetch("/api/payment/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: activeOrder.id,
          result,
        }),
      });

      const data = await res.json();

      if (result === "success" && data.success) {
        const finalPaidOrder = {
          ...activeOrder,
          status: "processing",
          paymentMethod: "Development Test Payment",
          paidAt: new Date().toISOString(),
        };

        try {
          localStorage.setItem("shopoholics_last_order", JSON.stringify(finalPaidOrder));
        } catch {
          // ignore
        }

        clearCart();
        router.push("/checkout/success");
      } else if (result === "failed") {
        setPaymentStatusNotice({
          type: "error",
          message: data.message || "Development Test Payment Failed. Cart remains intact. You may retry.",
        });
      } else {
        setPaymentStatusNotice({
          type: "warning",
          message: data.message || "Development Test Payment Cancelled. Cart remains intact. You may retry.",
        });
      }
    } catch (err) {
      console.error("[PaymentPage Test Payment Error]:", err);
      setErrorMessage("Network error processing payment simulation. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e3beb8]/60 shadow-lux space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#ffe9e6]">
        <div>
          <h2 className="text-xl font-extrabold text-[#261816]">256-Bit Encrypted Payment</h2>
          <p className="text-xs text-[#5a403c]">Select your preferred luxury payment method.</p>
        </div>
        <Lock className="w-6 h-6 text-[#8b0000]" />
      </div>

      {/* Provider Switch Toggle */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-[#fff8f6] border border-[#e3beb8]/60 text-xs">
        <div className="flex items-center gap-2 text-[#5a403c]">
          <ShieldCheck className="w-4 h-4 text-[#8b0000]" />
          <span>Active Provider Architecture: <strong>{providerMode.toUpperCase()}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setProviderMode("development")}
            className={`px-3 py-1 rounded-xl font-bold transition-colors ${
              providerMode === "development"
                ? "bg-[#8b0000] text-white"
                : "bg-white text-[#5a403c] border border-[#e3beb8]"
            }`}
          >
            Dev Test Mode
          </button>
          <button
            type="button"
            onClick={() => setProviderMode("razorpay")}
            className={`px-3 py-1 rounded-xl font-bold transition-colors ${
              providerMode === "razorpay"
                ? "bg-[#8b0000] text-white"
                : "bg-white text-[#5a403c] border border-[#e3beb8]"
            }`}
          >
            Razorpay Mode
          </button>
        </div>
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

      {/* Payment Method Selector Tabs */}
      <div className="grid grid-cols-3 gap-3">
        {(["card", "apple_pay", "crypto"] as const).map((method) => (
          <button
            key={method}
            type="button"
            onClick={(e) => {
              if (isDemoMode) {
                handleDemoAction(e);
                return;
              }
              setPaymentDetails({ ...paymentDetails, method });
            }}
            className={`p-3.5 rounded-2xl border-2 text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
              paymentDetails.method === method
                ? "border-[#8b0000] bg-[#ffe9e6]/40 text-[#8b0000]"
                : "border-[#e3beb8]/50 text-[#5a403c] hover:border-[#8b0000]/40"
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="capitalize">{method.replace("_", " ")}</span>
          </button>
        ))}
      </div>

      {/* Card Input fields (Visual Mock / Preset Data) */}
      <div className="space-y-4 pt-2">
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#5a403c] uppercase">Cardholder Name</label>
          <input
            type="text"
            required
            value={paymentDetails.cardName}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, cardName: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-white text-xs font-semibold border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-[#5a403c] uppercase">Card Number</label>
          <input
            type="text"
            required
            value={paymentDetails.cardNumber}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-white text-xs font-semibold border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5a403c] uppercase">Expiry Date</label>
            <input
              type="text"
              placeholder="MM/YY"
              required
              value={paymentDetails.cardExpiry}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, cardExpiry: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white text-xs font-semibold border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5a403c] uppercase">CVC Code</label>
            <input
              type="text"
              maxLength={4}
              required
              value={paymentDetails.cardCvc}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, cardCvc: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white text-xs font-semibold border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
            />
          </div>
        </div>
      </div>

      {/* Phase 4.3A Development Payment Environment Section */}
      {providerMode === "development" ? (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#fff8f6] via-white to-[#ffe9e6]/50 border-2 border-[#8b0000]/30 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#e3beb8]/60">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-[#8b0000] animate-pulse" />
              <div>
                <span className="text-xs font-extrabold text-[#8b0000] uppercase tracking-wider block">
                  Development Payment Environment
                </span>
                <span className="text-[11px] text-[#5a403c] font-medium block">
                  This is a test payment environment. No real money will be charged.
                </span>
              </div>
            </div>
            {createdOrder && (
              <span className="px-2.5 py-1 bg-[#8b0000] text-white text-[10px] font-mono font-bold rounded-lg shrink-0">
                WooCommerce Order {createdOrder.orderNumber}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#5a403c] uppercase block">
              Simulate Gateway Action
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                disabled={isProcessingPayment || isCreatingOrder}
                onClick={() => handleTestPaymentSimulation("success")}
                className="px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulate Successful Payment</span>
              </button>

              <button
                type="button"
                disabled={isProcessingPayment || isCreatingOrder}
                onClick={() => handleTestPaymentSimulation("failed")}
                className="px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Simulate Failed Payment</span>
              </button>

              <button
                type="button"
                disabled={isProcessingPayment || isCreatingOrder}
                onClick={() => handleTestPaymentSimulation("cancelled")}
                className="px-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Simulate Cancelled Payment</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-emerald-50/50 border-2 border-emerald-600/30 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <div>
                <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider block">
                  Razorpay Secure Gateway Architecture
                </span>
                <span className="text-[11px] text-[#5a403c] font-medium block">
                  Official Razorpay Modal Checkout & Server Signature Verification
                </span>
              </div>
            </div>
            {createdOrder && (
              <span className="px-2.5 py-1 bg-emerald-800 text-white text-[10px] font-mono font-bold rounded-lg shrink-0">
                WooCommerce Order {createdOrder.orderNumber}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={isProcessingPayment || isCreatingOrder}
            onClick={handleRazorpayPayment}
            className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {isProcessingPayment
                ? "Launching Razorpay Modal..."
                : isCreatingOrder
                ? "Creating WooCommerce Order..."
                : "Pay with Razorpay Checkout"}
            </span>
          </button>
        </div>
      )}

      {/* Footer & Primary Action */}
      <div className="pt-4 flex items-center justify-between border-t border-[#ffe9e6]">
        <div>
          <span className="text-xs text-[#5a403c] font-medium block">Total Charged:</span>
          <span className="text-xl font-extrabold text-[#8b0000]">{formatPrice(total)}</span>
        </div>

        <button
          type="button"
          disabled={isProcessingPayment || isCreatingOrder}
          onClick={providerMode === "razorpay" ? handleRazorpayPayment : () => handleTestPaymentSimulation("success")}
          className="px-8 py-3.5 bg-[#8b0000] text-white font-bold text-xs rounded-xl shadow-lg hover:bg-[#bc0000] transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <span>
            {isProcessingPayment
              ? "Verifying Payment..."
              : isCreatingOrder
              ? "Allocating WooCommerce Order..."
              : providerMode === "razorpay"
              ? "Pay via Razorpay Modal"
              : "Complete Purchase (Test)"}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
