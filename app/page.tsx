import { HeroShowcase } from "@/components/home/hero-showcase";
import { OurProductsSlider } from "@/components/home/our-products-slider";
import { BrandsShowcase } from "@/components/home/brands-showcase";
import { BentoShowcase } from "@/components/home/bento-showcase";
import { PromoDealsShowcase } from "@/components/home/promo-deals-showcase";
import { ProductGrid } from "@/components/common/product-grid";
import { PRODUCTS } from "@/constants/products";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-4 sm:space-y-6 pb-12 bg-white">
      {/* 1. Hero Section */}
      <HeroShowcase />

      {/* 2. Our Products */}
      <OurProductsSlider />

      {/* 3. Shop By Brand */}
      <BrandsShowcase />

      {/* 4. Best Sellers & Trending Deals */}
      <BentoShowcase />

      {/* 5. Promotional Offers & Bank Deals */}
      <PromoDealsShowcase />

      {/* 6. Flagship Devices & Audio */}
      <section className="py-10 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#D4D3CD]/60 pb-5">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1C1C1A] tracking-tight">
                Flagship Devices & Audio
              </h2>
              <p className="text-sm sm:text-base text-[#5A5954] mt-1.5 font-medium">
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
