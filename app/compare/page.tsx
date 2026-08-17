"use client";

import { useEffect, useState, useMemo } from "react";
import { useCompare } from "@/hooks/use-compare";
import { useCart } from "@/hooks/use-cart";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { RatingStars } from "@/components/common/rating-stars";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  X,
  Plus,
  ArrowLeft,
  Loader2,
  Trash2,
  Check,
} from "lucide-react";

export default function ComparePage() {
  const router = useRouter();
  const { compareIds, compareProducts, removeFromCompare, clearCompare, isLoading: isContextLoading } = useCompare();
  const { addToCartAsync } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (compareProducts && compareProducts.length > 0) {
      setProducts(compareProducts);
      setIsLoading(false);
    } else if (compareIds.length === 0) {
      setProducts([]);
      setIsLoading(false);
    } else {
      setIsLoading(isContextLoading);
    }
  }, [compareProducts, compareIds, isContextLoading]);

  const handleAddToCart = async (product: Product) => {
    if (addingId) return;
    setAddingId(product.id);
    try {
      const isVariable = product.type === "variable" || (product.variants && product.variants.length > 1);
      await addToCartAsync(
        product,
        isVariable ? undefined : product.variants?.[0],
        1,
        undefined,
        true
      );
    } catch {
      // Handled
    } finally {
      setTimeout(() => setAddingId(null), 1800);
    }
  };

  // Extract all unique technical specification labels across all compared products
  const specRows = useMemo(() => {
    if (products.length === 0) return [];

    const labelSet = new Set<string>();
    const labelOrder: string[] = [];

    products.forEach((p) => {
      if (p.brand) {
        if (!labelSet.has("Brand")) {
          labelSet.add("Brand");
          labelOrder.push("Brand");
        }
      }
      if (p.categoryLabel) {
        if (!labelSet.has("Category")) {
          labelSet.add("Category");
          labelOrder.push("Category");
        }
      }

      // Non-variation specifications
      const techSpecs = (p as any).technicalSpecifications;
      if (Array.isArray(techSpecs)) {
        techSpecs.forEach((spec: any) => {
          if (spec && spec.name && spec.value) {
            const name = String(spec.name).trim();
            if (!labelSet.has(name)) {
              labelSet.add(name);
              labelOrder.push(name);
            }
          }
        });
      }

      if (Array.isArray(p.specs)) {
        p.specs.forEach((spec) => {
          if (spec && spec.name && spec.value) {
            const name = String(spec.name).trim();
            if (!labelSet.has(name)) {
              labelSet.add(name);
              labelOrder.push(name);
            }
          }
        });
      }
    });

    // Filter to only labels where at least ONE product has a non-empty value
    return labelOrder.filter((label) => {
      return products.some((p) => {
        if (label === "Brand") return Boolean(p.brand);
        if (label === "Category") return Boolean(p.categoryLabel);
        
        const techSpecs = (p as any).technicalSpecifications;
        const specMatch = (Array.isArray(techSpecs) ? techSpecs : []).find(
          (s: any) => String(s.name).toLowerCase() === label.toLowerCase()
        ) || (Array.isArray(p.specs) ? p.specs : []).find(
          (s) => String(s.name).toLowerCase() === label.toLowerCase()
        );
        return Boolean(specMatch && specMatch.value && String(specMatch.value).trim().length > 0);
      });
    });
  }, [products]);

  const getSpecValue = (product: Product, label: string): string => {
    if (label === "Brand") return product.brand || "—";
    if (label === "Category") return product.categoryLabel || "—";

    const techSpecs = (product as any).technicalSpecifications;
    const specMatch = (Array.isArray(techSpecs) ? techSpecs : []).find(
      (s: any) => String(s.name).toLowerCase() === label.toLowerCase()
    ) || (Array.isArray(product.specs) ? product.specs : []).find(
      (s) => String(s.name).toLowerCase() === label.toLowerCase()
    );

    if (specMatch && specMatch.value && String(specMatch.value).trim()) {
      return String(specMatch.value).trim();
    }

    return "—";
  };

  if (isLoading && compareIds.length > 0) {
    return (
      <div className="py-16 bg-white min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#8b0000] animate-spin" />
        <p className="text-xs font-bold text-[#8e706b] uppercase tracking-wider">
          Loading Product Specifications...
        </p>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#8b0000] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Catalog
            </Link>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#261816] flex items-center gap-2.5 tracking-tight">
              <ArrowLeftRight className="w-7 h-7 sm:w-8 sm:h-8 text-[#8b0000] shrink-0" /> Compare Products
            </h1>
            <p className="text-xs sm:text-sm text-[#5a403c]">
              Side-by-side technical specification analysis for high-end decision making.
            </p>
          </div>

          {products.length > 0 && (
            <button
              onClick={clearCompare}
              className="px-4 py-2.5 bg-[#ffe9e6] text-[#8b0000] rounded-xl text-xs font-bold hover:bg-[#8b0000] hover:text-white transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Clear All Comparison Slots
            </button>
          )}
        </div>

        {/* Comparison Table Grid */}
        {products.length > 0 ? (
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#e3beb8]/60 shadow-sm overflow-x-auto">
            <div className="min-w-[700px] space-y-6">
              {/* Product Headers Grid */}
              <div
                className="grid gap-6 border-b border-[#ffe9e6] pb-6"
                style={{
                  gridTemplateColumns: `180px repeat(${products.length + (products.length < 4 ? 1 : 0)}, minmax(0, 1fr))`,
                }}
              >
                <div className="flex flex-col justify-end">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8e706b]">
                    Comparing ({products.length}/4 Devices)
                  </span>
                </div>

                {products.map((product) => (
                  <div key={product.id} className="relative space-y-3 group bg-[#faf5f4] p-3.5 rounded-2xl border border-[#e3beb8]/50 flex flex-col justify-between">
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute -top-2 -right-2 p-1.5 bg-[#ffe9e6] text-[#8b0000] hover:bg-[#8b0000] hover:text-white rounded-full transition-colors z-10 shadow-xs cursor-pointer"
                      title="Remove from Compare"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      {/* eslint-disable-next-img-element */}
                      <img
                        src={product.featuredImage}
                        alt={product.title}
                        className="w-full h-32 sm:h-36 object-cover object-center rounded-xl bg-white p-1 border border-[#e3beb8]/40 mb-2"
                      />

                      <RatingStars rating={product.rating || 0} reviewCount={product.reviewCount || 0} size={11} />
                      
                      <h3 className="font-bold text-xs sm:text-sm text-[#261816] line-clamp-2 mt-1 min-h-[32px] leading-snug">
                        {product.title}
                      </h3>
                      
                      <span className="text-sm sm:text-base font-extrabold text-[#8b0000] block mt-1">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    {(() => {
                      const isCompareInStock =
                        product.variants && product.variants.length > 0
                          ? product.variants.some((v) => v.inStock && v.stockStatus !== "outofstock")
                          : true;

                      return isCompareInStock ? (
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={addingId === product.id}
                          className={`w-full py-2 rounded-xl text-xs font-bold transition-all shadow-xs min-h-[36px] cursor-pointer flex items-center justify-center gap-1 ${
                            addingId === product.id
                              ? "bg-emerald-700 text-white"
                              : "bg-[#8b0000] hover:bg-[#bc0000] text-white"
                          }`}
                        >
                          {addingId === product.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Added!
                            </>
                          ) : (
                            "Add to Bag"
                          )}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-2 rounded-xl text-[10px] font-extrabold bg-[#e3beb8]/60 text-[#8e706b] border border-[#e3beb8] cursor-not-allowed shadow-none min-h-[36px] uppercase tracking-wider"
                        >
                          Out of Stock
                        </button>
                      );
                    })()}
                  </div>
                ))}

                {/* Add Slot Button if less than 4 */}
                {products.length < 4 && (
                  <button
                    onClick={() => router.push("/shop")}
                    className="border-2 border-dashed border-[#e3beb8] rounded-2xl flex flex-col items-center justify-center p-6 text-center text-[#8e706b] hover:border-[#8b0000] hover:text-[#8b0000] transition-colors min-h-[220px] cursor-pointer"
                  >
                    <Plus className="w-8 h-8 text-[#8b0000] mb-2" />
                    <span className="text-xs font-bold">Add Another Device</span>
                    <span className="text-[10px] text-[#8e706b] mt-0.5">({4 - products.length} slot remaining)</span>
                  </button>
                )}
              </div>

              {/* Technical Specifications Rows */}
              <div className="space-y-1">
                <div className="py-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#8b0000] bg-[#ffe9e6] px-3 py-1.5 rounded-lg inline-block">
                    Technical Specifications Comparison
                  </h4>
                </div>

                {specRows.length === 0 ? (
                  <p className="text-xs text-[#8e706b] italic py-4">No additional specifications available for comparison.</p>
                ) : (
                  specRows.map((label, idx) => (
                    <div
                      key={label}
                      className={`grid gap-6 text-xs py-3 px-2 rounded-xl transition-colors ${
                        idx % 2 === 0 ? "bg-[#faf5f4]" : "bg-white"
                      }`}
                      style={{
                        gridTemplateColumns: `180px repeat(${products.length + (products.length < 4 ? 1 : 0)}, minmax(0, 1fr))`,
                      }}
                    >
                      <span className="font-bold text-[#5a403c] self-center flex items-center gap-1.5">
                        {label}
                      </span>
                      {products.map((p) => {
                        const val = getSpecValue(p, label);
                        return (
                          <span
                            key={p.id}
                            className={`font-semibold text-xs self-center ${
                              val === "—" ? "text-[#8e706b]/50" : "text-[#261816]"
                            }`}
                          >
                            {val}
                          </span>
                        );
                      })}
                      {products.length < 4 && <span className="text-xs text-[#8e706b]/30 self-center">—</span>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#e3beb8] shadow-sm space-y-4">
            <ArrowLeftRight className="w-12 h-12 text-[#8b0000] mx-auto opacity-40" />
            <h3 className="text-2xl font-bold text-[#261816]">No products selected for comparison.</h3>
            <p className="text-sm text-[#5a403c] max-w-md mx-auto">
              Select devices from our catalog to perform side-by-side specs analysis.
            </p>
            <Link
              href="/shop"
              className="inline-block px-6 py-3.5 bg-[#8b0000] text-white font-bold text-xs rounded-xl hover:bg-[#bc0000] transition-colors min-h-[44px]"
            >
              Browse Products & Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
