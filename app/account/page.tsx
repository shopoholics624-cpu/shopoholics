"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DemoLink as Link } from "@/components/demo/demo-link";
import {
  User,
  Package,
  MapPin,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { DeleteAccountSection } from "@/components/account/delete-account-section";

interface CustomerProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone?: string;
  billing?: any;
  shipping?: any;
}

export default function AccountDashboardPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAccountData() {
      try {
        // 1. Fetch authenticated customer identity
        const meRes = await fetch("/api/auth/me?full=true", { cache: "no-store" });
        if (!meRes.ok) {
          if (isMounted) router.push("/login");
          return;
        }

        const meData = await meRes.json();
        if (!meData.success || !meData.customer) {
          if (isMounted) router.push("/login");
          return;
        }

        if (isMounted) setCustomer(meData.customer);

        // 2. Fetch customer's WooCommerce orders
        const ordersRes = await fetch("/api/account/orders");
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          if (isMounted && ordersData.success && Array.isArray(ordersData.orders)) {
            setRecentOrders(ordersData.orders.slice(0, 3));
          }
        }
      } catch (err) {
        if (isMounted) setError("Failed to load customer account information.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadAccountData();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 bg-white min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#8b0000] animate-spin" />
        <p className="text-xs font-bold text-[#8e706b] uppercase tracking-wider">
          Loading Customer Dashboard...
        </p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="py-16 bg-white min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center px-4">
        <AlertCircle className="w-10 h-10 text-red-600" />
        <p className="text-sm font-semibold text-[#261816]">{error || "Unable to access customer account."}</p>
        <Link
          href="/login"
          className="px-6 py-2.5 bg-[#8b0000] text-white rounded-xl text-xs font-bold uppercase tracking-wider"
        >
          Sign In Again
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* User Account Header Banner */}
        <div className="bg-gradient-to-r from-[#3d2c2a] via-[#610000] to-[#3d2c2a] text-white p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-[#8e706b]/40 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white font-bold text-2xl border border-white/20 shrink-0">
              <User className="w-8 h-8 text-[#ff907f]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-[#ff907f] uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                  WooCommerce Customer #{customer.id}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                Welcome, {customer.firstName || "Valued Customer"}
              </h1>
              <p className="text-xs text-[#e3beb8] mt-0.5">{customer.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-red-600/30 text-white text-xs font-extrabold uppercase tracking-wider border border-white/20 transition-all flex items-center gap-2 relative z-10 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Admin Quick Action Banner */}
        <div className="bg-gradient-to-r from-[#8b0000] to-[#590000] rounded-2xl p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              Admin Quick Access
            </span>
            <h3 className="text-base font-extrabold text-white mt-1">
              Storefront & Homepage Management
            </h3>
            <p className="text-xs text-white/80 mt-0.5">
              Manage Hero Banners, Top Announcement Ticker, and Promotional Deals in real time.
            </p>
          </div>

          <Link
            href="/admin/homepage"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#8b0000] hover:bg-[#fff0ee] font-black text-xs shadow-md transition-all shrink-0 self-start sm:self-auto"
          >
            <span>Open Admin Panel</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/account/orders"
            className="p-6 rounded-2xl bg-[#faf5f4] hover:bg-[#ffe9e6] border border-[#e3beb8] transition-all group shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#8b0000] text-white flex items-center justify-center shadow-md">
                <Package className="w-5 h-5" />
              </div>
              <ChevronRight className="w-5 h-5 text-[#8e706b] group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#261816]">Order History</h3>
              <p className="text-xs text-[#5a403c] mt-0.5">Track & view past WooCommerce orders</p>
            </div>
          </Link>

          <Link
            href="/account/addresses"
            className="p-6 rounded-2xl bg-[#faf5f4] hover:bg-[#ffe9e6] border border-[#e3beb8] transition-all group shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#8b0000] text-white flex items-center justify-center shadow-md">
                <MapPin className="w-5 h-5" />
              </div>
              <ChevronRight className="w-5 h-5 text-[#8e706b] group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#261816]">Saved Addresses</h3>
              <p className="text-xs text-[#5a403c] mt-0.5">Manage billing & shipping locations</p>
            </div>
          </Link>

          <Link
            href="/account/details"
            className="p-6 rounded-2xl bg-[#faf5f4] hover:bg-[#ffe9e6] border border-[#e3beb8] transition-all group shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#8b0000] text-white flex items-center justify-center shadow-md">
                <User className="w-5 h-5" />
              </div>
              <ChevronRight className="w-5 h-5 text-[#8e706b] group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#261816]">Account Details</h3>
              <p className="text-xs text-[#5a403c] mt-0.5">Edit personal profile & information</p>
            </div>
          </Link>

          <Link
            href="/shop"
            className="p-6 rounded-2xl bg-[#faf5f4] hover:bg-[#ffe9e6] border border-[#e3beb8] transition-all group shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#8b0000] text-white flex items-center justify-center shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <ChevronRight className="w-5 h-5 text-[#8e706b] group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#261816]">Shop Catalog</h3>
              <p className="text-xs text-[#5a403c] mt-0.5">Explore premium hardware & deals</p>
            </div>
          </Link>
        </div>

        {/* Recent WooCommerce Orders Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#261816]">Recent Orders</h2>
            <Link
              href="/account/orders"
              className="text-xs font-bold text-[#8b0000] hover:underline flex items-center gap-1"
            >
              View All Orders <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-8 text-center bg-[#faf5f4] rounded-2xl border border-[#e3beb8] space-y-3">
              <Package className="w-10 h-10 text-[#8e706b] mx-auto opacity-50" />
              <p className="text-sm font-bold text-[#261816]">No recent orders found</p>
              <p className="text-xs text-[#5a403c]">You have not placed any WooCommerce orders yet.</p>
              <Link
                href="/shop"
                className="inline-block px-5 py-2 bg-[#8b0000] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:bg-[#a00000]"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-6 rounded-2xl bg-white border border-[#e3beb8] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#261816]">
                        Order #{order.number}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#ffe9e6] text-[#8b0000] border border-[#e3beb8]">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#8e706b]">
                      Placed on {new Date(order.dateCreated).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-[#8e706b]">Total Amount</p>
                      <p className="text-base font-extrabold text-[#8b0000]">
                        {formatPrice(order.total)}
                      </p>
                    </div>

                    <Link
                      href={`/account/orders/${order.id}`}
                      className="px-4 py-2 bg-[#8b0000] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#a00000] transition-colors"
                    >
                      View Order
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Danger Zone - Permanent Account Deletion */}
        <div className="pt-4">
          <DeleteAccountSection />
        </div>
      </div>
    </div>
  );
}
