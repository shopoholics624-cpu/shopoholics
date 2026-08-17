"use client";

import { Product } from "@/types/product";
import { SmartphoneTemplate } from "./templates/smartphone-template";
import { LaptopTemplate } from "./templates/laptop-template";
import { HeadphoneTemplate } from "./templates/headphone-template";
import { SmartwatchTemplate } from "./templates/smartwatch-template";
import { CameraTemplate } from "./templates/camera-template";
import { TVTemplate } from "./templates/tv-template";
import { GenericTemplate } from "./templates/generic-template";
import { FileText } from "lucide-react";

interface ProductInformationProps {
  product: Product;
}

export function ProductInformation({ product }: ProductInformationProps) {
  const unitSystem = "metric";

  const hasDescription = Boolean(product.description && product.description.trim());
  const shortDesc = (product.shortDescription || product.short_description || "").trim();
  const hasShortDescription = Boolean(shortDesc);
  const hasSpecs = Boolean(
    (product.specs && product.specs.length > 0) ||
    product.structuredInfo?.dimensions ||
    product.structuredInfo?.weight
  );
  const hasBox = Boolean(
    product.structuredInfo?.whatsInTheBox && product.structuredInfo.whatsInTheBox.length > 0
  );
  const hasWarranty = Boolean(
    product.structuredInfo?.warranty && product.structuredInfo.warranty.trim()
  );

  const hasAnyContent = hasDescription || hasShortDescription || hasSpecs || hasBox || hasWarranty;

  if (!hasAnyContent) {
    return null;
  }

  // Determine category template
  const cat = (product.category || "").toLowerCase();

  const renderTemplate = () => {
    switch (cat) {
      case "smartphones":
        return <SmartphoneTemplate product={product} unitSystem={unitSystem} />;
      case "laptops":
      case "desktops":
        return <LaptopTemplate product={product} unitSystem={unitSystem} />;
      case "audio":
        return <HeadphoneTemplate product={product} unitSystem={unitSystem} />;
      case "wearables":
        return <SmartwatchTemplate product={product} unitSystem={unitSystem} />;
      case "cameras":
        return <CameraTemplate product={product} unitSystem={unitSystem} />;
      case "monitors":
      case "tv":
      case "tvs":
        return <TVTemplate product={product} unitSystem={unitSystem} />;
      default:
        return <GenericTemplate product={product} unitSystem={unitSystem} />;
    }
  };

  return (
    <section
      id="product-information"
      className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-[#e3beb8]/60 shadow-lux space-y-6 scroll-mt-24"
    >
      {/* Clean Header Row without Unit Toggle */}
      <div className="border-b border-[#e3beb8]/40 pb-4">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#261816] tracking-tight flex items-center gap-2.5">
          <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-[#8b0000]" /> Product Description & Specifications
        </h2>
      </div>

      {/* Rendered Category Template */}
      {renderTemplate()}
    </section>
  );
}
