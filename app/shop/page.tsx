"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PRODUCTS } from "@/constants/products";
import { Product } from "@/types/product";
import { FilterSidebar } from "@/components/shop/filter-sidebar";
import { ProductCard } from "@/components/common/product-card";
import { SlidersHorizontal, Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Breadcrumbs } from "@/components/common/breadcrumbs";

function ShopContent() {
  const searchParams = useSearchParams();

  const categoryParam = searchParams.get("category") || "all";
  const brandParam = searchParams.get("brand") || "all";
  const lifestyleParam = searchParams.get("lifestyle") || "all";
  const minPriceParam = Number(searchParams.get("minPrice")) || 0;
  const maxPriceParam = Number(searchParams.get("maxPrice")) || 500000;
  const dealParam = searchParams.get("isDeal") === "true";

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedBrand, setSelectedBrand] = useState(brandParam);
  const [selectedLifestyle, setSelectedLifestyle] = useState(lifestyleParam);
  const [priceRange, setPriceRange] = useState(maxPriceParam);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // WooCommerce Integration State
  const [allProducts, setAllProducts] = useState<Product[]>(PRODUCTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isWooLive, setIsWooLive] = useState(false);
  const [wooCategoryMap, setWooCategoryMap] = useState<Record<string, string>>({});
  const [wooBrandMap, setWooBrandMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
    if (brandParam) setSelectedBrand(brandParam);
    if (lifestyleParam) setSelectedLifestyle(lifestyleParam);
    if (maxPriceParam) setPriceRange(maxPriceParam);
  }, [categoryParam, brandParam, lifestyleParam, maxPriceParam]);

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

  const filterQueryKey = `${selectedCategory}:${selectedBrand}:${searchQuery.trim()}:${sortBy}`;

  // Fetch products from Next.js WooCommerce Server API Route
  useEffect(() => {
    let isMounted = true;
    async function fetchProducts() {
      setIsLoading(true);
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

        const res = await fetch(`/api/products?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.products) && data.products.length > 0) {
            setAllProducts(data.products);
            setIsWooLive(true);
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.warn("[Shop] WooCommerce fetch fallback active:", error);
      }

      if (isMounted) {
        setAllProducts(PRODUCTS);
        setIsWooLive(false);
        setIsLoading(false);
      }
    }

    fetchProducts();
    return () => {
      isMounted = false;
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
    setPriceRange(500000);
    setSortBy("featured");
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
      ? [{ label: activeCategoryName, href: `/shop?category=${encodeURIComponent(selectedCategory)}` }]
      : [{ label: "All Products", href: "/shop" }]),
    ...(activeBrandName
      ? [{ label: activeBrandName, href: `/shop?category=${encodeURIComponent(selectedCategory)}&brand=${encodeURIComponent(selectedBrand)}` }]
      : []),
  ];

  return (
    <div className="pt-4 sm:pt-6 pb-6 sm:pb-10 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Dynamic WooCommerce Category / Brand Breadcrumb */}
        <Breadcrumbs items={breadcrumbItems} />

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

          {/* Main Catalog Area */}
          <div className="flex-1 w-full space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fff8f6] p-4 rounded-2xl border border-[#ffe9e6]">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#8b0000] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by keyword, title, brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-[#e3beb8] rounded-xl outline-none focus:border-[#8b0000] transition-colors"
                />
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#e3beb8] rounded-xl text-xs font-bold text-[#261816] shadow-sm active:scale-95 transition-all"
                >
                  <SlidersHorizontal className="w-4 h-4 text-[#8b0000]" />
                  <span>Filters</span>
                </button>

                {/* Sorting Select */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#5a403c] hidden sm:inline">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 text-xs sm:text-sm font-bold bg-white border border-[#e3beb8] rounded-xl outline-none focus:border-[#8b0000] text-[#261816] cursor-pointer"
                  >
                    <option value="featured">Featured Hardware</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Customer Rating</option>
                    <option value="popular">Most Popular</option>
                    <option value="discount">Biggest Savings %</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Counter & Live Data Status Indicator */}
            <div className="flex items-center justify-between text-xs text-[#5a403c] px-1 font-medium">
              <span>
                Showing <strong className="text-[#261816] font-extrabold">{filteredProducts.length}</strong> Devices
              </span>
              {isWooLive && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live WooCommerce Data
                </span>
              )}
            </div>

            {/* Product Grid / Loading / Empty State */}
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#8b0000] animate-spin" />
                <p className="text-xs text-[#5a403c] font-medium">Syncing product catalog...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
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
                    Try relaxing your price range filter, selecting a different category, or resetting all filters.
                  </p>
                </div>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-[#8b0000] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#bc0000] transition-colors"
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
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-xs h-full bg-white p-5 text-[#261816] flex flex-col justify-between z-10 overflow-y-auto"
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
    <Suspense
      fallback={
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white min-h-screen">
          <Loader2 className="w-8 h-8 text-[#8b0000] animate-spin" />
          <p className="text-xs text-[#5a403c] font-medium">Loading catalog...</p>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
