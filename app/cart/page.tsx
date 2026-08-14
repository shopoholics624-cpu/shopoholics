"use client";

import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { getFormattedItemAttributes, getColorHex } from "@/lib/attribute-utils";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { FreeGiftBanner } from "@/components/cart/free-gift-banner";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Gift,
  CheckCircle2,
  Receipt,
  AlertTriangle,
} from "lucide-react";

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    toggleProtectionPlan,
    subtotal,
    tax,
    shippingCost,
    discountTotal,
    total,
    itemCount,
    hasFreeGiftBundle,
    freeGiftCount,
    updatingItemIds,
  } = useCart();

  const hasUnavailableItems = items.some(
    (item) => !item.isFreeGift && (item.unavailable || item.inStock === false || item.selectedVariant.inStock === false || item.selectedVariant.stockStatus === "outofstock")
  );

  return (
    <div className="py-8 sm:py-12 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8b0000] hover:underline mb-1"
            >
              <ArrowLeft className="w-4 h-4" /> Continue Shopping
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#261816]">
              Your Shopping Bag ({itemCount} {itemCount === 1 ? "Item" : "Items"})
            </h1>
          </div>
        </div>

        {/* Free Gift Unlocked Banner */}
        {hasFreeGiftBundle && <FreeGiftBanner giftCount={freeGiftCount} />}

        {hasUnavailableItems && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Some items in your cart are currently unavailable. Please remove unavailable items to proceed to checkout.</span>
          </div>
        )}

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items List */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item) => {
                if (item.isFreeGift) {
                  return (
                    <div
                      key={item.id}
                      className="bg-gradient-to-r from-[#ffe9e6]/80 via-white to-[#fff0ee]/80 rounded-3xl p-5 border-2 border-[#8b0000]/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {/* eslint-disable-next-img-element */}
                          <img
                            src={item.selectedVariant.image || item.product.featuredImage}
                            alt={item.product.title}
                            className="w-20 h-20 object-cover rounded-2xl border border-[#e3beb8]"
                          />
                          <span className="absolute -top-2 -left-2 px-2 py-0.5 bg-[#8b0000] text-white text-[8px] font-extrabold uppercase rounded-full shadow-md">
                            FREE
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[#8b0000]">
                            <Gift className="w-3.5 h-3.5 animate-bounce" />
                            <span className="text-[10px] font-extrabold uppercase tracking-wider">
                              {item.freeGiftDetails?.badgeText || "🎁 COMPLIMENTARY GIFT"}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-base text-[#261816]">
                            {item.product.title}
                          </h3>
                          <p className="text-xs text-[#5a403c] font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Included with your purchase</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#e3beb8]">
                        <div className="flex items-baseline gap-2">
                          <span className="font-extrabold text-lg text-emerald-700">₹0.00 FREE</span>
                          <span className="text-xs text-[#8e706b] line-through">
                            {formatPrice(item.freeGiftDetails?.giftOriginalPrice || 1490)}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#8e706b] font-bold">Auto-bundled item</span>
                      </div>
                    </div>
                  );
                }

                const isItemOutOfStock = item.unavailable || item.inStock === false || item.selectedVariant.inStock === false || item.selectedVariant.stockStatus === "outofstock";
                const attributesList = getFormattedItemAttributes(
                  item.selectedAttributes,
                  item.selectedVariant
                );

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-3xl p-6 border shadow-lux flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${
                      isItemOutOfStock ? "border-amber-300 bg-amber-50/20" : "border-[#e3beb8]/60"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* eslint-disable-next-img-element */}
                      <img
                        src={item.selectedVariant.image || item.product.featuredImage}
                        alt={item.product.title}
                        className="w-20 h-20 object-cover rounded-2xl border border-[#e3beb8]"
                      />

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[#8b0000] uppercase tracking-wider">
                            {item.product.categoryLabel}
                          </span>
                          {isItemOutOfStock && (
                            <span className="text-[9px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {item.unavailable ? "Unavailable" : "Out of Stock"}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-base text-[#261816]">
                          {item.product.title}
                        </h3>

                        {/* Clean Dynamic WooCommerce Attributes */}
                        {attributesList.length > 0 ? (
                          <div className="space-y-1 text-xs text-[#5a403c]">
                            {attributesList.map((attr) => (
                              <div key={attr.label} className="flex items-center gap-2">
                                <span className="text-[#8e706b] font-medium min-w-[56px]">
                                  {attr.label}:
                                </span>
                                <span className="font-semibold text-[#261816] flex items-center gap-1.5">
                                  {attr.label === "Colour" && (
                                    <span
                                      className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0 inline-block"
                                      style={{ backgroundColor: getColorHex(attr.value) }}
                                    />
                                  )}
                                  {attr.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-[#5a403c]">
                            Option: <span className="font-semibold">{item.selectedVariant.name}</span>
                          </p>
                        )}

                        {/* Protection Plan Checkbox UI (Visual State) */}
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
                            {item.hasProtectionPlan ? "2-Year VIP Protection Active" : "Add 2-Year VIP Protection"}
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
                            disabled={Boolean(updatingItemIds?.[item.id]) || item.quantity <= 1}
                            className="p-1 text-[#5a403c] hover:text-[#8b0000] rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-[#261816]">
                            {updatingItemIds?.[item.id] ? "..." : item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={Boolean(updatingItemIds?.[item.id])}
                            className="p-1 text-[#5a403c] hover:text-[#8b0000] rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
                );
              })}
            </div>

            {/* Order Summary Side Card */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#e3beb8]/80 shadow-lux space-y-6 sticky top-28">
              <h2 className="text-lg font-bold text-[#261816] flex items-center gap-2 border-b border-[#ffe9e6] pb-4">
                <Receipt className="w-5 h-5 text-[#8b0000]" />
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[#5a403c]">
                  <span>Subtotal</span>
                  <span className="font-extrabold text-[#261816]">{formatPrice(subtotal)}</span>
                </div>

                {discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Bundle Discount</span>
                    <span>-{formatPrice(discountTotal)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#5a403c]">
                  <span>Estimated Tax (GST 18%)</span>
                  <span className="font-bold text-[#261816]">
                    {tax > 0 ? formatPrice(tax) : "Calculated at Checkout"}
                  </span>
                </div>

                <div className="flex justify-between text-[#5a403c]">
                  <span>Express Shipping</span>
                  <span className="font-bold text-emerald-700">
                    {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
                  </span>
                </div>

                <div className="border-t border-[#ffe9e6] pt-3 flex justify-between items-baseline">
                  <span className="font-extrabold text-[#261816]">Estimated Total</span>
                  <span className="font-extrabold text-2xl text-[#8b0000]">{formatPrice(total)}</span>
                </div>
              </div>

              {hasUnavailableItems ? (
                <button
                  disabled
                  className="w-full py-4 bg-gray-300 text-gray-500 font-extrabold text-sm rounded-2xl cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Remove Unavailable Items</span>
                </button>
              ) : (
                <Link
                  href="/checkout/shipping"
                  className="w-full py-4 bg-[#8b0000] text-white font-extrabold text-sm rounded-2xl hover:bg-[#6b0000] transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <span>Proceed to Express Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#ffe9e6] text-[#8b0000] mx-auto flex items-center justify-center shadow-inner">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-[#261816]">Your cart is currently empty</h2>
            <p className="text-xs text-[#5a403c]">
              Explore our luxury tech store for flagship smartphones, laptops, audio, and accessories.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#8b0000] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#6b0000] transition-all"
            >
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
