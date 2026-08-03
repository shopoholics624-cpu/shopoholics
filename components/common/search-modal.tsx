"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Sparkles, Mic, History, TrendingUp, SlidersHorizontal } from "lucide-react";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { PRODUCTS } from "@/constants/products";
import { formatPrice } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);

  const recentSearches = ["Titanium Pro", "M4 Laptop", "Spatial Audio", "4K OLED Monitor"];
  const trendingSearches = ["RTX 4090 Rigs", "8K Cinema Optics", "Apple Watch Ultra", "Thread Hub"];

  const filteredProducts = query.trim() === ""
    ? PRODUCTS.slice(0, 4)
    : PRODUCTS.filter((p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase()) ||
        p.categoryLabel.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      );

  const handleVoiceSearch = () => {
    setIsListening(true);
    setTimeout(() => {
      setQuery("Titanium Pro");
      setIsListening(false);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#e3beb8]/60 overflow-hidden"
          >
            {/* Input Bar with Voice Search UI */}
            <div className="relative flex items-center px-4 sm:px-6 py-4 border-b border-[#ffe9e6] gap-2">
              <Search className="w-5 h-5 text-[#8b0000] shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Smartphones, Laptops, Audio, Brands..."
                autoFocus
                className="w-full text-base sm:text-lg text-[#261816] placeholder:text-[#5a403c]/50 bg-transparent outline-none font-medium"
              />

              <button
                onClick={handleVoiceSearch}
                className={`p-2 rounded-full transition-all ${
                  isListening
                    ? "bg-[#8b0000] text-white animate-pulse"
                    : "text-[#5a403c] hover:text-[#8b0000] hover:bg-[#ffe9e6]"
                }`}
                title="Voice Search"
                aria-label="Voice Search"
              >
                <Mic className="w-5 h-5" />
              </button>

              <button
                onClick={onClose}
                className="p-2 text-[#5a403c] hover:text-[#8b0000] hover:bg-[#ffe9e6] rounded-full transition-colors"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Search Tags & History */}
            {query.trim() === "" && (
              <div className="p-4 sm:p-6 border-b border-[#ffe9e6] space-y-3 bg-[#fff8f6]">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#8e706b] uppercase tracking-wider">
                    <History className="w-3.5 h-3.5 text-[#8b0000]" /> Recent Searches
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => setQuery(term)}
                        className="px-3 py-1 bg-white hover:bg-[#ffe9e6] border border-[#e3beb8]/60 text-xs font-semibold text-[#261816] rounded-full shadow-sm transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#8e706b] uppercase tracking-wider">
                    <TrendingUp className="w-3.5 h-3.5 text-[#8b0000]" /> Trending Keywords
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => setQuery(term)}
                        className="px-3 py-1 bg-white hover:bg-[#ffe9e6] border border-[#e3beb8]/60 text-xs font-semibold text-[#8b0000] rounded-full shadow-sm transition-colors"
                      >
                        🔥 {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Results List */}
            <div className="p-4 sm:p-6 max-h-[50vh] overflow-y-auto space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#8b0000] uppercase tracking-wider">
                <span>{query.trim() === "" ? "Curated Marketplace Suggestions" : `Matching Results (${filteredProducts.length})`}</span>
                {query.trim() === "" && (
                  <span className="flex items-center gap-1 text-[#5a403c] font-normal lowercase text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#e51c10]" /> Live hardware feed
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#fff0ee] border border-transparent hover:border-[#e3beb8]/60 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-img-element */}
                      <img
                        src={product.featuredImage}
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded-xl border border-[#e3beb8]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[#8b0000] uppercase tracking-wider">
                            {product.brand}
                          </span>
                          <span className="text-[10px] text-[#8e706b]">• {product.categoryLabel}</span>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-[#261816] group-hover:text-[#8b0000] transition-colors">
                          {product.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#8b0000] text-xs sm:text-sm">
                        {formatPrice(product.price)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#8e706b] group-hover:text-[#8b0000] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}

                {filteredProducts.length === 0 && (
                  <div className="text-center py-8 space-y-2">
                    <SlidersHorizontal className="w-8 h-8 text-[#8b0000] mx-auto opacity-40" />
                    <p className="text-xs text-[#5a403c]">
                      No devices found matching &quot;{query}&quot;. Try searching for Apple, Samsung, Sony, or Gaming.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-3 bg-[#fff8f6] border-t border-[#ffe9e6] flex items-center justify-between text-xs text-[#5a403c]">
              <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-[#e3beb8] rounded text-[10px] font-mono shadow-sm">ESC</kbd> to exit</span>
              <Link
                href="/shop"
                onClick={onClose}
                className="font-bold text-[#8b0000] hover:underline flex items-center gap-1"
              >
                <span>Browse Full Catalog</span> &rarr;
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
