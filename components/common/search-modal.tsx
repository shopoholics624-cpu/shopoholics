"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  ArrowRight,
  Clock,
  ChevronDown,
  ArrowUpLeft,
  CheckCircle2,
  SlidersHorizontal,
  Tag,
  Laptop,
  Smartphone,
  Headphones,
  Watch,
  HardDrive,
  Layers,
} from "lucide-react";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { Product } from "@/types/product";
import { formatPrice, decodeHtmlEntities } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SuggestionItem {
  id: string;
  type: "query" | "category_scope" | "brand";
  query: string;
  categorySlug?: string;
  categoryName?: string;
}

const SEARCH_CATEGORIES = [
  { slug: "all", name: "All Categories" },
  { slug: "smartphones", name: "Smartphones", icon: Smartphone },
  { slug: "laptops", name: "Laptops", icon: Laptop },
  { slug: "audio", name: "Audio", icon: Headphones },
  { slug: "smartwatches", name: "Smartwatches", icon: Watch },
  { slug: "storage", name: "Storage", icon: HardDrive },
  { slug: "accessories", name: "Accessories", icon: Layers },
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery("");
      setActiveIndex(-1);
      setIsCategoryDropdownOpen(false);
      setSearchResults([]);
    }
  }, [isOpen]);

  // Load persistent customer/guest recent searches and live catalog products
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    async function loadSearchData() {
      try {
        const [searchesRes, prodsRes] = await Promise.all([
          fetch(`/api/account/searches?_t=${Date.now()}`, { cache: "no-store" }),
          fetch(`/api/products?per_page=100`, { cache: "no-store" }),
        ]);

        if (searchesRes.ok) {
          const sData = await searchesRes.json();
          if (isMounted && sData.success && Array.isArray(sData.searches)) {
            setRecentSearches(sData.searches);
          }
        }

        if (prodsRes.ok) {
          const pData = await prodsRes.json();
          if (isMounted && pData.success && Array.isArray(pData.products)) {
            setCatalogProducts(pData.products);
          }
        }
      } catch (err) {
        console.warn("[SearchModal] Initialization fetch error:", err);
      }
    }

    loadSearchData();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Persist a search term to Firestore
  const recordSearchTerm = async (term: string) => {
    const clean = term.trim();
    if (!clean || clean.length < 2) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== clean.toLowerCase());
      return [clean, ...filtered].slice(0, 10);
    });

    try {
      await fetch("/api/account/searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: clean }),
      });
    } catch (err) {
      console.warn("[SearchModal] Failed to record search term:", err);
    }
  };

  // Delete a single recent search term
  const handleRemoveSingleSearch = async (termToRemove: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setRecentSearches((prev) => prev.filter((s) => s.toLowerCase() !== termToRemove.toLowerCase()));

    try {
      await fetch(`/api/account/searches?term=${encodeURIComponent(termToRemove)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("[SearchModal] Failed to delete search term:", err);
    }
  };

  // Clear all recent searches
  const handleClearAllSearches = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRecentSearches([]);
    try {
      await fetch("/api/account/searches", {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("[SearchModal] Failed to clear searches:", err);
    }
  };

  // Smart, Genuine Suggestions Generator from Real Catalog Data
  const suggestions: SuggestionItem[] = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    const candidates = new Map<string, SuggestionItem>();

    // 1. Direct query match
    candidates.set(trimmed, {
      id: `query_${trimmed}`,
      type: "query",
      query: trimmed,
    });

    // 2. Genuine Category Scope: Only if products actually exist in that specific category
    const matchingCategories = new Map<string, { slug: string; name: string; count: number }>();
    for (const p of catalogProducts) {
      const titleClean = decodeHtmlEntities(p.title || "");
      const brandClean = decodeHtmlEntities(p.brand || "");
      const descClean = decodeHtmlEntities(p.description || "");
      const catLabelClean = decodeHtmlEntities(p.categoryLabel || p.category || "");
      const catSlug = p.category || "";

      const titleLower = titleClean.toLowerCase();
      const brandLower = brandClean.toLowerCase();
      const descLower = descClean.toLowerCase();

      if (titleLower.includes(trimmed) || brandLower.includes(trimmed) || descLower.includes(trimmed)) {
        if (catSlug) {
          const existing = matchingCategories.get(catSlug) || { slug: catSlug, name: catLabelClean, count: 0 };
          existing.count += 1;
          matchingCategories.set(catSlug, existing);
        }
      }
    }

    // Add only top matching category with highest product count (e.g. "iphone in Mobile Phones")
    const sortedCats = Array.from(matchingCategories.values()).sort((a, b) => b.count - a.count);
    if (sortedCats.length > 0 && sortedCats[0].count > 0) {
      const topCat = sortedCats[0];
      const scopeKey = `${trimmed}_in_${topCat.slug}`;
      candidates.set(scopeKey, {
        id: scopeKey,
        type: "category_scope",
        query: trimmed,
        categorySlug: topCat.slug,
        categoryName: decodeHtmlEntities(topCat.name),
      });
    }

    // 3. Genuine Product & Model Phrase Extraction
    const phrasesMap = new Map<string, number>();

    for (const p of catalogProducts) {
      const title = decodeHtmlEntities((p.title || "").trim());
      const titleLower = title.toLowerCase();
      const brand = decodeHtmlEntities((p.brand || "").trim());
      const brandLower = brand.toLowerCase();

      // Brand exact/prefix match
      if (brandLower.startsWith(trimmed) && brandLower !== trimmed) {
        phrasesMap.set(brand, (phrasesMap.get(brand) || 0) + 10);
      }

      if (titleLower.includes(trimmed)) {
        const withoutBrand = titleLower.startsWith(brandLower)
          ? title.slice(brand.length).trim()
          : title;

        const idx = titleLower.indexOf(trimmed);
        const sub = title.slice(idx);
        const cleanSub = decodeHtmlEntities(
          sub
            .replace(/\b\d+GB\b/gi, "")
            .replace(/\b\d+TB\b/gi, "")
            .replace(/\b\d+GB\s+RAM\b/gi, "")
            .replace(/\([^)]*\)/g, "")
            .replace(/[-–—,].*$/, "")
            .trim()
        );

        if (cleanSub && cleanSub.length >= trimmed.length) {
          phrasesMap.set(cleanSub, (phrasesMap.get(cleanSub) || 0) + 5);
        }

        const cleanWithoutBrand = decodeHtmlEntities(
          withoutBrand
            .replace(/\b\d+GB\b/gi, "")
            .replace(/\b\d+TB\b/gi, "")
            .replace(/\([^)]*\)/g, "")
            .replace(/[-–—,].*$/, "")
            .trim()
        );

        if (cleanWithoutBrand && cleanWithoutBrand.toLowerCase().includes(trimmed)) {
          phrasesMap.set(cleanWithoutBrand, (phrasesMap.get(cleanWithoutBrand) || 0) + 3);
        }
      }
    }

    // Sort extracted genuine phrases
    const sortedPhrases = Array.from(phrasesMap.keys())
      .filter((phrase) => {
        const pLower = phrase.toLowerCase();
        return pLower.length >= trimmed.length && pLower !== trimmed;
      })
      .sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(trimmed);
        const bStarts = b.toLowerCase().startsWith(trimmed);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.length - b.length;
      });

    for (const phrase of sortedPhrases) {
      const decodedPhrase = decodeHtmlEntities(phrase);
      const pLower = decodedPhrase.toLowerCase();
      if (!candidates.has(pLower)) {
        candidates.set(pLower, {
          id: `phrase_${pLower}`,
          type: "query",
          query: decodedPhrase,
        });
      }
      if (candidates.size >= 8) break;
    }

    return Array.from(candidates.values()).slice(0, 8);
  }, [query, catalogProducts]);

  // Dynamic Debounced Product Search with ZERO flash of previous results
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    const trimmed = query.trim();

    // Immediately clear previous search results and enter loading state
    setIsLoadingResults(true);
    setSearchResults([]);

    searchDebounceRef.current = setTimeout(async () => {
      if (trimmed === "") {
        if (isMounted) {
          setSearchResults([]);
          setIsLoadingResults(false);
        }
        return;
      }

      try {
        const catParam = selectedCategory !== "all" ? `&category=${encodeURIComponent(selectedCategory)}` : "";
        const res = await fetch(`/api/products?search=${encodeURIComponent(trimmed)}${catParam}&per_page=12`, {
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.products)) {
            if (isMounted) {
              setSearchResults(data.products);
              setIsLoadingResults(false);
            }
            return;
          }
        }
      } catch (err) {
        console.error("[SearchModal] Product search error:", err);
      }

      if (isMounted) {
        setSearchResults([]);
        setIsLoadingResults(false);
      }
    }, 180);

    return () => {
      isMounted = false;
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [query, selectedCategory, isOpen]);

  // Navigate to shop results
  const executeSearch = (searchTerm: string, categorySlug?: string) => {
    const clean = searchTerm.trim();
    if (!clean) return;

    recordSearchTerm(clean);
    onClose();

    const targetCat = categorySlug || (selectedCategory !== "all" ? selectedCategory : undefined);
    const catQuery = targetCat ? `&category=${encodeURIComponent(targetCat)}` : "";
    router.push(`/shop?search=${encodeURIComponent(clean)}${catQuery}`);
  };

  // Keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (suggestions.length > 0) {
        const next = activeIndex < suggestions.length - 1 ? activeIndex + 1 : 0;
        setActiveIndex(next);
        const item = suggestions[next];
        if (item) setQuery(item.query);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (suggestions.length > 0) {
        const prev = activeIndex > 0 ? activeIndex - 1 : suggestions.length - 1;
        setActiveIndex(prev);
        const item = suggestions[prev];
        if (item) setQuery(item.query);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        const item = suggestions[activeIndex];
        executeSearch(item.query, item.categorySlug);
      } else if (query.trim()) {
        executeSearch(query);
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  // Amazon-style highlight of typed letters vs suggested suffix
  const renderHighlightedSuggestion = (fullText: string, typed: string) => {
    const cleanFull = decodeHtmlEntities(fullText);
    const cleanTyped = typed.trim().toLowerCase();
    const lowerFull = cleanFull.toLowerCase();

    if (!cleanTyped || !lowerFull.includes(cleanTyped)) {
      return <span className="font-semibold text-[#1c1c1a]">{cleanFull}</span>;
    }

    const startIdx = lowerFull.indexOf(cleanTyped);
    const before = cleanFull.slice(0, startIdx);
    const match = cleanFull.slice(startIdx, startIdx + cleanTyped.length);
    const after = cleanFull.slice(startIdx + cleanTyped.length);

    return (
      <span className="text-[#1c1c1a] text-sm">
        {before && <span className="font-medium text-[#71706b]">{before}</span>}
        <span className="font-semibold text-[#1c1c1a]">{match}</span>
        {after && <span className="font-extrabold text-[#1c1c1a]">{after}</span>}
      </span>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 px-3 sm:px-4 bg-black/65 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -16 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#d8d7d0] overflow-hidden flex flex-col max-h-[88vh]"
          >
            {/* ========================================================================= */}
            {/* 1. AMAZON.IN-STYLE INTEGRATED SEARCH BAR (Clean, no square line inside)   */}
            {/* ========================================================================= */}
            <div className="p-2.5 sm:p-3.5 bg-[#f8f7f5] border-b border-[#e5e4de] flex items-center gap-2 relative">
              {/* Category Scope Dropdown */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="h-10 sm:h-11 px-2.5 sm:px-3.5 bg-[#ebe9e1] hover:bg-[#dedcd3] text-[#1c1c1a] border border-[#d8d7d0] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="max-w-[85px] sm:max-w-[120px] truncate">
                    {SEARCH_CATEGORIES.find((c) => c.slug === selectedCategory)?.name || "All"}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#71706b] transition-transform ${
                      isCategoryDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isCategoryDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-[#d8d7d0] p-1.5 z-50 text-left">
                    {SEARCH_CATEGORIES.map((cat) => (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.slug);
                          setIsCategoryDropdownOpen(false);
                          inputRef.current?.focus();
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                          selectedCategory === cat.slug
                            ? "bg-[#ffe9e6] text-[#8b0000]"
                            : "text-[#1c1c1a] hover:bg-[#f8f7f5]"
                        }`}
                      >
                        <span>{cat.name}</span>
                        {selectedCategory === cat.slug && <CheckCircle2 className="w-3.5 h-3.5 text-[#8b0000]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Main Text Input with 0 Outline / No Square Line */}
              <div className="flex-1 relative flex items-center bg-white rounded-xl border border-[#d8d7d0] focus-within:border-[#8b0000] transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(-1);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search Shop-O-Holics products, brands and devices..."
                  className="w-full h-10 sm:h-11 px-3 sm:px-4 text-sm sm:text-base text-[#1c1c1a] placeholder:text-[#8e8d88] bg-transparent border-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 shadow-none font-medium"
                  style={{ outline: "none", boxShadow: "none" }}
                />

                {/* Clear Input Button */}
                {query.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setActiveIndex(-1);
                      inputRef.current?.focus();
                    }}
                    className="p-1.5 mr-1 text-[#8e8d88] hover:text-[#1c1c1a] rounded-full transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Search Submit Button (Amazon Signature CTA) */}
              <button
                type="button"
                onClick={() => executeSearch(query)}
                className="h-10 sm:h-11 px-3.5 sm:px-5 bg-[#8b0000] hover:bg-[#a60000] active:scale-95 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                title="Search"
                aria-label="Submit Search"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Search</span>
              </button>

              {/* Close Modal Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-[#71706b] hover:text-[#1c1c1a] hover:bg-[#ebe9e1] rounded-xl transition-colors cursor-pointer"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ========================================================================= */}
            {/* 2. BODY CONTENT: RECENT SEARCHES OR REAL-TIME GENUINE SUGGESTIONS         */}
            {/* ========================================================================= */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#e5e4de]">
              {/* STATE A: EMPTY QUERY -> RECENT SEARCHES ONLY */}
              {query.trim() === "" && (
                <div className="p-4 sm:p-6 space-y-4">
                  {recentSearches.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pb-1">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#71706b]">
                          <Clock className="w-3.5 h-3.5 text-[#8b0000]" />
                          <span>Recent Searches</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearAllSearches}
                          className="text-xs text-[#71706b] hover:text-[#8b0000] font-semibold cursor-pointer transition-colors"
                        >
                          Clear all
                        </button>
                      </div>

                      <div className="divide-y divide-[#f1f0eb] border border-[#e5e4de] rounded-xl overflow-hidden bg-white shadow-2xs">
                        {recentSearches.map((term, idx) => (
                          <div
                            key={idx}
                            onClick={() => executeSearch(term)}
                            className="flex items-center justify-between px-3.5 py-2.5 hover:bg-[#fff7f5] transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <Clock className="w-4 h-4 text-[#8e8d88] group-hover:text-[#8b0000] transition-colors" />
                              <span className="text-sm font-semibold text-[#1c1c1a] group-hover:text-[#8b0000] transition-colors">
                                {decodeHtmlEntities(term)}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => handleRemoveSingleSearch(term, e)}
                              className="p-1 text-[#a8a7a1] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title={`Remove "${term}" from recent searches`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center space-y-2">
                      <Search className="w-8 h-8 text-[#8b0000]/40 mx-auto" />
                      <p className="text-sm font-bold text-[#1c1c1a]">Search Shop-O-Holics</p>
                      <p className="text-xs text-[#71706b] max-w-sm mx-auto">
                        Type any product name, brand (Apple, Samsung, Sony), or category to see instant suggestions.
                      </p>
                    </div>
                  )}

                  {/* Quick Category Jump Bar */}
                  <div className="pt-2">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#71706b] mb-2">
                      Explore Categories
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SEARCH_CATEGORIES.filter((c) => c.slug !== "all").map((cat) => (
                        <button
                          key={cat.slug}
                          type="button"
                          onClick={() => {
                            onClose();
                            router.push(`/shop?category=${cat.slug}`);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#f8f7f5] hover:bg-[#ffe9e6] hover:text-[#8b0000] border border-[#d8d7d0] text-xs font-bold text-[#1c1c1a] transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Tag className="w-3 h-3 text-[#8b0000]" />
                          <span>{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STATE B: TYPING QUERY -> GENUINE AUTOCOMPLETE LIST + MATCHING PRODUCTS */}
              {query.trim() !== "" && (
                <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#e5e4de]">
                  {/* Left Column: Genuine Predictive Keyword Suggestions */}
                  <div className="md:col-span-6 p-2 sm:p-3 space-y-1">
                    <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#71706b]">
                      Suggestions
                    </div>

                    {suggestions.length > 0 ? (
                      suggestions.map((item, idx) => {
                        const isSelected = activeIndex === idx;

                        return (
                          <div
                            key={item.id}
                            onClick={() => executeSearch(item.query, item.categorySlug)}
                            onMouseEnter={() => setActiveIndex(idx)}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer group ${
                              isSelected ? "bg-[#ffe9e6] text-[#8b0000]" : "hover:bg-[#f8f7f5]"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <Search
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isSelected ? "text-[#8b0000]" : "text-[#8e8d88]"
                                }`}
                              />
                              <div className="truncate">
                                {item.type === "category_scope" ? (
                                  <span className="text-sm">
                                    <span className="font-semibold text-[#1c1c1a]">{item.query}</span>
                                    <span className="text-[#8b0000] font-bold ml-1.5">
                                      in {item.categoryName}
                                    </span>
                                  </span>
                                ) : (
                                  renderHighlightedSuggestion(item.query, query)
                                )}
                              </div>
                            </div>

                            {/* Insert / Fill Query Icon */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setQuery(item.query);
                                if (item.categorySlug) setSelectedCategory(item.categorySlug);
                                inputRef.current?.focus();
                              }}
                              className="p-1 text-[#8e8d88] hover:text-[#8b0000] hover:bg-white rounded-md transition-colors"
                              title="Fill search bar"
                            >
                              <ArrowUpLeft className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-3 text-xs text-[#71706b]">
                        Press <kbd className="px-1.5 py-0.5 bg-neutral-100 border rounded font-mono">Enter</kbd> to search for &quot;{query}&quot;
                      </div>
                    )}
                  </div>

                  {/* Right Column: Direct Matching Products Grid */}
                  <div className="md:col-span-6 p-3 sm:p-4 space-y-2.5 bg-[#faf9f7]">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#71706b]">
                        Matching Products ({searchResults.length})
                      </span>
                      {searchResults.length > 0 && (
                        <button
                          type="button"
                          onClick={() => executeSearch(query)}
                          className="text-xs font-bold text-[#8b0000] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>See all</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                      {isLoadingResults ? (
                        <div className="space-y-2">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={`search-skel-${i}`}
                              className="h-14 rounded-xl bg-white p-2 border border-[#e5e4de] animate-pulse flex items-center gap-2.5"
                            >
                              <div className="w-10 h-10 rounded-lg bg-[#f1f0eb] shrink-0" />
                              <div className="flex-1 space-y-1.5 min-w-0">
                                <div className="h-3 w-1/3 bg-[#f1f0eb] rounded" />
                                <div className="h-3.5 w-3/4 bg-[#f8f7f5] rounded" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : searchResults.length > 0 ? (
                        searchResults.slice(0, 5).map((product) => {
                          const isInStock = product.inStock !== false;

                          return (
                            <Link
                              key={product.id}
                              href={`/products/${product.slug}`}
                              onClick={() => {
                                recordSearchTerm(product.title);
                                onClose();
                              }}
                              className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-[#fff3f0] border border-[#e5e4de] hover:border-[#8b0000]/30 shadow-2xs transition-all group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-11 h-11 rounded-lg bg-[#f1f0eb] p-1 shrink-0 overflow-hidden flex items-center justify-center">
                                  {/* eslint-disable-next-img-element */}
                                  <img
                                    src={product.featuredImage}
                                    alt={product.title}
                                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                                  />
                                </div>

                                <div className="min-w-0">
                                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#8e8d88] truncate">
                                    {decodeHtmlEntities(product.brand)}
                                  </div>
                                  <h4 className="font-bold text-xs text-[#1c1c1a] group-hover:text-[#8b0000] transition-colors truncate">
                                    {decodeHtmlEntities(product.title)}
                                  </h4>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] font-black text-[#8b0000]">
                                      {formatPrice(product.price)}
                                    </span>
                                    {isInStock ? (
                                      <span className="text-[9px] font-semibold text-emerald-700">
                                        • In Stock
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-semibold text-rose-700">
                                        • Out of Stock
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <ArrowRight className="w-3.5 h-3.5 text-[#8e8d88] group-hover:text-[#8b0000] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                            </Link>
                          );
                        })
                      ) : (
                        <div className="py-8 text-center space-y-2">
                          <SlidersHorizontal className="w-6 h-6 text-[#8b0000]/40 mx-auto" />
                          <p className="text-xs font-bold text-[#1c1c1a]">No products found</p>
                          <p className="text-[11px] text-[#71706b]">
                            Try checking spelling or searching for a general keyword.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* 3. MODAL FOOTER                                                           */}
            {/* ========================================================================= */}
            <div className="px-4 py-2.5 bg-[#f8f7f5] border-t border-[#e5e4de] flex items-center justify-between text-xs text-[#71706b]">
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline">
                  Navigate with <kbd className="px-1.5 py-0.5 bg-white border border-[#d8d7d0] rounded text-[10px] font-mono shadow-2xs">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white border border-[#d8d7d0] rounded text-[10px] font-mono shadow-2xs">↓</kbd>
                </span>
                <span>
                  Press <kbd className="px-1.5 py-0.5 bg-white border border-[#d8d7d0] rounded text-[10px] font-mono shadow-2xs">Enter</kbd> to search
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push("/shop");
                }}
                className="font-bold text-[#8b0000] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Browse All Products</span> &rarr;
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
