"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Sparkles } from "lucide-react";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { PRODUCTS } from "@/constants/products";
import { formatPrice } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");

  const filteredProducts = query.trim() === ""
    ? PRODUCTS.slice(0, 3)
    : PRODUCTS.filter((p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.categoryLabel.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#e3beb8]/60 overflow-hidden"
          >
            {/* Input Bar */}
            <div className="relative flex items-center px-6 py-4 border-b border-[#ffe9e6]">
              <Search className="w-6 h-6 text-[#8b0000] shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Titanium Pro, Audio, Laptops..."
                autoFocus
                className="w-full pl-4 pr-10 py-2 text-lg text-[#261816] placeholder:text-[#5a403c]/50 bg-transparent outline-none font-medium"
              />
              <button
                onClick={onClose}
                className="p-2 text-[#5a403c] hover:text-[#610000] hover:bg-[#ffe9e6] rounded-full transition-colors"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-[#8b0000] uppercase tracking-wider">
                <span>{query.trim() === "" ? "Trending Hardware" : `Results (${filteredProducts.length})`}</span>
                {query.trim() === "" && (
                  <span className="flex items-center gap-1 text-[#5a403c] font-normal lowercase text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#e51c10]" /> Curated suggestions
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#fff0ee] transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      {/* eslint-disable-next-img-element */}
                      <img
                        src={product.featuredImage}
                        alt={product.title}
                        className="w-14 h-14 object-cover rounded-xl border border-[#e3beb8]"
                      />
                      <div>
                        <h4 className="font-semibold text-[#261816] group-hover:text-[#8b0000] transition-colors">
                          {product.title}
                        </h4>
                        <p className="text-xs text-[#5a403c] line-clamp-1">{product.tagline}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#8b0000] text-sm">
                        {formatPrice(product.price)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#8e706b] group-hover:text-[#8b0000] group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}

                {filteredProducts.length === 0 && (
                  <p className="text-center text-sm text-[#5a403c] py-8">
                    No luxury devices found matching &quot;{query}&quot;
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-white border-t border-[#ffe9e6] flex items-center justify-between text-xs text-[#5a403c]">
              <span>Press <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px] font-mono shadow-sm">ESC</kbd> to exit</span>
              <Link
                href="/shop"
                onClick={onClose}
                className="font-medium text-[#8b0000] hover:underline"
              >
                Browse Full Catalog &rarr;
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
