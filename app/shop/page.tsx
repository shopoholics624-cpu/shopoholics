"use client";

import { useState } from "react";
import { PRODUCTS } from "@/constants/products";
import { FilterSidebar } from "@/components/shop/filter-sidebar";
import { ProductCard } from "@/components/common/product-card";
import { SlidersHorizontal, Grid, Search } from "lucide-react";

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState(3000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");

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
    <div className="py-10 bg-[#fff8f6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-[#3d2c2a] via-[#610000] to-[#3d2c2a] text-white p-8 sm:p-12 rounded-3xl shadow-xl border border-[#8e706b]/40 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff907f]">
              Crimson Luxe Catalog
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Premium Hardware Collection
            </h1>
            <p className="text-sm sm:text-base text-[#e3beb8] leading-relaxed">
              Explore titanium-crafted smartphones, laptops, audio systems, and smart wearables. All devices include complimentary 2-year elite coverage.
            </p>
          </div>
        </div>

        {/* Toolbar & Grid layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Filter Sidebar */}
          <FilterSidebar
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
            resetFilters={resetFilters}
          />

          {/* Catalog Content Area */}
          <div className="flex-1 w-full space-y-6">
            {/* Top Controls Bar */}
            <div className="bg-white rounded-2xl p-4 border border-[#e3beb8]/60 shadow-lux flex flex-wrap items-center justify-between gap-4">
              {/* Search input in catalog */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-[#8e706b] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Filter hardware by keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#fff8f6] rounded-xl text-xs font-medium text-[#261816] placeholder:text-[#8e706b] border border-[#e3beb8]/40 focus:outline-none focus:border-[#8b0000]"
                />
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#5a403c] hidden sm:inline">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-[#fff8f6] text-xs font-semibold text-[#261816] rounded-xl border border-[#e3beb8]/60 outline-none cursor-pointer"
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
                  className="px-6 py-2.5 bg-[#8b0000] text-white rounded-xl font-semibold text-xs hover:bg-[#bc0000] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
