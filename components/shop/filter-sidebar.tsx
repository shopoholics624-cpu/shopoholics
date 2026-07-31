"use client";

import { SlidersHorizontal, RotateCcw } from "lucide-react";

interface FilterSidebarProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  priceRange: number;
  setPriceRange: (val: number) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  resetFilters: () => void;
}

export function FilterSidebar({
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  inStockOnly,
  setInStockOnly,
  resetFilters,
}: FilterSidebarProps) {
  const categories = [
    { id: "all", label: "All Hardware" },
    { id: "smartphones", label: "Smartphones" },
    { id: "laptops", label: "Laptops & Compute" },
    { id: "audio", label: "Studio Audio" },
    { id: "wearables", label: "Wearables & GPS" },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white rounded-3xl p-6 border border-[#e3beb8]/60 shadow-lux space-y-6 shrink-0 h-fit sticky top-28">
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#ffe9e6]">
        <div className="flex items-center gap-2 font-bold text-base text-[#261816]">
          <SlidersHorizontal className="w-5 h-5 text-[#8b0000]" />
          <span>Filter Hardware</span>
        </div>
        <button
          onClick={resetFilters}
          className="text-xs font-semibold text-[#8b0000] hover:underline flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Category Accordion */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#8e706b]">
          Categories
        </h4>
        <div className="space-y-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                selectedCategory === cat.id
                  ? "bg-[#8b0000] text-white shadow-md"
                  : "text-[#5a403c] hover:bg-[#fff0ee] hover:text-[#8b0000]"
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Max Price Slider */}
      <div className="space-y-3 pt-4 border-t border-[#ffe9e6]">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="uppercase tracking-wider text-[#8e706b]">Max Price</span>
          <span className="text-[#8b0000] text-sm">${priceRange}</span>
        </div>
        <input
          type="range"
          min={300}
          max={3000}
          step={100}
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full accent-[#8b0000] cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-[#5a403c] font-medium">
          <span>$300</span>
          <span>$3,000</span>
        </div>
      </div>

      {/* Stock Availability Toggle */}
      <div className="pt-4 border-t border-[#ffe9e6]">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 rounded text-[#8b0000] focus:ring-[#8b0000] accent-[#8b0000]"
          />
          <span className="text-sm font-semibold text-[#261816]">In Stock Only</span>
        </label>
      </div>
    </aside>
  );
}
