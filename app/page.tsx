import { HeroShowcase } from "@/components/home/hero-showcase";
import { HorizontalShowcase } from "@/components/home/horizontal-showcase";
import { CategoryPills } from "@/components/home/category-pills";
import { ProductGrid } from "@/components/common/product-grid";
import { PRODUCTS } from "@/constants/products";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-12 pb-12">
      {/* Hero Showcase */}
      <HeroShowcase />

      {/* Brand New Apple-Style Horizontal Scroll Showcase */}
      <HorizontalShowcase />

      {/* Category Pills Navigation */}
      <CategoryPills />

      {/* Spotlight Hardware Showcase Grid */}
      <section className="py-12 bg-[#fff8f6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8b0000] uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#e51c10]" /> Curated Hardware Selection
              </span>
              <h2 className="text-3xl font-extrabold text-[#261816]">
                Flagship Devices & Audio
              </h2>
              <p className="text-sm text-[#5a403c] mt-1">
                Every device features grade 5 titanium construction and custom acoustic engineering.
              </p>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#8b0000] hover:text-[#bc0000] transition-colors min-h-[44px] flex items-center"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Product Grid */}
          <ProductGrid products={PRODUCTS} />
        </div>
      </section>
    </div>
  );
}
