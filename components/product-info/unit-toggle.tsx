"use client";

import { UnitSystem } from "@/lib/unit-converter";
import { SlidersHorizontal } from "lucide-react";

interface UnitToggleProps {
  unitSystem: UnitSystem;
  onToggle: (system: UnitSystem) => void;
}

export function UnitToggle({ unitSystem, onToggle }: UnitToggleProps) {
  return (
    <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-[#fff8f6] border border-[#e3beb8]/50 shadow-xs text-xs font-semibold text-[#5a403c]">
      <span className="pl-2 flex items-center gap-1 text-[10px] uppercase font-bold text-[#8e706b]">
        <SlidersHorizontal className="w-3 h-3 text-[#8b0000]" /> Units:
      </span>
      <button
        type="button"
        onClick={() => onToggle("metric")}
        className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-bold ${
          unitSystem === "metric"
            ? "bg-[#8b0000] text-white shadow-xs"
            : "text-[#5a403c] hover:text-[#8b0000]"
        }`}
      >
        Metric (cm / g)
      </button>
      <button
        type="button"
        onClick={() => onToggle("imperial")}
        className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-bold ${
          unitSystem === "imperial"
            ? "bg-[#8b0000] text-white shadow-xs"
            : "text-[#5a403c] hover:text-[#8b0000]"
        }`}
      >
        Imperial (in / lbs)
      </button>
    </div>
  );
}
