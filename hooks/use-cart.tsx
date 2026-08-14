"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { CartItem, ShippingAddress, PaymentDetails, GstDetails, WooCommerceCartTotals } from "@/types/cart";
import { Product, ProductVariant } from "@/types/product";
import { useAuth } from "@/hooks/use-auth";

interface CartContextType {
  items: CartItem[];
  addToCart: (
    product: Product,
    variant: ProductVariant,
    quantity?: number,
    selectedAttributes?: Record<string, string>
  ) => void;
  addToCartAsync: (
    product: Product,
    variant?: ProductVariant,
    quantity?: number,
    selectedAttributes?: Record<string, string>,
    isCardAdd?: boolean
  ) => Promise<{ success: boolean; message?: string }>;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  toggleProtectionPlan: (itemId: string) => void;
  clearCart: () => void;
  subtotal: number;
  protectionSubtotal: number;
  tax: number;
  shippingCost: number;
  discountTotal: number;
  total: number;
  itemCount: number;
  hasFreeGiftBundle: boolean;
  freeGiftCount: number;
  shippingAddress: ShippingAddress;
  setShippingAddress: React.Dispatch<React.SetStateAction<ShippingAddress>>;
  paymentDetails: PaymentDetails;
  setPaymentDetails: React.Dispatch<React.SetStateAction<PaymentDetails>>;
  gstDetails: GstDetails;
  setGstDetails: React.Dispatch<React.SetStateAction<GstDetails>>;
  isSyncing: boolean;
  updatingItemIds: Record<string, boolean>;
}

const defaultShipping: ShippingAddress = {
  firstName: "Alexander",
  lastName: "Wright",
  company: "Crimson Luxe Enterprises",
  email: "alexander@crimsonluxe.com",
  phone: "9876543210",
  address1: "742 Fifth Avenue",
  address2: "Suite 1800",
  city: "Mumbai",
  state: "Maharashtra",
  postcode: "400001",
  country: "India",
  fullName: "Alexander Wright",
  addressLine1: "742 Fifth Avenue",
  addressLine2: "Suite 1800",
  postalCode: "400001",
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
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [wooTotals, setWooTotals] = useState<WooCommerceCartTotals>({
    subtotal: 0,
    discountTotal: 0,
    taxTotal: 0,
    shippingTotal: 0,
    total: 0,
    totalQuantity: 0,
  });
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(defaultShipping);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>(defaultPayment);
  const [gstDetails, setGstDetails] = useState<GstDetails>(defaultGstDetails);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [updatingItemIds, setUpdatingItemIds] = useState<Record<string, boolean>>({});

  // Sync cart from WooCommerce server API on mount or when authentication state changes
  useEffect(() => {
    let isMounted = true;
    async function syncInitialCart() {
      try {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success) {
            if (Array.isArray(data.items)) {
              setItems(data.items);
            }
            if (data.totals) {
              setWooTotals(data.totals);
            }
          }
        } else {
          const savedCart = localStorage.getItem("shop_oholics_cart");
          if (savedCart) {
            const parsed = JSON.parse(savedCart);
            if (Array.isArray(parsed) && parsed.length > 0 && isMounted) {
              setItems(parsed);
            }
          }
        }
      } catch (err) {
        console.warn("[useCart] Initial cart sync active:", err);
        const savedCart = localStorage.getItem("shop_oholics_cart");
        if (savedCart) {
          try {
            const parsed = JSON.parse(savedCart);
            if (Array.isArray(parsed) && parsed.length > 0 && isMounted) {
              setItems(parsed);
            }
          } catch {}
        }
      } finally {
        if (isMounted) setIsHydrated(true);
      }
    }

    syncInitialCart();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Save to local storage for transient offline UI state
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem("shop_oholics_cart", JSON.stringify(items));
      } catch {
        // ignore storage errors
      }
    }
  }, [items, isHydrated]);

  const addToCartAsync = useCallback(
    async (
      product: Product,
      variant?: ProductVariant,
      quantity = 1,
      customSelectedAttributes?: Record<string, string>,
      isCardAdd = false
    ): Promise<{ success: boolean; message?: string }> => {
      // AUTOMATIC LOGIN REDIRECT IF NOT LOGGED IN
      if (!isAuthenticated) {
        const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        return { success: false, message: "Please log in to add items to your bag." };
      }

      setIsSyncing(true);

      const targetVariant = variant || (product.variants && product.variants.length > 0 ? product.variants[0] : undefined);
      const selectedAttrs = {
        ...(targetVariant?.attributes || {}),
        ...(targetVariant?.storage ? { Storage: targetVariant.storage } : {}),
        ...(targetVariant?.colorName && targetVariant.colorName !== "Standard" && targetVariant.colorName !== targetVariant.storage
          ? { Colour: targetVariant.colorName }
          : {}),
        ...(customSelectedAttributes || {}),
      };

      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product,
            selectedVariant: targetVariant,
            quantity,
            productId: product.id,
            variationId: targetVariant?.wooVariationId || null,
            selectedAttributes: selectedAttrs,
            isCardAdd,
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          if (Array.isArray(data.items)) setItems(data.items);
          if (data.totals) setWooTotals(data.totals);
          return { success: true };
        } else if (data.requireAuth || res.status === 401) {
          const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          return { success: false, message: "Please log in to add items to your bag." };
        } else {
          return { success: false, message: data.message || "This product is currently unavailable." };
        }
      } catch (err) {
        console.warn("[useCart] Server cart POST sync exception:", err);
        return { success: false, message: "This product is currently unavailable." };
      } finally {
        setIsSyncing(false);
      }
    },
    [isAuthenticated]
  );

  const addToCart = useCallback(
    (
      product: Product,
      variant: ProductVariant,
      quantity = 1,
      customSelectedAttributes?: Record<string, string>
    ) => {
      addToCartAsync(product, variant, quantity, customSelectedAttributes, false);
    },
    [addToCartAsync]
  );

  const removeFromCart = useCallback((itemId: string) => {
    setIsSyncing(true);
    setItems((prev) => {
      const targetItem = prev.find((item) => item.id === itemId);
      if (!targetItem) return prev;
      const targetProductId = targetItem.product.id;
      return prev.filter((item) => item.id !== itemId && item.parentProductId !== targetProductId);
    });

    fetch(`/api/cart?itemId=${encodeURIComponent(itemId)}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (Array.isArray(data.items)) setItems(data.items);
          if (data.totals) setWooTotals(data.totals);
        }
      })
      .catch((err) => console.warn("[useCart] Server cart DELETE sync fallback:", err))
      .finally(() => setIsSyncing(false));
  }, []);

  const updateQuantity = useCallback(
    async (itemId: string, targetQuantity: number) => {
      if (targetQuantity <= 0) {
        removeFromCart(itemId);
        return;
      }

      // Per-Item Lock to prevent rapid double click race conditions
      setUpdatingItemIds((prev) => {
        if (prev[itemId]) return prev;
        return { ...prev, [itemId]: true };
      });

      setIsSyncing(true);

      // Optimistic update
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, quantity: targetQuantity } : item))
      );

      try {
        const res = await fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId, quantity: targetQuantity }),
        });

        const data = await res.json();

        if (res.ok && data.success && Array.isArray(data.items)) {
          setItems(data.items);
          if (data.totals) setWooTotals(data.totals);
        } else {
          // Re-fetch authoritative cart on server rejection/error without setting items to []
          const syncRes = await fetch("/api/cart");
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            if (syncData.success && Array.isArray(syncData.items)) {
              setItems(syncData.items);
              if (syncData.totals) setWooTotals(syncData.totals);
            }
          }
        }
      } catch (err) {
        console.warn("[useCart] Server cart PUT sync exception:", err);
      } finally {
        setIsSyncing(false);
        setUpdatingItemIds((prev) => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
      }
    },
    [removeFromCart]
  );

  const toggleProtectionPlan = useCallback((itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, hasProtectionPlan: !item.hasProtectionPlan } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setIsSyncing(true);
    setItems([]);
    setWooTotals({
      subtotal: 0,
      discountTotal: 0,
      taxTotal: 0,
      shippingTotal: 0,
      total: 0,
      totalQuantity: 0,
    });

    fetch("/api/cart?clear=true", {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setItems([]);
          if (data.totals) setWooTotals(data.totals);
        }
      })
      .catch((err) => console.warn("[useCart] Server cart CLEAR sync fallback:", err))
      .finally(() => setIsSyncing(false));
  }, []);

  // Pure WooCommerce cart totals (no mock additions or hardcoded tax/shipping)
  const subtotal =
    wooTotals.subtotal > 0
      ? wooTotals.subtotal
      : (items || []).reduce((acc, item) => {
          if (!item || item.isFreeGift) return acc;
          const price = item.selectedVariant?.price ?? item.product?.price ?? 0;
          const qty = item.quantity || 1;
          return acc + price * qty;
        }, 0);

  const protectionSubtotal = (items || []).reduce(
    (acc, item) =>
      acc + (item && item.hasProtectionPlan && !item.isFreeGift ? (item.protectionPlanCost || 0) * (item.quantity || 1) : 0),
    0
  );

  const tax = wooTotals.taxTotal || 0;
  const shippingCost = wooTotals.shippingTotal || 0;
  const discountTotal = wooTotals.discountTotal || 0;
  const total = wooTotals.total > 0 ? wooTotals.total : subtotal;

  const itemCount = (items || []).reduce((acc, item) => (item && !item.isFreeGift ? acc + (item.quantity || 1) : acc), 0);
  const freeGiftCount = (items || []).filter((item) => item && item.isFreeGift).length;
  const hasFreeGiftBundle = freeGiftCount > 0;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        addToCartAsync,
        removeFromCart,
        updateQuantity,
        toggleProtectionPlan,
        clearCart,
        subtotal,
        protectionSubtotal,
        tax,
        shippingCost,
        discountTotal,
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
        isSyncing,
        updatingItemIds,
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
