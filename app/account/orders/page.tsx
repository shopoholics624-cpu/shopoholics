"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { Package, ArrowLeft, Loader2, AlertCircle, ChevronRight, ExternalLink } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  total: number;
}

interface CustomerOrder {
  id: string;
  number: string;
  status: string;
  dateCreated: string;
  total: number;
  currency: string;
  paymentMethodTitle: string;
  itemCount: number;
  lineItems: OrderItem[];
}

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchOrders() {
      try {
        const res = await fetch("/api/account/orders");
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          if (isMounted) setError("Failed to fetch customer orders from WooCommerce.");
          return;
        }

        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      } catch (err) {
        if (isMounted) setError("Network error while retrieving orders.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="py-16 bg-white min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#8b0000] animate-spin" />
        <p className="text-xs font-bold text-[#8e706b] uppercase tracking-wider">
          Fetching WooCommerce Customer Orders...
        </p>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header & Back Link */}
        <div className="space-y-2">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#8b0000] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Account Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#261816] tracking-tight">
                Order History
              </h1>
              <p className="text-xs sm:text-sm text-[#5a403c]">
                View & track all WooCommerce orders associated with your customer account.
              </p>
            </div>
            <div className="text-xs font-bold text-[#8b0000] bg-[#ffe9e6] px-3.5 py-1.5 rounded-full border border-[#e3beb8] self-start sm:self-auto">
              Total Orders: {orders.length}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="p-12 text-center bg-[#faf5f4] rounded-3xl border border-[#e3beb8] space-y-4">
            <Package className="w-12 h-12 text-[#8e706b] mx-auto opacity-40" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#261816]">No WooCommerce Orders Found</h3>
              <p className="text-xs text-[#5a403c]">
                You haven&apos;t placed any orders yet. When you complete checkout while signed in, your orders will appear here.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-block px-6 py-3 bg-[#8b0000] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg hover:bg-[#a00000] transition-colors"
            >
              Browse Products & Shop
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-6 rounded-3xl bg-white border border-[#e3beb8] shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ffe9e6]">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-extrabold text-[#261816]">
                        Order #{order.number}
                      </h3>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider border ${
                          order.status === "completed"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : order.status === "processing"
                            ? "bg-blue-100 text-blue-800 border-blue-300"
                            : "bg-[#ffe9e6] text-[#8b0000] border-[#e3beb8]"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#8e706b] mt-0.5">
                      Placed on {new Date(order.dateCreated).toLocaleDateString("en-IN", { dateStyle: "full" })}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-[#8e706b] block">Total</span>
                      <span className="text-lg font-extrabold text-[#8b0000]">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="px-4 py-2.5 bg-[#8b0000] hover:bg-[#a00000] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                    >
                      View Details <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Line Items Summary */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e706b] block">
                    Ordered Products ({order.itemCount} items)
                  </span>
                  <div className="space-y-1.5">
                    {order.lineItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs py-1 px-3 rounded-lg bg-[#faf5f4]"
                      >
                        <span className="font-semibold text-[#261816]">
                          {item.name} <span className="text-[#8e706b] font-normal">x{item.quantity}</span>
                        </span>
                        <span className="font-bold text-[#8b0000]">
                          {formatPrice(item.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
