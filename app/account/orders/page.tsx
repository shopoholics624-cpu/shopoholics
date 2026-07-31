"use client";

import { PRODUCTS } from "@/constants/products";
import { formatPrice } from "@/lib/utils";
import { useDemo } from "@/hooks/use-demo";
import { Package, Truck, ShieldCheck, User, MapPin } from "lucide-react";

export default function AccountOrdersPage() {
  const { isDemoMode, handleDemoAction } = useDemo();

  const mockOrders = [
    {
      id: "CL-94820-2026",
      date: "July 31, 2026",
      status: "In Transit",
      estimatedDelivery: "August 3, 2026",
      trackingNumber: "TRK-8849-CLX",
      product: PRODUCTS[0],
      variant: "Deep Crimson / 512GB",
      total: 1299,
    },
    {
      id: "CL-88310-2026",
      date: "June 14, 2026",
      status: "Delivered",
      estimatedDelivery: "June 16, 2026",
      trackingNumber: "TRK-4102-CLX",
      product: PRODUCTS[2],
      variant: "Crimson Red",
      total: 549,
    },
  ];

  return (
    <div className="py-10 bg-[#fff8f6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* User Account Header Banner */}
        <div className="bg-gradient-to-r from-[#3d2c2a] via-[#610000] to-[#3d2c2a] text-white p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-[#8e706b]/40">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white font-bold text-2xl border border-white/20">
              <User className="w-8 h-8 text-[#ff907f]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#ff907f] uppercase tracking-wider">
                Registered Client
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Alexander Wright
              </h1>
              <p className="text-xs text-[#e3beb8] mt-0.5">alexander@crimsonluxe.com</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-[#e3beb8]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>2 Active Hardware Warranties</span>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Orders & Tracking Column */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-xl font-extrabold text-[#261816] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#8b0000]" /> Recent Orders & Live Tracking
            </h2>

            <div className="space-y-6">
              {mockOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 border border-[#e3beb8]/60 shadow-lux space-y-6"
                >
                  {/* Header Row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#ffe9e6] text-xs">
                    <div>
                      <span className="text-[#8e706b] block">Order Ref</span>
                      <span className="font-mono font-bold text-[#261816]">{order.id}</span>
                    </div>

                    <div>
                      <span className="text-[#8e706b] block">Date Placed</span>
                      <span className="font-bold text-[#261816]">{order.date}</span>
                    </div>

                    <div>
                      <span className="text-[#8e706b] block">Total</span>
                      <span className="font-bold text-[#8b0000]">{formatPrice(order.total)}</span>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === "Delivered"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-[#ffe9e6] text-[#8b0000]"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-img-element */}
                    <img
                      src={order.product.featuredImage}
                      alt={order.product.title}
                      className="w-16 h-16 object-cover rounded-2xl border border-[#e3beb8]"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-[#261816]">
                        {order.product.title}
                      </h4>
                      <p className="text-xs text-[#5a403c]">{order.variant}</p>
                    </div>
                  </div>

                  {/* Tracking Timeline Component */}
                  {order.status === "In Transit" && (
                    <div className="bg-[#fff8f6] rounded-2xl p-4 border border-[#e3beb8]/40 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-[#8b0000]">
                        <span className="flex items-center gap-1.5">
                          <Truck className="w-4 h-4" /> Live Tracking: {order.trackingNumber}
                        </span>
                        <span>Est. Delivery: {order.estimatedDelivery}</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-[#ffe9e6] h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-[#8b0000] to-[#e51c10] h-full w-[70%]" />
                      </div>

                      <div className="flex justify-between text-[11px] font-semibold text-[#5a403c]">
                        <span className="text-[#8b0000]">Processing</span>
                        <span className="text-[#8b0000]">Dispatched</span>
                        <span className="text-[#8b0000] font-bold">In Transit</span>
                        <span>Delivered</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Account Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#e3beb8]/60 shadow-lux space-y-4">
              <h3 className="text-base font-extrabold text-[#261816] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#8b0000]" /> Saved Primary Address
              </h3>
              <div className="text-xs text-[#5a403c] space-y-1">
                <p className="font-bold text-[#261816]">Alexander Wright</p>
                <p>742 Fifth Avenue, Suite 1800</p>
                <p>New York, NY 10019, United States</p>
                <p className="text-[#8e706b] pt-1">+1 (555) 019-2834</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#e3beb8]/60 shadow-lux space-y-4">
              <h3 className="text-base font-extrabold text-[#261816] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#8b0000]" /> Concierge Direct Support
              </h3>
              <p className="text-xs text-[#5a403c] leading-relaxed">
                As a valued customer, you enjoy direct priority line access for hardware diagnostics, battery replacements, and custom laser engravings.
              </p>
              <button
                onClick={(e) => isDemoMode && handleDemoAction(e)}
                className="w-full py-3 bg-[#8b0000] text-white rounded-xl text-xs font-bold hover:bg-[#bc0000] transition-colors min-h-[44px]"
              >
                Contact Hardware Specialist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
