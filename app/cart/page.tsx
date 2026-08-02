"use client";

import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { DemoLink as Link } from "@/components/demo/demo-link";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    toggleProtectionPlan,
    subtotal,
    protectionSubtotal,
    tax,
    shippingCost,
    total,
    itemCount,
  } = useCart();

  return (
    <div className="py-10 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8b0000] hover:underline mb-1"
            >
              <ArrowLeft className="w-4 h-4" /> Continue Shopping
            </Link>
            <h1 className="text-3xl font-extrabold text-[#261816]">
              Your Shopping Bag ({itemCount} {itemCount === 1 ? "Item" : "Items"})
            </h1>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items List */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-6 border border-[#e3beb8]/60 shadow-lux flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-img-element */}
                    <img
                      src={item.selectedVariant.image || item.product.featuredImage}
                      alt={item.product.title}
                      className="w-20 h-20 object-cover rounded-2xl border border-[#e3beb8]"
                    />

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#8b0000] uppercase tracking-wider">
                        {item.product.categoryLabel}
                      </span>
                      <h3 className="font-bold text-base text-[#261816]">
                        {item.product.title}
                      </h3>
                      <p className="text-xs text-[#5a403c]">
                        Finish: <span className="font-semibold">{item.selectedVariant.name}</span>
                      </p>

                      {/* Protection Plan Checkbox */}
                      <button
                        onClick={() => toggleProtectionPlan(item.id)}
                        className={`flex items-center gap-2 mt-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          item.hasProtectionPlan
                            ? "bg-[#ffe9e6] text-[#8b0000] border-[#8b0000]"
                            : "bg-[#fff8f6] text-[#5a403c] border-[#e3beb8]"
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4 text-[#e51c10]" />
                        <span>
                          {item.hasProtectionPlan ? "2-Year VIP Protection Active (+$99)" : "Add 2-Year VIP Protection (+$99)"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Quantity Stepper & Price */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-[#ffe9e6]">
                    <span className="font-extrabold text-xl text-[#8b0000]">
                      {formatPrice(item.selectedVariant.price * item.quantity)}
                    </span>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-[#e3beb8] rounded-xl bg-[#fff8f6] p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-[#5a403c] hover:text-[#8b0000] rounded-lg hover:bg-white"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-[#261816]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-[#5a403c] hover:text-[#8b0000] rounded-lg hover:bg-white"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-[#8e706b] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#e3beb8]/60 shadow-lux space-y-6 sticky top-28">
              <h3 className="text-lg font-extrabold text-[#261816] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#8b0000]" /> Order Summary
              </h3>

              <div className="space-y-3 text-xs text-[#5a403c] pb-4 border-b border-[#ffe9e6]">
                <div className="flex justify-between">
                  <span>Hardware Subtotal</span>
                  <span className="font-bold text-[#261816]">{formatPrice(subtotal)}</span>
                </div>

                {protectionSubtotal > 0 && (
                  <div className="flex justify-between">
                    <span>VIP Coverage Add-ons</span>
                    <span className="font-bold text-[#261816]">{formatPrice(protectionSubtotal)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated State Tax (8%)</span>
                  <span className="font-bold text-[#261816]">{formatPrice(tax)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Express Courier Delivery</span>
                  <span className="font-bold text-emerald-700">
                    {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-baseline pt-2">
                <span className="text-sm font-bold text-[#261816]">Order Total</span>
                <span className="text-2xl font-extrabold text-[#8b0000]">
                  {formatPrice(total)}
                </span>
              </div>

              <Link
                href="/checkout/shipping"
                className="w-full py-4 rounded-xl bg-[#8b0000] hover:bg-[#bc0000] text-white font-bold text-sm transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Proceed to Shipping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#e3beb8] shadow-lux space-y-4">
            <ShoppingBag className="w-12 h-12 text-[#8b0000] mx-auto opacity-40" />
            <h3 className="text-2xl font-bold text-[#261816]">Your Bag is Empty</h3>
            <p className="text-sm text-[#5a403c] max-w-md mx-auto">
              Discover titanium smart devices and high-resolution audio systems in our store.
            </p>
            <Link
              href="/shop"
              className="inline-block px-6 py-3 bg-[#8b0000] text-white font-bold text-xs rounded-xl hover:bg-[#bc0000] transition-colors"
            >
              Start Shopping Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
