"use client";

import { useState, useEffect, useCallback, useRef, createContext, useContext, ReactNode } from "react";
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
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  toggleProtectionPlan: (itemId: string) => void;
  clearCart: () => Promise<void>;
  subtotal: number;
  protectionSubtotal: number;
  tax: number;
  shippingCost: number;
  discountTotal: number;
  appliedOffer?: import("@/types/cart").AppliedCartOffer | null;
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
  deletingItemIds: Record<string, boolean>;
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
  const [deletingItemIds, setDeletingItemIds] = useState<Record<string, boolean>>({});

  // Sequence counter to prevent race conditions from out-of-order API responses
  const requestSeqRef = useRef<number>(0);

  // Sync cart from authoritative WooCommerce/server endpoint on mount and auth changes
  useEffect(() => {
    let isMounted = true;
    const seq = ++requestSeqRef.current;

    // Purge any legacy localStorage cache to guarantee zero resurrecting of deleted items
    try {
      localStorage.removeItem("shop_oholics_cart");
    } catch {}

    async function syncInitialCart() {
      try {
        const res = await fetch(`/api/cart?_t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted && seq >= requestSeqRef.current && data.success) {
            if (Array.isArray(data.items)) {
              setItems(data.items);
            } else {
              setItems([]);
            }
            if (data.totals) {
              setWooTotals(data.totals);
            }
          }
        }
      } catch (err) {
        console.warn("[useCart] Initial cart sync error:", err);
      } finally {
        if (isMounted) setIsHydrated(true);
      }
    }

    syncInitialCart();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const addToCartAsync = useCallback(
    async (
      product: Product,
      variant?: ProductVariant,
      quantity = 1,
      customSelectedAttributes?: Record<string, string>,
      isCardAdd = false
    ): Promise<{ success: boolean; message?: string }> => {
      if (!isAuthenticated) {
        const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        return { success: false, message: "Please log in to add items to your bag." };
      }

      const seq = ++requestSeqRef.current;
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
          headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
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
          if (seq >= requestSeqRef.current) {
            if (Array.isArray(data.items)) setItems(data.items);
            if (data.totals) setWooTotals(data.totals);
          }
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
        if (seq >= requestSeqRef.current) {
          setIsSyncing(false);
        }
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

  const removeFromCart = useCallback(async (itemId: string) => {
    const seq = ++requestSeqRef.current;
    setDeletingItemIds((prev) => ({ ...prev, [itemId]: true }));
    setIsSyncing(true);

    try {
      const res = await fetch(`/api/cart?itemId=${encodeURIComponent(itemId)}`, {
        method: "DELETE",
        headers: { "Cache-Control": "no-cache" },
      });

      const data = await res.json();
      if (seq >= requestSeqRef.current && res.ok && data.success) {
        if (Array.isArray(data.items)) setItems(data.items);
        if (data.totals) setWooTotals(data.totals);
      }
    } catch (err) {
      console.warn("[useCart] Server cart DELETE sync error:", err);
    } finally {
      setDeletingItemIds((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
      if (seq >= requestSeqRef.current) {
        setIsSyncing(false);
      }
    }
  }, []);

  const updateQuantity = useCallback(
    async (itemId: string, targetQuantity: number) => {
      if (targetQuantity <= 0) {
        await removeFromCart(itemId);
        return;
      }

      const seq = ++requestSeqRef.current;

      setUpdatingItemIds((prev) => ({ ...prev, [itemId]: true }));
      setIsSyncing(true);

      // Optimistic update
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, quantity: targetQuantity } : item))
      );

      try {
        const res = await fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
          body: JSON.stringify({ itemId, quantity: targetQuantity }),
        });

        const data = await res.json();

        if (seq >= requestSeqRef.current && res.ok && data.success && Array.isArray(data.items)) {
          setItems(data.items);
          if (data.totals) setWooTotals(data.totals);
        } else if (seq >= requestSeqRef.current) {
          // Re-fetch authoritative cart on rejection
          const syncRes = await fetch(`/api/cart?_t=${Date.now()}`, { cache: "no-store" });
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            if (seq >= requestSeqRef.current && syncData.success && Array.isArray(syncData.items)) {
              setItems(syncData.items);
              if (syncData.totals) setWooTotals(syncData.totals);
            }
          }
        }
      } catch (err) {
        console.warn("[useCart] Server cart PUT sync exception:", err);
      } finally {
        if (seq >= requestSeqRef.current) {
          setIsSyncing(false);
        }
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

  const clearCart = useCallback(async () => {
    const seq = ++requestSeqRef.current;
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

    try {
      const res = await fetch("/api/cart?clear=true", {
        method: "DELETE",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (seq >= requestSeqRef.current && res.ok && data.success) {
        setItems([]);
        if (data.totals) setWooTotals(data.totals);
      }
    } catch (err) {
      console.warn("[useCart] Server cart CLEAR sync error:", err);
    } finally {
      if (seq >= requestSeqRef.current) {
        setIsSyncing(false);
      }
    }
  }, []);

  // Pure WooCommerce cart totals
  const subtotal =
    wooTotals.subtotal > 0
      ? wooTotals.subtotal
      : items.reduce((sum, item) => {
          if (item.isFreeGift || item.unavailable) return sum;
          const price = item.selectedVariant?.price ?? item.product?.price ?? 0;
          return sum + price * item.quantity;
        }, 0);

  const protectionSubtotal = items.reduce((sum, item) => {
    return sum + (item.hasProtectionPlan ? (item.protectionPlanCost || 990) * item.quantity : 0);
  }, 0);

  const tax = wooTotals.taxTotal;
  const shippingCost = wooTotals.shippingTotal;
  const discountTotal = wooTotals.discountTotal;
  const total =
    wooTotals.total > 0
      ? wooTotals.total + protectionSubtotal
      : subtotal + protectionSubtotal + tax + shippingCost - discountTotal;

  const itemCount =
    wooTotals.totalQuantity > 0
      ? wooTotals.totalQuantity
      : items.reduce((count, item) => (!item.isFreeGift && !item.unavailable ? count + item.quantity : count), 0);

  const hasFreeGiftBundle = items.some((item) => item.isFreeGift);
  const freeGiftCount = items.filter((item) => item.isFreeGift).reduce((sum, item) => sum + item.quantity, 0);

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
        appliedOffer: wooTotals.appliedOffer,
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
        deletingItemIds,
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
