"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DemoLink as Link } from "@/components/demo/demo-link";
import {
  ArrowLeft,
  Package,
  ShieldCheck,
  MapPin,
  CreditCard,
  Calendar,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface OrderDetail {
  id: string;
  number: string;
  status: string;
  currency: string;
  dateCreated: string;
  discountTotal: number;
  shippingTotal: number;
  totalTax: number;
  subtotal: number;
  total: number;
  paymentMethodTitle: string;
  transactionId: string;
  billing: any;
  shipping: any;
  lineItems: any[];
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchOrderDetail() {
      try {
        const res = await fetch(`/api/account/orders/${orderId}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          if (isMounted) {
            setErrorStatus(res.status);
            setErrorMessage(data.message || "Failed to load order details.");
          }
          return;
        }

        if (isMounted) {
          setOrder(data.order);
        }
      } catch (err) {
        if (isMounted) {
          setErrorStatus(500);
          setErrorMessage("Network error while loading order details.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchOrderDetail();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="py-16 bg-white min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#8b0000] animate-spin" />
        <p className="text-xs font-bold text-[#8e706b] uppercase tracking-wider">
          Fetching Order #{orderId} Details...
        </p>
      </div>
    );
  }

  // Handle Unauthorized (401) or Forbidden (403 Order Ownership Protection)
  if (errorStatus === 403 || errorStatus === 401 || !order) {
    return (
      <div className="py-16 bg-white min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-[#261816]">Access Denied</h2>
        <p className="text-xs text-[#5a403c] max-w-md leading-relaxed">
          {errorMessage || "You do not have permission to access or view this order record."}
        </p>
        <Link
          href="/account/orders"
          className="px-6 py-2.5 bg-[#8b0000] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#a00000] transition-colors"
        >
          Return to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Navigation Back */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#8b0000] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Order History
          </Link>
          <div className="text-xs text-[#8e706b] font-medium">
            Order Reference ID: <span className="font-mono text-[#261816]">{order.id}</span>
          </div>
        </div>

        {/* Header Summary Banner */}
        <div className="bg-gradient-to-r from-[#3d2c2a] via-[#610000] to-[#3d2c2a] text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[#8e706b]/40">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Order #{order.number}
              </h1>
              <span className="text-[10px] px-3 py-1 rounded-full font-extrabold uppercase tracking-wider bg-white/10 text-white border border-white/20">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-[#e3beb8] flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#ff907f]" />
              Placed on {new Date(order.dateCreated).toLocaleDateString("en-IN", { dateStyle: "full" })}
            </p>
          </div>

          <div className="text-left md:text-right space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#ff907f] block">Total Amount Paid</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Item Breakdown Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-[#e3beb8] shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-[#261816] flex items-center gap-2">
                <Package className="w-5 h-5 text-[#8b0000]" /> Itemized Products
              </h3>

              <div className="divide-y divide-[#ffe9e6]">
                {order.lineItems.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-sm text-[#261816]">{item.name}</h4>
                      {item.sku && (
                        <p className="text-[10px] text-[#8e706b] font-mono">SKU: {item.sku}</p>
                      )}
                      {Array.isArray(item.metaData) && item.metaData.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.metaData.map((m: any, idx: number) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-[#faf5f4] text-[#5a403c] px-2 py-0.5 rounded border border-[#e3beb8]"
                            >
                              {m.key}: {m.value}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-[#8e706b]">Quantity: {item.quantity}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-sm text-[#8b0000]">
                        {formatPrice(item.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary Box */}
            <div className="p-6 rounded-3xl bg-[#faf5f4] border border-[#e3beb8] space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#261816]">
                Payment Breakdown
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#5a403c]">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#261816]">{formatPrice(order.subtotal)}</span>
                </div>
                {order.shippingTotal > 0 && (
                  <div className="flex justify-between text-[#5a403c]">
                    <span>Shipping</span>
                    <span className="font-bold text-[#261816]">{formatPrice(order.shippingTotal)}</span>
                  </div>
                )}
                {order.totalTax > 0 && (
                  <div className="flex justify-between text-[#5a403c]">
                    <span>Estimated Tax</span>
                    <span className="font-bold text-[#261816]">{formatPrice(order.totalTax)}</span>
                  </div>
                )}
                {order.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount Savings</span>
                    <span>-{formatPrice(order.discountTotal)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-[#e3beb8] flex justify-between items-baseline text-sm font-extrabold text-[#261816]">
                  <span>Total Order Cost</span>
                  <span className="text-lg text-[#8b0000]">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Payment Info */}
            <div className="p-6 rounded-3xl bg-white border border-[#e3beb8] shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#261816] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#8b0000]" /> Payment Details
              </h3>
              <div className="text-xs space-y-1">
                <p className="font-bold text-[#261816]">{order.paymentMethodTitle || "Online Payment"}</p>
                {order.transactionId && (
                  <p className="text-[10px] text-[#8e706b] font-mono">
                    Txn ID: {order.transactionId}
                  </p>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-6 rounded-3xl bg-white border border-[#e3beb8] shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#261816] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#8b0000]" /> Shipping Address
              </h3>
              <div className="text-xs text-[#5a403c] space-y-0.5">
                <p className="font-bold text-[#261816]">
                  {order.shipping?.first_name} {order.shipping?.last_name}
                </p>
                <p>{order.shipping?.address_1}</p>
                {order.shipping?.address_2 && <p>{order.shipping?.address_2}</p>}
                <p>
                  {order.shipping?.city}, {order.shipping?.state} {order.shipping?.postcode}
                </p>
                <p>{order.shipping?.country}</p>
                {order.shipping?.phone && <p className="pt-1">Phone: {order.shipping?.phone}</p>}
              </div>
            </div>

            {/* Billing Address */}
            <div className="p-6 rounded-3xl bg-white border border-[#e3beb8] shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#261816] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#8b0000]" /> Billing Address
              </h3>
              <div className="text-xs text-[#5a403c] space-y-0.5">
                <p className="font-bold text-[#261816]">
                  {order.billing?.first_name} {order.billing?.last_name}
                </p>
                <p>{order.billing?.address_1}</p>
                {order.billing?.address_2 && <p>{order.billing?.address_2}</p>}
                <p>
                  {order.billing?.city}, {order.billing?.state} {order.billing?.postcode}
                </p>
                <p>{order.billing?.country}</p>
                {order.billing?.email && <p className="pt-1">Email: {order.billing?.email}</p>}
                {order.billing?.phone && <p>Phone: {order.billing?.phone}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
