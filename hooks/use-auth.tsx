"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";

export interface CustomerUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
}

interface AuthContextType {
  customer: CustomerUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const router = useRouter();

  const fetchAuthMe = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.customer) {
          setCustomer({
            id: data.customer.id,
            email: data.customer.email,
            firstName: data.customer.firstName || "Customer",
            lastName: data.customer.lastName || "",
            displayName: data.customer.displayName || data.customer.firstName || "Customer",
          });
        } else {
          setCustomer(null);
        }
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    } finally {
      setIsLoading(false);
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    fetchAuthMe();
  }, [fetchAuthMe]);

  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean = true) => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, rememberMe }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          return {
            success: false,
            message: data.message || "Invalid email address or password.",
          };
        }

        if (data.customer) {
          const cust: CustomerUser = {
            id: data.customer.id,
            email: data.customer.email,
            firstName: data.customer.firstName || "Customer",
            lastName: data.customer.lastName || "",
            displayName: data.customer.displayName || data.customer.firstName || "Customer",
          };
          setCustomer(cust);
        }

        return { success: true };
      } catch {
        return {
          success: false,
          message: "Unable to connect to the account service. Please check your network connection.",
        };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network error on logout
    } finally {
      setCustomer(null);
      router.replace("/login");
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        customer,
        isAuthenticated: Boolean(customer && customer.id),
        isLoading,
        isHydrated,
        login,
        logout,
        refreshAuth: fetchAuthMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
