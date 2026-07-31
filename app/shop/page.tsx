"use client";

import { useState } from "react";
import { PRODUCTS } from "@/constants/products";
import { FilterSidebar } from "@/components/shop/filter-sidebar";
import { ProductCard } from "@/components/common/product-card";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState(3000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const filteredProducts = PRODUCTS.filter((product) => {
    if (selectedCategory !== "all" && product.category !== selectedCategory) {
      return false;
    }
    if (product.price > priceRange) {
      return false;
    }
    if (searchQuery.trim() !== "") {
      const match =
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tagline.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0; // featured
  });

  const resetFilters = () => {
    setSelectedCategory("all");
    setPriceRange(3000);
    setInStockOnly(false);
    setSearchQuery("");
    setSortBy("featured");
  };

  return (
    <div className="py-8 sm:py-12 bg-[#fff8f6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-[#3d2c2a] via-[#610000] to-[#3d2c2a] text-white p-6 sm:p-12 rounded-3xl shadow-xl border border-[#8e706b]/40 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#ff907f]">
              Crimson Luxe Catalog
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Premium Hardware Collection
            </h1>
            <p className="text-xs sm:text-base text-[#e3beb8] leading-relaxed">
              Explore titanium-crafted smartphones, laptops, audio systems, and smart wearables. All devices include complimentary 2-year elite coverage.
            </p>
          </div>
        </div>

        {/* Toolbar & Grid layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Filter Sidebar (Sticky) */}
          <div className="hidden lg:block lg:w-64 shrink-0 lg:sticky lg:top-28">
            <FilterSidebar
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              resetFilters={resetFilters}
            />
          </div>

          {/* Catalog Content Area */}
          <div className="flex-1 w-full space-y-6">
            {/* Top Controls Bar */}
            <div className="bg-white rounded-2xl p-4 border border-[#e3beb8]/60 shadow-lux flex flex-wrap items-center justify-between gap-3 sm:gap-4">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-[#8b0000] text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all min-h-[44px]"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </button>

              {/* Search input in catalog */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-[#8e706b] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Filter hardware..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#fff8f6] rounded-xl text-xs font-medium text-[#261816] placeholder:text-[#8e706b] border border-[#e3beb8]/40 focus:outline-none focus:border-[#8b0000] min-h-[44px]"
                />
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#5a403c] hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2.5 bg-[#fff8f6] text-xs font-semibold text-[#261816] rounded-xl border border-[#e3beb8]/60 outline-none cursor-pointer min-h-[44px]"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Results Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#e3beb8] shadow-lux space-y-4">
                <SlidersHorizontal className="w-12 h-12 text-[#8b0000] mx-auto opacity-40" />
                <h3 className="text-xl font-bold text-[#261816]">No Hardware Found</h3>
                <p className="text-sm text-[#5a403c] max-w-md mx-auto">
                  No products matched your specified category or price criteria. Try resetting your filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-3 bg-[#8b0000] text-white rounded-xl font-semibold text-xs hover:bg-[#bc0000] transition-colors min-h-[44px]"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Slide-Up Filter Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex items-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-h-[85vh] overflow-y-auto bg-white rounded-t-[32px] p-4 shadow-2xl z-10"
            >
              <FilterSidebar
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                inStockOnly={inStockOnly}
                setInStockOnly={setInStockOnly}
                resetFilters={resetFilters}
                onClose={() => setIsMobileFilterOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
