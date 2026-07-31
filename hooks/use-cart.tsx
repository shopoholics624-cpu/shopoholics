"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { CartItem, ShippingAddress, PaymentDetails } from "@/types/cart";
import { Product, ProductVariant } from "@/types/product";

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
  shippingAddress: ShippingAddress;
  setShippingAddress: (addr: ShippingAddress) => void;
  paymentDetails: PaymentDetails;
  setPaymentDetails: (payment: PaymentDetails) => void;
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

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(defaultShipping);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>(defaultPayment);
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
      const existingId = `${product.id}-${variant.id}`;
      const existing = prev.find((item) => item.id === existingId);
      if (existing) {
        return prev.map((item) =>
          item.id === existingId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: existingId,
          product,
          selectedVariant: variant,
          quantity,
          hasProtectionPlan: true,
          protectionPlanCost: 99,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  }, []);

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

  const subtotal = items.reduce(
    (acc, item) => acc + item.selectedVariant.price * item.quantity,
    0
  );

  const protectionSubtotal = items.reduce(
    (acc, item) =>
      acc + (item.hasProtectionPlan ? item.protectionPlanCost * item.quantity : 0),
    0
  );

  const tax = Math.round((subtotal + protectionSubtotal) * 0.08);
  const shippingCost = subtotal > 1000 ? 0 : 49;
  const total = subtotal + protectionSubtotal + tax + shippingCost;
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

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
        shippingAddress,
        setShippingAddress,
        paymentDetails,
        setPaymentDetails,
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
