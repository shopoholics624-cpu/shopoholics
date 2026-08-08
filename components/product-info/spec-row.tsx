"use client";

import { isValidValue } from "@/lib/unit-converter";

interface SpecRowProps {
  label: string;
  value?: string | number | null;
  highlight?: boolean;
}

export function SpecRow({ label, value }: SpecRowProps) {
  if (!isValidValue(value)) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 py-2.5 px-3.5 border-b border-[#e3beb8]/30 last:border-b-0 transition-colors bg-white hover:bg-gray-50/70">
      <span className="sm:col-span-4 text-[11px] sm:text-xs font-bold text-[#8e706b] uppercase tracking-wider">
        {label}
      </span>
      <span className="sm:col-span-8 text-xs sm:text-sm font-semibold text-[#261816] leading-relaxed">
        {String(value)}
      </span>
    </div>
  );
}

interface SpecSectionHeaderProps {
  title: string;
}

export function SpecSectionHeader({ title }: SpecSectionHeaderProps) {
  return (
    <h3 className="text-xs font-black text-[#8b0000] uppercase tracking-wider py-2 px-3.5 bg-[#faf8f8] border-y border-[#e3beb8]/40 first:rounded-t-xl">
      {title}
    </h3>
  );
}
