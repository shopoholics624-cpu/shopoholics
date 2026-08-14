"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, RotateCcw, X } from "lucide-react";
import { WooCategory, WooBrand } from "@/types/woocommerce";

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
  const [categories, setCategories] = useState<{ id: string; label: string; count?: number }[]>([
    { id: "all", label: "All Hardware" },
  ]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([
    { id: "all", name: "All Brands" },
  ]);

  useEffect(() => {
    let isMounted = true;

    async function fetchFilterData() {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/brands"),
        ]);

        if (catRes.ok) {
          const catData = await catRes.json();
          if (isMounted && catData.success && Array.isArray(catData.categories) && catData.categories.length > 0) {
            const list = [
              { id: "all", label: "All Hardware" },
              ...catData.categories
                .filter((c: WooCategory) => typeof c.count !== "number" || c.count > 0)
                .map((c: WooCategory) => ({
                  id: c.slug,
                  label: (c.name || "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
                  count: c.count,
                })),
            ];
            setCategories(list);
          }
        }

        if (brandRes.ok) {
          const brandData = await brandRes.json();
          if (isMounted && brandData.success && Array.isArray(brandData.brands) && brandData.brands.length > 0) {
            const list = [
              { id: "all", name: "All Brands" },
              ...brandData.brands.map((b: WooBrand) => ({
                id: b.slug,
                name: (b.name || "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
              })),
            ];
            setBrands(list);
          }
        }
      } catch (err) {
        console.warn("[FilterSidebar] Category/Brand fetch fallback:", err);
      }
    }

    fetchFilterData();
    return () => {
      isMounted = false;
    };
  }, []);



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
              key={b.id}
              onClick={() => setSelectedBrand(b.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                (selectedBrand === "all" && b.id === "all") || selectedBrand.toLowerCase() === b.id.toLowerCase() || selectedBrand.toLowerCase() === b.name.toLowerCase()
                  ? "bg-[#8b0000] text-white border-[#8b0000]"
                  : "bg-white text-[#5a403c] border-[#e3beb8]/60 hover:bg-[#ffe9e6]"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>



      {/* Max Price Slider */}
      <div className="space-y-3 pt-4 border-t border-[#ffe9e6]">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="uppercase tracking-wider text-[#8e706b]">Max Price</span>
          <span className="text-[#8b0000] text-sm font-extrabold">₹{priceRange.toLocaleString("en-IN")}</span>
        </div>
        <input
          type="range"
          min={1000}
          max={500000}
          step={5000}
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full h-2 accent-[#8b0000] bg-[#ffe9e6] rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-[#5a403c] font-medium">
          <span>₹1,000</span>
          <span>₹5,00,000</span>
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
