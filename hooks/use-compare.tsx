"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { Product } from "@/types/product";
import { useAuth } from "@/hooks/use-auth";
import { AlertCircle, X } from "lucide-react";

interface CompareContextType {
  compareIds: string[];
  compareList: { id: string }[];
  compareProducts: Product[];
  addToCompare: (productOrId: Product | string | number) => void;
  removeFromCompare: (productId: string | number) => void;
  clearCompare: () => void;
  isInCompare: (productId: string | number) => boolean;
  toastMessage: string | null;
  isLoading: boolean;
  refreshCompare: () => Promise<void>;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, customer } = useAuth();
  const [compareKey, setCompareKey] = useState<string>("guest");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Fetch current compare list from /api/compare (Firebase Firestore)
  const fetchCompare = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/compare");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCompareKey(data.compareKey || "guest");
          setCompareIds(Array.isArray(data.compareIds) ? data.compareIds : []);
          setCompareProducts(Array.isArray(data.items) ? data.items : []);
        }
      }
    } catch (err) {
      console.warn("[useCompare] Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync on mount and when customer login/logout state changes
  useEffect(() => {
    let isMounted = true;

    async function syncOnAuthChange() {
      // If customer just logged in, merge any previous guest compare IDs into customer compare list in Firestore
      if (isAuthenticated && customer?.id) {
        try {
          const guestIds = compareIds;
          const res = await fetch("/api/compare", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "merge", guestIds }),
          });
          if (res.ok) {
            const data = await res.json();
            if (isMounted && data.success) {
              setCompareKey(data.compareKey || `cust_${customer.id}`);
              setCompareIds(Array.isArray(data.compareIds) ? data.compareIds : []);
              setCompareProducts(Array.isArray(data.items) ? data.items : []);
              return;
            }
          }
        } catch {
          // Fallback to fetchCompare
        }
      }

      if (isMounted) {
        await fetchCompare();
      }
    }

    syncOnAuthChange();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, customer?.id]);

  const addToCompare = useCallback(
    async (productOrId: Product | string | number) => {
      const pId = typeof productOrId === "object" && productOrId !== null ? String(productOrId.id) : String(productOrId);
      const cleanId = pId.trim();
      if (!cleanId) return;

      if (compareIds.includes(cleanId)) return;

      if (compareIds.length >= 4) {
        showToast("You can compare up to 4 products at a time.");
        return;
      }

      // Optimistic UI Update
      setCompareIds((prev) => Array.from(new Set([...prev, cleanId])).slice(0, 4));

      try {
        const res = await fetch("/api/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "add", productId: cleanId }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setCompareKey(data.compareKey || compareKey);
            setCompareIds(Array.isArray(data.compareIds) ? data.compareIds : []);
            setCompareProducts(Array.isArray(data.items) ? data.items : []);

            if (data.limitReached) {
              showToast("You can compare up to 4 products at a time.");
            }
          }
        }
      } catch (err) {
        console.warn("[useCompare] Add error:", err);
      }
    },
    [compareIds, compareKey, showToast]
  );

  const removeFromCompare = useCallback(
    async (productId: string | number) => {
      const cleanId = String(productId).trim();
      if (!cleanId) return;

      // Optimistic UI Update
      setCompareIds((prev) => prev.filter((id) => id !== cleanId));
      setCompareProducts((prev) => prev.filter((p) => String(p.id) !== cleanId));

      try {
        const res = await fetch("/api/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "remove", productId: cleanId }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setCompareKey(data.compareKey || compareKey);
            setCompareIds(Array.isArray(data.compareIds) ? data.compareIds : []);
            setCompareProducts(Array.isArray(data.items) ? data.items : []);
          }
        }
      } catch (err) {
        console.warn("[useCompare] Remove error:", err);
      }
    },
    [compareKey]
  );

  const clearCompare = useCallback(async () => {
    setCompareIds([]);
    setCompareProducts([]);

    try {
      const res = await fetch("/api/compare", {
        method: "DELETE",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCompareIds([]);
          setCompareProducts([]);
        }
      }
    } catch (err) {
      console.warn("[useCompare] Clear error:", err);
    }
  }, []);

  const isInCompare = useCallback(
    (productId: string | number) => {
      const cleanId = String(productId).trim();
      return compareIds.includes(cleanId);
    },
    [compareIds]
  );

  const compareList = compareIds.map((id) => ({ id }));

  return (
    <CompareContext.Provider
      value={{
        compareIds,
        compareList,
        compareProducts,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        toastMessage,
        isLoading,
        refreshCompare: fetchCompare,
      }}
    >
      {children}

      {/* Floating Toast Alert when Max 4 limit is reached */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="bg-[#261816] text-white px-4 py-3 rounded-2xl shadow-2xl border border-[#e3beb8]/30 flex items-center gap-3 text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-[#ff907f] shrink-0" />
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
