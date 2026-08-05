import { HeroShowcase } from "@/components/home/hero-showcase";
import { OurProductsSlider } from "@/components/home/our-products-slider";
import { LifestyleShowcase } from "@/components/home/lifestyle-showcase";
import { PromoDealsShowcase } from "@/components/home/promo-deals-showcase";
import { BentoShowcase } from "@/components/home/bento-showcase";
import { BrandsShowcase } from "@/components/home/brands-showcase";
import { BudgetShowcase } from "@/components/home/budget-showcase";
import { ProductGrid } from "@/components/common/product-grid";
import { PRODUCTS } from "@/constants/products";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-4 sm:space-y-6 pb-12 bg-white">
      {/* Coveritup Style Hero Showcase with Banner Slider */}
      <HeroShowcase />

      {/* Coveritup Style "Our Products" Horizontal Scroll Slider */}
      <OurProductsSlider />

      {/* Shop By Category Section */}
      <LifestyleShowcase />

      {/* Special Promotional Deals & Bank Offers */}
      <PromoDealsShowcase />

      {/* E-commerce Bento Grid Showcase (Featured Products, Deals & Best Sellers) */}
      <BentoShowcase />

      {/* Shop By Brand Showcase */}
      <BrandsShowcase />

      {/* Shop By Budget Showcase */}
      <BudgetShowcase />

      {/* Spotlight Hardware Showcase Grid */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#e3beb8]/40 pb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8b0000] uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#e51c10]" /> Curated Hardware Selection
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#261816] tracking-tight">
                Flagship Devices & Audio
              </h2>
              <p className="text-xs sm:text-sm text-[#5a403c] mt-0.5">
                Every device features grade 5 titanium construction and custom acoustic engineering.
              </p>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#8b0000] hover:text-[#bc0000] transition-colors min-h-[40px] flex items-center"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Product Grid (2x2 on Mobile Responsive) */}
          <ProductGrid products={PRODUCTS} />
        </div>
      </section>
    </div>
  );
}
