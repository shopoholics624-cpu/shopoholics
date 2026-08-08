"use client";

import { Product } from "@/types/product";
import { UnitSystem, formatDimension, convertMeasurement, isValidValue } from "@/lib/unit-converter";
import { SpecRow, SpecSectionHeader } from "../spec-row";
import { Package, ShieldCheck, CheckCircle2 } from "lucide-react";

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

  const overview = sInfo?.overview || product.description;
  const keyFeatures = sInfo?.keyFeatures || product.features;

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

  const whatsInTheBox = sInfo?.whatsInTheBox || [
    `${product.title} Handset`,
    "USB-C Power & Data Cable",
    "SIM Ejector Pin",
    "Quick Start Guide & Documentation",
  ];

  const warranty = sInfo?.warranty || "2-Year Manufacturer Warranty + 24/7 Concierge Support";

  return (
    <div className="space-y-10 text-[#261816]">
      {/* 1. PRODUCT OVERVIEW */}
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

      {/* 2. KEY FEATURES */}
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

      {/* 3. TECHNICAL SPECIFICATIONS (Single Unified Card Container) */}
      <section className="space-y-3">
        <h2 className="text-sm sm:text-base font-black text-[#8b0000] uppercase tracking-wider">
          SPECIFICATIONS
        </h2>

        <div className="bg-white rounded-2xl border border-[#e3beb8]/60 shadow-xs overflow-hidden">
          {/* Display */}
          {(isValidValue(displaySize) || isValidValue(displayResolution) || isValidValue(refreshRate)) && (
            <div>
              <SpecSectionHeader title="Display" />
              <div>
                <SpecRow label="Display Size" value={displaySize} />
                <SpecRow label="Resolution" value={displayResolution} />
                <SpecRow label="Refresh Rate" value={refreshRate} />
              </div>
            </div>
          )}

          {/* Performance & Memory */}
          {(isValidValue(processor) || isValidValue(memory) || isValidValue(storage) || isValidValue(os)) && (
            <div>
              <SpecSectionHeader title="Performance & Storage" />
              <div>
                <SpecRow label="Processor / Chipset" value={processor} />
                <SpecRow label="RAM / Memory" value={memory} />
                <SpecRow label="Internal Storage" value={storage} />
                <SpecRow label="Operating System" value={os} />
              </div>
            </div>
          )}

          {/* Camera Array */}
          {(isValidValue(cameraMain) || isValidValue(cameraFront)) && (
            <div>
              <SpecSectionHeader title="Camera & Optics" />
              <div>
                <SpecRow label="Rear Camera System" value={cameraMain} />
                <SpecRow label="Front Camera" value={cameraFront} />
              </div>
            </div>
          )}

          {/* Battery & Charging */}
          {(isValidValue(batteryCapacity) || isValidValue(chargingSpeed)) && (
            <div>
              <SpecSectionHeader title="Battery & Power" />
              <div>
                <SpecRow label="Battery Capacity" value={batteryCapacity} />
                <SpecRow label="Charging Speed" value={chargingSpeed} />
              </div>
            </div>
          )}

          {/* Connectivity & Security */}
          {(isValidValue(connectivity) || isValidValue(security) || isValidValue(sensors)) && (
            <div>
              <SpecSectionHeader title="Connectivity & Security" />
              <div>
                <SpecRow label="Network & Wireless" value={connectivity} />
                <SpecRow label="Biometric Security" value={security} />
                <SpecRow label="Sensors" value={sensors} />
              </div>
            </div>
          )}

          {/* Dimensions & Weight */}
          {(isValidValue(formattedDim) || isValidValue(formattedWeight)) && (
            <div>
              <SpecSectionHeader title="Dimensions & Weight" />
              <div>
                <SpecRow label="Dimensions (L × W × H)" value={formattedDim} />
                <SpecRow label="Weight" value={formattedWeight} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. WHAT'S IN THE BOX & WARRANTY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Box Contents */}
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
    </div>
  );
}
