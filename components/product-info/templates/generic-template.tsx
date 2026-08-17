"use client";

import { Product } from "@/types/product";
import { UnitSystem, formatDimension, convertMeasurement, isValidValue } from "@/lib/unit-converter";
import { SpecRow, SpecSectionHeader } from "../spec-row";
import { Package, ShieldCheck, CheckCircle2 } from "lucide-react";

import { DescriptionRenderer } from "../description-renderer";

interface GenericTemplateProps {
  product: Product;
  unitSystem: UnitSystem;
}

export function GenericTemplate({ product, unitSystem }: GenericTemplateProps) {
  const sInfo = product.structuredInfo;
  const s = sInfo?.specs || {};

  const overview = (product.description && product.description.trim()) || "";
  const shortDescription = (product.shortDescription || product.short_description || "").trim();

  // Dimensions & Weight
  const formattedDim = formatDimension(sInfo?.dimensions, unitSystem);
  const formattedWeight = sInfo?.weight
    ? convertMeasurement(sInfo.weight.value, sInfo.weight.unit, unitSystem).label
    : product.specs.find((i) => i.name.toLowerCase() === "weight")?.value;

  const whatsInTheBox = sInfo?.whatsInTheBox;
  const warranty = sInfo?.warranty;

  const specList = product.specs || [];

  return (
    <div className="space-y-10 text-[#261816]">
      {/* OVERVIEW (WooCommerce Description) */}
      {isValidValue(overview) && (
        <section className="space-y-3">
          <h2 className="text-sm sm:text-base font-black text-[#8b0000] uppercase tracking-wider">
            PRODUCT OVERVIEW
          </h2>
          <DescriptionRenderer htmlContent={overview} />
        </section>
      )}

      {/* KEY FEATURES (WooCommerce Short Description) */}
      {isValidValue(shortDescription) && (
        <section className="space-y-3">
          <h2 className="text-sm sm:text-base font-black text-[#8b0000] uppercase tracking-wider">
            KEY FEATURES
          </h2>
          <DescriptionRenderer htmlContent={shortDescription} />
        </section>
      )}

      {/* SPECIFICATIONS (Single Unified Card Container) */}
      {specList.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm sm:text-base font-black text-[#8b0000] uppercase tracking-wider">
            SPECIFICATIONS
          </h2>

          <div className="bg-white rounded-2xl border border-[#e3beb8]/60 shadow-xs overflow-hidden">
            <SpecSectionHeader title="Technical Attributes" />
            <div>
              {specList.map((item, idx) => (
                <SpecRow key={idx} label={item.name} value={item.value} />
              ))}
              {formattedDim && <SpecRow label="Dimensions" value={formattedDim} />}
              {formattedWeight && <SpecRow label="Weight" value={formattedWeight} />}
            </div>
          </div>
        </section>
      )}

      {/* BOX & WARRANTY */}
      {((whatsInTheBox && whatsInTheBox.length > 0) || (warranty && warranty.trim())) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {whatsInTheBox && whatsInTheBox.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#faf8f8] border border-[#e3beb8]/50 space-y-2">
              <h3 className="text-xs font-bold text-[#8b0000] uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4" /> WHAT&apos;S IN THE BOX
              </h3>
              <ul className="space-y-1.5 pl-1">
                {whatsInTheBox.map((item, idx) => (
                  <li key={idx} className="text-xs font-medium text-[#5a403c] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8b0000]" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {warranty && warranty.trim() && (
            <div className="p-4 rounded-2xl bg-[#faf8f8] border border-[#e3beb8]/50 space-y-2">
              <h3 className="text-xs font-bold text-[#8b0000] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> WARRANTY & COVERAGE
              </h3>
              <p className="text-xs font-medium text-[#5a403c] leading-relaxed">{warranty}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
