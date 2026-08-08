"use client";

import { Product } from "@/types/product";
import { UnitSystem, formatDimension, convertMeasurement, isValidValue } from "@/lib/unit-converter";
import { SpecRow, SpecSectionHeader } from "../spec-row";
import { Package, ShieldCheck, CheckCircle2 } from "lucide-react";

interface SmartwatchTemplateProps {
  product: Product;
  unitSystem: UnitSystem;
}

export function SmartwatchTemplate({ product, unitSystem }: SmartwatchTemplateProps) {
  const sInfo = product.structuredInfo;
  const s = sInfo?.specs || {};

  const getLegacySpec = (name: string) => {
    const found = product.specs.find((item) => item.name.toLowerCase() === name.toLowerCase());
    return found ? found.value : null;
  };

  const overview = sInfo?.overview || product.description;
  const keyFeatures = sInfo?.keyFeatures || product.features;

  const displaySize = s.displaySize || getLegacySpec("Display Size") || getLegacySpec("Display");
  const processor = s.processor || getLegacySpec("Processor");
  const storage = s.storage || getLegacySpec("Storage");
  const healthFeatures = s.healthFeatures || getLegacySpec("Health Features") || getLegacySpec("Health");
  const fitnessTracking = s.fitnessTracking || getLegacySpec("Fitness Tracking") || getLegacySpec("Sports");
  const sensors = s.sensors || getLegacySpec("Sensors");
  const connectivity = s.connectivity || getLegacySpec("Connectivity") || getLegacySpec("GPS");
  const batteryLife = s.batteryLife || getLegacySpec("Battery Life") || getLegacySpec("Battery");
  const waterResistance = s.waterResistance || getLegacySpec("Water Resistance") || getLegacySpec("IP Rating");
  const compatibility = s.compatibility || getLegacySpec("Compatibility") || getLegacySpec("OS Support");

  // Dimensions & Weight
  const formattedDim = formatDimension(sInfo?.dimensions, unitSystem);
  const formattedWeight = sInfo?.weight
    ? convertMeasurement(sInfo.weight.value, sInfo.weight.unit, unitSystem).label
    : getLegacySpec("Weight");

  const whatsInTheBox = sInfo?.whatsInTheBox || [
    `${product.title}`,
    "Sport Band / Strap",
    "Magnetic Fast Charging Cable",
    "User Manual",
  ];

  const warranty = sInfo?.warranty || "2-Year Official Smartwatch Manufacturer Warranty";

  return (
    <div className="space-y-10 text-[#261816]">
      {/* OVERVIEW */}
      {isValidValue(overview) && (
        <section className="space-y-3">
          <h2 className="text-sm sm:text-base font-black text-[#8b0000] uppercase tracking-wider">
            PRODUCT OVERVIEW
          </h2>
          <p className="text-xs sm:text-sm text-[#5a403c] leading-relaxed bg-[#faf8f8] p-4 rounded-2xl border border-[#e3beb8]/40">
            {overview}
          </p>
        </section>
      )}

      {/* KEY FEATURES */}
      {isValidValue(keyFeatures) && (
        <section className="space-y-3">
          <h2 className="text-sm sm:text-base font-black text-[#8b0000] uppercase tracking-wider">
            KEY FEATURES
          </h2>
          <div className="p-4 rounded-2xl bg-white border border-[#e3beb8]/60 shadow-xs space-y-2.5">
            {keyFeatures.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#8b0000] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-semibold text-[#261816] leading-snug">{feat}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SPECIFICATIONS (Single Unified Card Container) */}
      <section className="space-y-3">
        <h2 className="text-sm sm:text-base font-black text-[#8b0000] uppercase tracking-wider">
          SPECIFICATIONS
        </h2>

        <div className="bg-white rounded-2xl border border-[#e3beb8]/60 shadow-xs overflow-hidden">
          {/* Display & Build */}
          {isValidValue(displaySize) && (
            <div>
              <SpecSectionHeader title="Display & Screen" />
              <div>
                <SpecRow label="Display Technology & Size" value={displaySize} />
              </div>
            </div>
          )}

          {/* Health & Fitness */}
          {(isValidValue(healthFeatures) || isValidValue(fitnessTracking) || isValidValue(sensors)) && (
            <div>
              <SpecSectionHeader title="Health Metrics & Tracking" />
              <div>
                <SpecRow label="Biometric Health Metrics" value={healthFeatures} />
                <SpecRow label="Sports & Fitness Modes" value={fitnessTracking} />
                <SpecRow label="Integrated Sensors" value={sensors} />
              </div>
            </div>
          )}

          {/* Processor, Storage & Battery */}
          {(isValidValue(processor) || isValidValue(storage) || isValidValue(batteryLife)) && (
            <div>
              <SpecSectionHeader title="Hardware & Battery" />
              <div>
                <SpecRow label="Processor / Chipset" value={processor} />
                <SpecRow label="Internal Memory & Storage" value={storage} />
                <SpecRow label="Battery Endurance" value={batteryLife} />
              </div>
            </div>
          )}

          {/* Connectivity, IP Rating & Compatibility */}
          {(isValidValue(connectivity) || isValidValue(waterResistance) || isValidValue(compatibility)) && (
            <div>
              <SpecSectionHeader title="Connectivity & Resistance" />
              <div>
                <SpecRow label="Wireless & GPS" value={connectivity} />
                <SpecRow label="Water Resistance Rating" value={waterResistance} />
                <SpecRow label="Smartphone Compatibility" value={compatibility} />
              </div>
            </div>
          )}

          {/* Dimensions & Weight */}
          {(isValidValue(formattedDim) || isValidValue(formattedWeight)) && (
            <div>
              <SpecSectionHeader title="Dimensions & Weight" />
              <div>
                <SpecRow label="Case Dimensions" value={formattedDim} />
                <SpecRow label="Weight" value={formattedWeight} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* BOX & WARRANTY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {isValidValue(whatsInTheBox) && (
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

        {isValidValue(warranty) && (
          <div className="p-4 rounded-2xl bg-[#faf8f8] border border-[#e3beb8]/50 space-y-2">
            <h3 className="text-xs font-bold text-[#8b0000] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> WARRANTY & COVERAGE
            </h3>
            <p className="text-xs font-medium text-[#5a403c] leading-relaxed">{warranty}</p>
          </div>
        )}
      </div>
    </div>
  );
}
