"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { CartItem, ShippingAddress, PaymentDetails, GstDetails } from "@/types/cart";
import { Product, ProductVariant } from "@/types/product";
import { getFreeGiftBundle, createFreeGiftCartItem } from "@/lib/bundle-utils";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  toggleProtectionPlan: (itemId: string) => void;
  clearCart: () => void;
  subtotal: number;
  protectionSubtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  itemCount: number;
  hasFreeGiftBundle: boolean;
  freeGiftCount: number;
  shippingAddress: ShippingAddress;
  setShippingAddress: (addr: ShippingAddress) => void;
  paymentDetails: PaymentDetails;
  setPaymentDetails: (payment: PaymentDetails) => void;
  gstDetails: GstDetails;
  setGstDetails: (gst: GstDetails) => void;
}

const defaultShipping: ShippingAddress = {
  fullName: "Alexander Wright",
  email: "alexander@crimsonluxe.com",
  phone: "+1 (555) 019-2834",
  addressLine1: "742 Fifth Avenue",
  addressLine2: "Suite 1800",
  city: "New York",
  state: "NY",
  postalCode: "10019",
  country: "United States",
};

const defaultPayment: PaymentDetails = {
  method: "card",
  cardNumber: "•••• •••• •••• 4242",
  cardExpiry: "12/28",
  cardCvc: "888",
  cardName: "ALEXANDER WRIGHT",
};

const defaultGstDetails: GstDetails = {
  isGstRequired: false,
  gstin: "27AAAAA0000A1Z5",
  businessName: "Crimson Luxe Enterprises Pvt Ltd",
  businessAddress: "742 Fifth Avenue, Suite 1800, New York, NY 10019",
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(defaultShipping);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>(defaultPayment);
  const [gstDetails, setGstDetails] = useState<GstDetails>(defaultGstDetails);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("shop_oholics_cart");
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch {
      // ignore SSR
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem("shop_oholics_cart", JSON.stringify(items));
      } catch {
        // ignore storage errors
      }
    }
  }, [items, isHydrated]);

  const addToCart = useCallback((product: Product, variant: ProductVariant, quantity = 1) => {
    setItems((prev) => {
      const mainItemId = `${product.id}-${variant.id}`;
      const bundle = getFreeGiftBundle(product);
      let nextItems = [...prev];

      const existingMain = nextItems.find((item) => item.id === mainItemId);

      if (existingMain) {
        nextItems = nextItems.map((item) =>
          item.id === mainItemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        nextItems.push({
          id: mainItemId,
          product,
          selectedVariant: variant,
          quantity,
          hasProtectionPlan: true,
          protectionPlanCost: 99,
        });
      }

      // Automatically include Free Gift Bundle Line Item if eligible
      if (bundle) {
        const giftItem = createFreeGiftCartItem(product, variant, bundle, quantity);
        const existingGift = nextItems.find((item) => item.id === giftItem.id);

        if (!existingGift) {
          nextItems.push(giftItem);
        }
      }

      return nextItems;
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setItems((prev) => {
      const targetItem = prev.find((item) => item.id === itemId);
      if (!targetItem) return prev;

      const targetProductId = targetItem.product.id;
      // Filter out target item AND any attached free gift items if removing a parent product
      return prev.filter(
        (item) => item.id !== itemId && item.parentProductId !== targetProductId
      );
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  }, [removeFromCart]);

  const toggleProtectionPlan = useCallback((itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, hasProtectionPlan: !item.hasProtectionPlan }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Subtotal calculation ignores free gift line items
  const subtotal = items.reduce(
    (acc, item) => (item.isFreeGift ? acc : acc + item.selectedVariant.price * item.quantity),
    0
  );

  const protectionSubtotal = items.reduce(
    (acc, item) =>
      acc + (item.hasProtectionPlan && !item.isFreeGift ? item.protectionPlanCost * item.quantity : 0),
    0
  );

  const tax = Math.round((subtotal + protectionSubtotal) * 0.08);
  const shippingCost = subtotal > 1000 ? 0 : 49;
  const total = subtotal + protectionSubtotal + tax + shippingCost;
  const itemCount = items.reduce((acc, item) => (item.isFreeGift ? acc : acc + item.quantity), 0);

  const freeGiftCount = items.filter((item) => item.isFreeGift).length;
  const hasFreeGiftBundle = freeGiftCount > 0;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleProtectionPlan,
        clearCart,
        subtotal,
        protectionSubtotal,
        tax,
        shippingCost,
        total,
        itemCount,
        hasFreeGiftBundle,
        freeGiftCount,
        shippingAddress,
        setShippingAddress,
        paymentDetails,
        setPaymentDetails,
        gstDetails,
        setGstDetails,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
