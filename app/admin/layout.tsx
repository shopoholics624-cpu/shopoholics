import React from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedCustomerSession, verifyIsAdministrator } from "@/lib/auth";
import { DemoLink as Link } from "@/components/demo/demo-link";
import {
  Sliders,
  ExternalLink,
} from "lucide-react";

export const metadata = {
  title: "Admin Panel | Shop-O-Holics",
  description: "Shop-O-Holics Storefront & Homepage Management Admin Panel",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // 1. Server-side session verification
  const session = await getAuthenticatedCustomerSession();

  // Unauthenticated users must be redirected to the existing login page
  if (!session || !session.customerId) {
    redirect("/login?redirect=/admin/homepage");
  }

  // 2. Server-side role check: Allow ONLY administrator role
  const isAdmin = await verifyIsAdministrator(session.customerId);

  // Unauthorized authenticated users (customers, subscribers, shop managers, etc.) redirected to storefront
  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1c1a]">
      {/* Admin Top Navigation Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#e5e4de] shadow-xs">
        <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin/homepage" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#8b0000] text-white flex items-center justify-center font-black shadow-md group-hover:scale-105 transition-transform">
                SH
              </div>
              <div>
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#1c1c1a] flex items-center gap-1.5">
                  Shop-O-Holics <span className="text-[10px] uppercase font-bold bg-[#ffe9e6] text-[#8b0000] px-2 py-0.5 rounded-md">Admin</span>
                </span>
                <span className="text-[10px] text-[#71706b] font-medium block">
                  Storefront & Content Engine
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 ml-4 border-l border-[#e5e4de] pl-5">
              <Link
                href="/admin/homepage"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold text-[#8b0000] bg-[#ffe9e6] hover:bg-[#ffd9d4] transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Homepage Management</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#d8d7d0] bg-white hover:bg-[#f1f0eb] text-xs font-bold text-[#1c1c1a] shadow-xs transition-all hover:scale-[1.02] active:scale-95"
            >
              <span>View Live Store</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#71706b]" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Admin Page Content */}
      <main className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
