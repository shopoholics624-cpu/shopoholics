"use client";

import { SlidersHorizontal, RotateCcw, X } from "lucide-react";

interface FilterSidebarProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  selectedLifestyle: string;
  setSelectedLifestyle: (life: string) => void;
  priceRange: number;
  setPriceRange: (val: number) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  resetFilters: () => void;
  onClose?: () => void;
}

export function FilterSidebar({
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  selectedLifestyle,
  setSelectedLifestyle,
  priceRange,
  setPriceRange,
  inStockOnly,
  setInStockOnly,
  resetFilters,
  onClose,
}: FilterSidebarProps) {
  const categories = [
    { id: "all", label: "All Hardware" },
    { id: "smartphones", label: "Smartphones" },
    { id: "laptops", label: "Laptops & Compute" },
    { id: "audio", label: "Studio Audio" },
    { id: "wearables", label: "Wearables & GPS" },
    { id: "gaming", label: "Gaming Consoles & PCs" },
    { id: "cameras", label: "Cameras & Drones" },
    { id: "smarthome", label: "Smart Home Automation" },
    { id: "monitors", label: "Monitors & Displays" },
  ];

  const brands = [
    "All Brands",
    "Apple",
    "Samsung",
    "Sony",
    "ASUS",
    "Canon",
    "Dell",
    "Logitech",
    "Razer",
  ];

  const lifestyles = [
    { id: "all", label: "All Lifestyles" },
    { id: "gaming", label: "🎮 Gaming Setup" },
    { id: "creator", label: "🎥 Creator Studio" },
    { id: "photography", label: "📸 Photography" },
    { id: "music", label: "🎧 Music Lovers" },
    { id: "work", label: "💼 Work From Home" },
    { id: "student", label: "🎓 Student Essentials" },
    { id: "smarthome", label: "🏠 Smart Home" },
    { id: "travel", label: "✈️ Travel Tech" },
  ];

  return (
    <aside className="w-full bg-white rounded-3xl p-5 sm:p-6 border border-[#e3beb8]/60 shadow-lux space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#ffe9e6]">
        <div className="flex items-center gap-2 font-bold text-base text-[#261816]">
          <SlidersHorizontal className="w-5 h-5 text-[#8b0000]" />
          <span>Filter Hardware</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-[#8b0000] hover:underline flex items-center gap-1 min-h-[36px] px-2"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-[#5a403c] hover:text-[#8b0000] rounded-full hover:bg-[#ffe9e6] transition-colors lg:hidden"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Accordion */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#8e706b]">
          Categories
        </h4>
        <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1 scroll-smooth no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                if (onClose) onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? "bg-[#8b0000] text-white shadow-sm"
                  : "text-[#5a403c] hover:bg-[#fff0ee] hover:text-[#8b0000]"
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brand Select */}
      <div className="space-y-2 pt-4 border-t border-[#ffe9e6]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#8e706b]">
          Brand
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBrand(b === "All Brands" ? "all" : b)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                (selectedBrand === "all" && b === "All Brands") || selectedBrand === b
                  ? "bg-[#8b0000] text-white border-[#8b0000]"
                  : "bg-white text-[#5a403c] border-[#e3beb8]/60 hover:bg-[#ffe9e6]"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Lifestyle Select */}
      <div className="space-y-2 pt-4 border-t border-[#ffe9e6]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#8e706b]">
          Shop By Category
        </h4>
        <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1 scroll-smooth no-scrollbar">
          {lifestyles.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelectedLifestyle(l.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedLifestyle === l.id
                  ? "bg-[#8b0000] text-white shadow-sm"
                  : "text-[#5a403c] hover:bg-[#fff0ee] hover:text-[#8b0000]"
              }`}
            >
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Max Price Slider */}
      <div className="space-y-3 pt-4 border-t border-[#ffe9e6]">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="uppercase tracking-wider text-[#8e706b]">Max Price</span>
          <span className="text-[#8b0000] text-sm font-extrabold">${priceRange}</span>
        </div>
        <input
          type="range"
          min={200}
          max={4000}
          step={100}
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full h-2 accent-[#8b0000] bg-[#ffe9e6] rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-[#5a403c] font-medium">
          <span>$200</span>
          <span>$4,000</span>
        </div>
      </div>

      {/* Stock Availability Toggle */}
      <div className="pt-4 border-t border-[#ffe9e6]">
        <label className="flex items-center gap-3 cursor-pointer min-h-[40px]">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 rounded text-[#8b0000] focus:ring-[#8b0000] accent-[#8b0000]"
          />
          <span className="text-xs font-semibold text-[#261816]">In Stock Only</span>
        </label>
      </div>
    </aside>
  );
}
