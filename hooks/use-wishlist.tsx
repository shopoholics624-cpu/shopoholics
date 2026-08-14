"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { Product } from "@/types/product";
import { WishlistContextType } from "@/types/wishlist";
import { useAuth } from "@/hooks/use-auth";

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [wishlistKey, setWishlistKey] = useState<string>("guest");
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState<boolean>(true);
  const [wishlistHydrated, setWishlistHydrated] = useState<boolean>(false);
  const [wishlistError, setWishlistError] = useState<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    try {
      setWishlistLoading(true);
      setWishlistError(null);
      const res = await fetch("/api/wishlist");

      if (!res.ok) {
        setWishlistError("Unable to load wishlist from server.");
        setWishlistLoading(false);
        setWishlistHydrated(true);
        return;
      }

      const data = await res.json();
      if (data.success) {
        const serverKey = data.wishlistKey || "guest";
        const serverIds = Array.isArray(data.wishlistIds) ? data.wishlistIds : [];
        const serverItems = Array.isArray(data.items) ? data.items : [];

        setWishlistKey(serverKey);
        setWishlistIds(serverIds);
        setWishlistProducts(serverItems);
        setWishlistError(null);
      } else {
        setWishlistError(data.message || "Failed to load wishlist.");
      }
    } catch (err: any) {
      console.warn("[useWishlist] Fetch error:", err);
      setWishlistError("Network error while fetching wishlist.");
    } finally {
      setWishlistLoading(false);
      setWishlistHydrated(true);
    }
  }, []);

  // Initial sync on mount and when authentication state changes
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist, isAuthenticated]);

  const isInWishlist = useCallback(
    (productId: string) => {
      const pId = String(productId);
      return wishlistIds.includes(pId);
    },
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    async (product: Product) => {
      // AUTOMATIC LOGIN REDIRECT IF NOT LOGGED IN
      if (!isAuthenticated) {
        const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        return;
      }

      const pId = String(product.id);
      const isAlreadyIn = wishlistIds.includes(pId);

      // Optimistic UI Update
      setWishlistIds((prev) => {
        const next = isAlreadyIn ? prev.filter((id) => id !== pId) : [...prev, pId];
        return Array.from(new Set(next));
      });

      setWishlistProducts((prev) => {
        if (isAlreadyIn) {
          return prev.filter((p) => String(p.id) !== pId);
        } else {
          return [...prev.filter((p) => String(p.id) !== pId), product];
        }
      });

      try {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "toggle", productId: pId }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (data.wishlistKey) setWishlistKey(data.wishlistKey);
            if (Array.isArray(data.wishlistIds)) setWishlistIds(data.wishlistIds);
            if (Array.isArray(data.items)) setWishlistProducts(data.items);
          } else if (data.requireAuth || res.status === 401) {
            const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          }
        }
      } catch (err) {
        console.warn("[useWishlist] Toggle API sync exception:", err);
      }
    },
    [wishlistIds, isAuthenticated]
  );

  const addToWishlist = useCallback(
    async (productId: string) => {
      // AUTOMATIC LOGIN REDIRECT IF NOT LOGGED IN
      if (!isAuthenticated) {
        const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        return;
      }
      const pId = String(productId);
      if (wishlistIds.includes(pId)) return;

      setWishlistIds((prev) => Array.from(new Set([...prev, pId])));

      try {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "add", productId: pId }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (data.wishlistKey) setWishlistKey(data.wishlistKey);
            if (Array.isArray(data.wishlistIds)) setWishlistIds(data.wishlistIds);
            if (Array.isArray(data.items)) setWishlistProducts(data.items);
          } else if (data.requireAuth || res.status === 401) {
            const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          }
        }
      } catch (err) {
        console.warn("[useWishlist] Add API sync exception:", err);
      }
    },
    [wishlistIds, isAuthenticated]
  );

  const removeFromWishlist = useCallback(async (productId: string) => {
    const pId = String(productId);
    setWishlistIds((prev) => prev.filter((id) => id !== pId));
    setWishlistProducts((prev) => prev.filter((p) => String(p.id) !== pId));

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", productId: pId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.wishlistKey) setWishlistKey(data.wishlistKey);
          if (Array.isArray(data.wishlistIds)) setWishlistIds(data.wishlistIds);
          if (Array.isArray(data.items)) setWishlistProducts(data.items);
        }
      }
    } catch (err) {
      console.warn("[useWishlist] Remove API sync exception:", err);
    }
  }, []);

  const clearWishlist = useCallback(async () => {
    setWishlistIds([]);
    setWishlistProducts([]);

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setWishlistIds([]);
          setWishlistProducts([]);
        }
      }
    } catch (err) {
      console.warn("[useWishlist] Clear API sync exception:", err);
    }
  }, []);

  const wishlistCount = wishlistIds.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistProducts,
        wishlistCount,
        isLoading: wishlistLoading,
        wishlistLoading,
        wishlistHydrated,
        wishlistError,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
