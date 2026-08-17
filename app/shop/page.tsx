"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Product } from "@/types/product";
import { FilterSidebar } from "@/components/shop/filter-sidebar";
import { ProductCard } from "@/components/common/product-card";
import { SlidersHorizontal, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Breadcrumbs } from "@/components/common/breadcrumbs";

function ShopContent() {
  const searchParams = useSearchParams();

  const categoryParam = searchParams.get("category") || "all";
  const brandParam = searchParams.get("brand") || "all";
  const lifestyleParam = searchParams.get("lifestyle") || "all";
  const minPriceParam = Number(searchParams.get("minPrice")) || 0;
  const maxPriceParam = Number(searchParams.get("maxPrice")) || 500000;
  const dealParam = searchParams.get("isDeal") === "true";
  const searchParam = searchParams.get("search") || searchParams.get("q") || "";

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedBrand, setSelectedBrand] = useState(brandParam);
  const [selectedLifestyle, setSelectedLifestyle] = useState(lifestyleParam);
  const [priceRange, setPriceRange] = useState(maxPriceParam);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // WooCommerce Integration State
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isWooLive, setIsWooLive] = useState(false);
  const [wooCategoryMap, setWooCategoryMap] = useState<Record<string, string>>({});
  const [wooBrandMap, setWooBrandMap] = useState<Record<string, string>>({});
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
    if (brandParam) setSelectedBrand(brandParam);
    if (lifestyleParam) setSelectedLifestyle(lifestyleParam);
    if (maxPriceParam) setPriceRange(maxPriceParam);
    if (searchParam !== undefined) setSearchQuery(searchParam);
  }, [categoryParam, brandParam, lifestyleParam, maxPriceParam, searchParam]);

  useEffect(() => {
    async function fetchMeta() {
      try {
        const [catRes, brandRes] = await Promise.all([fetch("/api/categories"), fetch("/api/brands")]);
        if (catRes.ok) {
          const catData = await catRes.json();
          if (catData.success && Array.isArray(catData.categories)) {
            const map: Record<string, string> = {};
            catData.categories.forEach((c: { slug: string; name: string }) => {
              map[c.slug.toLowerCase()] = c.name;
            });
            setWooCategoryMap(map);
          }
        }
        if (brandRes.ok) {
          const brandData = await brandRes.json();
          if (brandData.success && Array.isArray(brandData.brands)) {
            const map: Record<string, string> = {};
            brandData.brands.forEach((b: { slug: string; name: string }) => {
              map[b.slug.toLowerCase()] = b.name;
            });
            setWooBrandMap(map);
          }
        }
      } catch (e) {
        console.warn("[Shop] Meta fetch error:", e);
      }
    }
    fetchMeta();
  }, []);

  const filterQueryKey = `${selectedCategory}:${selectedBrand}:${searchQuery.trim()}:${sortBy}:${retryTrigger}`;

  // Fetch products from Next.js WooCommerce Server API Route
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    async function fetchProducts() {
      // 1. Immediately enter loading state and clear old products to prevent flash of stale/previous items
      setIsLoading(true);
      setFetchError(null);
      setAllProducts([]);

      try {
        const query = new URLSearchParams();
        if (selectedCategory !== "all") query.append("category", selectedCategory);
        if (selectedBrand !== "all") query.append("brand", selectedBrand);
        if (searchQuery.trim()) query.append("search", searchQuery.trim());
        if (sortBy === "price-low") {
          query.append("orderby", "price");
          query.append("order", "asc");
        } else if (sortBy === "price-high") {
          query.append("orderby", "price");
          query.append("order", "desc");
        } else if (sortBy === "rating") {
          query.append("orderby", "rating");
          query.append("order", "desc");
        }

        const res = await fetch(`/api/products?${query.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!isMounted) return;

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.products)) {
            setAllProducts(data.products);
            setIsWooLive(true);
            setIsLoading(false);
            return;
          }
        }

        if (isMounted) {
          setAllProducts([]);
          setIsWooLive(true);
          setIsLoading(false);
        }
      } catch (error: any) {
        if (error.name === "AbortError") return;
        console.error("[Shop] WooCommerce product fetch error:", error);
        if (isMounted) {
          setAllProducts([]);
          setFetchError("Unable to load search results. Please check your network connection and try again.");
          setIsLoading(false);
        }
      }
    }

    fetchProducts();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [filterQueryKey]);

  const filteredProducts = allProducts.filter((product) => {
    if (selectedCategory !== "all") {
      const lowerCat = selectedCategory.toLowerCase().trim();
      const matchCategory =
        product.category.toLowerCase() === lowerCat ||
        product.categorySlugs?.some((s) => s.toLowerCase() === lowerCat) ||
        product.categoryIds?.some((id) => String(id) === lowerCat) ||
        (lowerCat === "smartphones" && product.categorySlugs?.some((s) => s.includes("phone"))) ||
        (lowerCat === "laptops" && product.categorySlugs?.some((s) => s.includes("laptop"))) ||
        isWooLive;

      if (!matchCategory) return false;
    }
    if (selectedBrand !== "all" && !isWooLive) {
      if (product.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }
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
    if (inStockOnly && product.variants?.some((v) => v.inStock === false)) {
      return false;
    }
    if (searchQuery.trim() !== "" && !isWooLive) {
      const qLower = searchQuery.toLowerCase().trim();
      const match =
        product.title.toLowerCase().includes(qLower) ||
        product.brand.toLowerCase().includes(qLower) ||
        product.categoryLabel.toLowerCase().includes(qLower) ||
        (product.categorySlugs || []).some((s) => s.toLowerCase().includes(qLower)) ||
        product.description.toLowerCase().includes(qLower);
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
    setPriceRange(500000);
    setSortBy("featured");
    setSearchQuery("");
  };

  const activeCategoryName =
    selectedCategory !== "all"
      ? wooCategoryMap[selectedCategory.toLowerCase()] ||
        selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
      : undefined;

  const activeBrandName =
    selectedBrand !== "all"
      ? wooBrandMap[selectedBrand.toLowerCase()] ||
        selectedBrand.charAt(0).toUpperCase() + selectedBrand.slice(1)
      : undefined;

  const breadcrumbItems = [
    { label: "Shop", href: "/shop" },
    ...(activeCategoryName
      ? [{ label: activeCategoryName, href: `/shop?category=${selectedCategory}` }]
      : []),
    ...(activeBrandName
      ? [{ label: activeBrandName, href: `/shop?brand=${selectedBrand}` }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-white text-[#261816] pt-12 sm:pt-14 pb-16">
      {/* Top Banner Header */}
      <div className="bg-[#FAF9F5] border-b border-[#D4D3CD] py-6 sm:py-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1C1C1A] tracking-tight">
                {searchQuery.trim()
                  ? `Search: "${searchQuery.trim()}"`
                  : activeCategoryName || activeBrandName || "Browse Catalog"}
              </h1>
              <p className="text-xs sm:text-sm text-[#5A5954] mt-1 font-medium">
                Showing {isLoading ? "..." : filteredProducts.length} authentic devices with official manufacturer warranty.
              </p>
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#D4D3CD] rounded-xl text-xs font-bold text-[#1C1C1A] shadow-xs cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#8b0000]" />
              <span>Filters & Sort</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
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

          {/* Product Grid Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Top Toolbar / Active Filters Pill */}
            <div className="flex items-center justify-between bg-[#FAF9F5] p-3 rounded-2xl border border-[#D4D3CD]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#5A5954] font-medium hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-[#D4D3CD] text-[#1C1C1A] text-xs rounded-xl px-3 py-1.5 font-bold outline-none cursor-pointer"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="discount">Biggest Savings</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              {isWooLive && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Store Catalog
                </span>
              )}
            </div>

            {/* Product Grid / Loading Skeleton / Error / Empty State */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-[#e5e4de] shadow-2xs animate-pulse space-y-3"
                  >
                    <div className="h-4 w-20 bg-[#f1f0eb] rounded-full" />
                    <div className="h-32 sm:h-44 bg-[#f8f7f5] rounded-xl w-full" />
                    <div className="space-y-2 pt-1">
                      <div className="h-4 bg-[#f1f0eb] rounded w-3/4" />
                      <div className="h-3 bg-[#f8f7f5] rounded w-1/2" />
                    </div>
                    <div className="pt-2 border-t border-[#f1f0eb] flex items-center justify-between">
                      <div className="h-5 bg-[#f1f0eb] rounded w-24" />
                      <div className="h-8 bg-[#f1f0eb] rounded-xl w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : fetchError ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#e3beb8] space-y-4">
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto text-rose-600">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#261816]">Unable to load products</h3>
                  <p className="text-xs text-[#5a403c] mt-1 max-w-sm mx-auto">
                    {fetchError}
                  </p>
                </div>
                <button
                  onClick={() => setRetryTrigger((prev) => prev + 1)}
                  className="px-5 py-2.5 bg-[#8b0000] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#bc0000] transition-colors cursor-pointer"
                >
                  Retry Search
                </button>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} variant="shop" />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#e3beb8] space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#ffe9e6] flex items-center justify-center mx-auto text-[#8b0000]">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#261816]">No matching products found</h3>
                  <p className="text-xs text-[#5a403c] mt-1 max-w-sm mx-auto">
                    {searchQuery.trim()
                      ? `No products found matching "${searchQuery.trim()}". Try checking spelling or searching for another keyword.`
                      : "Try relaxing your price range filter, selecting a different category, or resetting all filters."}
                  </p>
                </div>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-[#8b0000] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#bc0000] transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Filter */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="relative w-full max-w-xs bg-white h-full overflow-y-auto p-6 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#D4D3CD]">
                <h3 className="font-extrabold text-lg text-[#1C1C1A]">Filters & Sort</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="text-xs font-bold text-[#8b0000]"
                >
                  Close
                </button>
              </div>
              <div className="py-4">
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#8b0000] border-t-transparent animate-spin" />
            <p className="text-xs text-[#5a403c] font-bold">Loading Shop...</p>
          </div>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
