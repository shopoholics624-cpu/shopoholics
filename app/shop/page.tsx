"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PRODUCTS } from "@/constants/products";
import { FilterSidebar } from "@/components/shop/filter-sidebar";
import { ProductCard } from "@/components/common/product-card";
import { SlidersHorizontal, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ShopContent() {
  const searchParams = useSearchParams();

  const categoryParam = searchParams.get("category") || "all";
  const brandParam = searchParams.get("brand") || "all";
  const lifestyleParam = searchParams.get("lifestyle") || "all";
  const minPriceParam = Number(searchParams.get("minPrice")) || 0;
  const maxPriceParam = Number(searchParams.get("maxPrice")) || 4000;
  const dealParam = searchParams.get("isDeal") === "true";

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedBrand, setSelectedBrand] = useState(brandParam);
  const [selectedLifestyle, setSelectedLifestyle] = useState(lifestyleParam);
  const [priceRange, setPriceRange] = useState(maxPriceParam);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
    if (brandParam) setSelectedBrand(brandParam);
    if (lifestyleParam) setSelectedLifestyle(lifestyleParam);
    if (maxPriceParam) setPriceRange(maxPriceParam);
  }, [categoryParam, brandParam, lifestyleParam, maxPriceParam]);

  const filteredProducts = PRODUCTS.filter((product) => {
    if (selectedCategory !== "all" && product.category !== selectedCategory) {
      return false;
    }
    if (selectedBrand !== "all" && product.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
      return false;
    }
    if (
      selectedLifestyle !== "all" &&
      (!product.lifestyle || !product.lifestyle.includes(selectedLifestyle as any))
    ) {
      return false;
    }
    if (product.price > priceRange || product.price < minPriceParam) {
      return false;
    }
    if (dealParam && !product.isDeal && !product.discountPercentage) {
      return false;
    }
    if (searchQuery.trim() !== "") {
      const match =
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tagline.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "discount") return (b.discountPercentage || 0) - (a.discountPercentage || 0);
    if (sortBy === "popular") return b.reviewCount - a.reviewCount;
    return 0; // featured
  });

  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSelectedLifestyle("all");
    setPriceRange(4000);
    setInStockOnly(false);
    setSearchQuery("");
    setSortBy("featured");
  };

  return (
    <div className="py-6 sm:py-10 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Toolbar & Grid layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:w-64 shrink-0 lg:sticky lg:top-24">
            <FilterSidebar
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
              selectedLifestyle={selectedLifestyle}
              setSelectedLifestyle={setSelectedLifestyle}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              resetFilters={resetFilters}
            />
          </div>

          {/* Catalog Content Area */}
          <div className="flex-1 w-full space-y-5">
            {/* Top Controls Bar */}
            <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#e3beb8]/60 shadow-lux flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3.5 py-2 bg-[#8b0000] text-white font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all min-h-[40px]"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </button>

              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 text-[#8e706b] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Filter by name, brand, specs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#fff8f6] rounded-xl text-xs font-medium text-[#261816] placeholder:text-[#8e706b] border border-[#e3beb8]/40 focus:outline-none focus:border-[#8b0000] min-h-[40px]"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#5a403c] hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-[#fff8f6] text-xs font-semibold text-[#261816] rounded-xl border border-[#e3beb8]/60 outline-none cursor-pointer min-h-[40px]"
                >
                  <option value="featured">Featured First</option>
                  <option value="popular">Popularity & Ratings</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="discount">Biggest Discount %</option>
                </select>
              </div>
            </div>

            {/* Results Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 text-center border border-[#e3beb8] shadow-lux space-y-4">
                <SlidersHorizontal className="w-10 h-10 text-[#8b0000] mx-auto opacity-40" />
                <h3 className="text-lg font-bold text-[#261816]">No Devices Found</h3>
                <p className="text-xs text-[#5a403c] max-w-md mx-auto">
                  No products matched your specified brand, category, lifestyle, or price criteria. Try resetting your filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-[#8b0000] text-white rounded-xl font-semibold text-xs hover:bg-[#bc0000] transition-colors min-h-[40px]"
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
                selectedBrand={selectedBrand}
                setSelectedBrand={setSelectedBrand}
                selectedLifestyle={selectedLifestyle}
                setSelectedLifestyle={setSelectedLifestyle}
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

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs font-bold text-[#8b0000]">Loading Catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
