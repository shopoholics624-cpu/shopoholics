"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 sm:gap-2 text-xs text-[#5a403c] overflow-x-auto no-scrollbar py-1 ${className}`}
    >
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-[#5a403c] hover:text-[#8b0000] font-medium transition-colors shrink-0"
        title="Home"
      >
        <Home className="w-3.5 h-3.5 text-[#8b0000]" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-1.5 sm:gap-2 shrink-0 max-w-full">
            <ChevronRight className="w-3.5 h-3.5 text-[#8e706b]/60 shrink-0" />
            {isLast || !item.href ? (
              <span
                className={`text-xs font-bold text-[#261816] truncate max-w-[140px] sm:max-w-[280px] lg:max-w-none ${
                  isLast ? "text-[#261816]" : ""
                }`}
                title={item.label}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-xs font-medium text-[#5a403c] hover:text-[#8b0000] transition-colors truncate max-w-[120px] sm:max-w-none"
                title={item.label}
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
