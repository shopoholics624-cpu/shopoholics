"use client";

import { Product } from "@/types/product";
import { UnitSystem, formatDimension, convertMeasurement, isValidValue } from "@/lib/unit-converter";
import { SpecRow, SpecSectionHeader } from "../spec-row";
import { Package, ShieldCheck, CheckCircle2 } from "lucide-react";

import { DescriptionRenderer } from "../description-renderer";

interface SmartphoneTemplateProps {
  product: Product;
  unitSystem: UnitSystem;
}

export function SmartphoneTemplate({ product, unitSystem }: SmartphoneTemplateProps) {
  const sInfo = product.structuredInfo;
  const s = sInfo?.specs || {};

  const getLegacySpec = (name: string) => {
    const found = product.specs.find((item) => item.name.toLowerCase() === name.toLowerCase());
    return found ? found.value : null;
  };

  const overview = (product.description && product.description.trim()) || "";
  const shortDescription = (product.shortDescription || product.short_description || "").trim();

  const displaySize = s.displaySize || getLegacySpec("Display Size") || getLegacySpec("Display");
  const displayResolution = s.displayResolution || getLegacySpec("Resolution");
  const refreshRate = s.refreshRate || getLegacySpec("Refresh Rate");
  const processor = s.processor || getLegacySpec("Processor");
  const memory = s.memory || getLegacySpec("RAM");
  const storage = s.storage || getLegacySpec("Storage");
  const cameraMain = s.cameraMain || getLegacySpec("Main Camera") || getLegacySpec("Camera");
  const cameraFront = s.cameraFront || getLegacySpec("Front Camera");
  const batteryCapacity = s.batteryCapacity || getLegacySpec("Battery Capacity") || getLegacySpec("Battery");
  const chargingSpeed = s.chargingSpeed || getLegacySpec("Charging Speed");
  const os = s.os || getLegacySpec("Operating System") || getLegacySpec("OS");
  const connectivity = s.connectivity || getLegacySpec("Connectivity");
  const security = s.security || getLegacySpec("Security");
  const sensors = s.sensors || getLegacySpec("Sensors");

  // Dimensions & Weight
  const formattedDim = formatDimension(sInfo?.dimensions, unitSystem);
  const formattedWeight = sInfo?.weight
    ? convertMeasurement(sInfo.weight.value, sInfo.weight.unit, unitSystem).label
    : getLegacySpec("Weight");

  const specList = product.specs || [];
  const whatsInTheBox = sInfo?.whatsInTheBox;
  const warranty = sInfo?.warranty;

  return (
    <div className="space-y-10 text-[#261816]">
      {/* 1. PRODUCT OVERVIEW */}
      {isValidValue(overview) && (
        <section className="space-y-3">
          <h2 className="text-sm sm:text-base font-black text-[#8b0000] uppercase tracking-wider">
            PRODUCT OVERVIEW
          </h2>
          <DescriptionRenderer htmlContent={overview} />
        </section>
      )}

      {/* 2. KEY FEATURES (WooCommerce Short Description) */}
      {isValidValue(shortDescription) && (
        <section className="space-y-3">
          <h2 className="text-sm sm:text-base font-black text-[#8b0000] uppercase tracking-wider">
            KEY FEATURES
          </h2>
          <DescriptionRenderer htmlContent={shortDescription} />
        </section>
      )}

      {/* 3. TECHNICAL SPECIFICATIONS (All WooCommerce Attributes) */}
      {((specList && specList.length > 0) || formattedDim || formattedWeight) && (
        <section className="space-y-3">
          <h2 className="text-sm sm:text-base font-black text-[#8b0000] uppercase tracking-wider">
            TECHNICAL SPECIFICATIONS
          </h2>

          <div className="bg-white rounded-2xl border border-[#e3beb8]/60 shadow-xs overflow-hidden">
            <SpecSectionHeader title="Product Attributes & Specifications" />
            <div className="divide-y divide-[#e3beb8]/30">
              {specList.map((item, idx) => (
                <SpecRow key={idx} label={item.name} value={item.value} />
              ))}
              {formattedDim && <SpecRow label="Dimensions" value={formattedDim} />}
              {formattedWeight && <SpecRow label="Weight" value={formattedWeight} />}
            </div>
          </div>
        </section>
      )}

      {/* 4. WHAT'S IN THE BOX & WARRANTY */}
      {(isValidValue(whatsInTheBox) || isValidValue(warranty)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Box Contents */}
          {isValidValue(whatsInTheBox) && (
            <div className="p-4 rounded-2xl bg-[#faf8f8] border border-[#e3beb8]/50 space-y-2">
              <h3 className="text-xs font-bold text-[#8b0000] uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4" /> WHAT&apos;S IN THE BOX
              </h3>
              <ul className="space-y-1.5 pl-1">
                {whatsInTheBox!.map((item, idx) => (
                  <li key={idx} className="text-xs font-medium text-[#5a403c] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8b0000]" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warranty */}
          {isValidValue(warranty) && (
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
