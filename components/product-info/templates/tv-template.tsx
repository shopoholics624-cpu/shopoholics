"use client";

import { Product } from "@/types/product";
import { UnitSystem, formatDimension, convertMeasurement, isValidValue } from "@/lib/unit-converter";
import { SpecRow, SpecSectionHeader } from "../spec-row";
import { Package, ShieldCheck, CheckCircle2 } from "lucide-react";

import { DescriptionRenderer } from "../description-renderer";

interface TVTemplateProps {
  product: Product;
  unitSystem: UnitSystem;
}

export function TVTemplate({ product, unitSystem }: TVTemplateProps) {
  const sInfo = product.structuredInfo;
  const s = sInfo?.specs || {};

  const getLegacySpec = (name: string) => {
    const found = product.specs.find((item) => item.name.toLowerCase() === name.toLowerCase());
    return found ? found.value : null;
  };

  const overview = (product.description && product.description.trim()) || (sInfo?.overview && sInfo.overview.trim()) || "No product description available.";
  const keyFeatures = sInfo?.keyFeatures || product.features;

  const displaySize = s.displaySize || getLegacySpec("Screen Size") || getLegacySpec("Display");
  const displayResolution = s.displayResolution || getLegacySpec("Resolution");
  const refreshRate = s.refreshRate || getLegacySpec("Refresh Rate");
  const hdrSupport = s.hdrSupport || getLegacySpec("HDR Format") || getLegacySpec("HDR");
  const pictureTechnology = s.pictureTechnology || getLegacySpec("Panel Technology") || getLegacySpec("Display Tech");
  const smartTvPlatform = s.smartTvPlatform || getLegacySpec("Smart Platform") || getLegacySpec("OS");
  const ports = s.ports || getLegacySpec("HDMI / USB Ports") || getLegacySpec("Inputs");
  const wireless = s.wireless || getLegacySpec("Wi-Fi / Bluetooth") || getLegacySpec("Connectivity");
  const audio = s.audio || getLegacySpec("Sound System") || getLegacySpec("Audio");
  const powerConsumption = s.powerConsumption || getLegacySpec("Power Consumption");

  // Dimensions & Weight
  const formattedDim = formatDimension(sInfo?.dimensions, unitSystem);
  const formattedWeight = sInfo?.weight
    ? convertMeasurement(sInfo.weight.value, sInfo.weight.unit, unitSystem).label
    : getLegacySpec("Weight");

  const whatsInTheBox = sInfo?.whatsInTheBox || [
    `${product.title}`,
    "Voice Remote Control & Batteries",
    "Tabletop Stand & Hardware",
    "Power Cord & Cable Management Clips",
  ];

  const warranty = sInfo?.warranty || "2-Year Manufacturer In-Home Warranty";

  return (
    <div className="space-y-10 text-[#261816]">
      {/* OVERVIEW */}
      {isValidValue(overview) && (
        <section className="space-y-3">
          <h2 className="text-sm sm:text-base font-black text-[#8b0000] uppercase tracking-wider">
            PRODUCT OVERVIEW
          </h2>
          <DescriptionRenderer htmlContent={overview} />
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
          {/* Display & Picture Tech */}
          {(isValidValue(displaySize) || isValidValue(displayResolution) || isValidValue(refreshRate) || isValidValue(hdrSupport)) && (
            <div>
              <SpecSectionHeader title="Display & Picture Technology" />
              <div>
                <SpecRow label="Screen Size Class" value={displaySize} />
                <SpecRow label="Native Resolution" value={displayResolution} />
                <SpecRow label="Refresh Rate" value={refreshRate} />
                <SpecRow label="HDR Standards (Dolby Vision/HDR10+)" value={hdrSupport} />
                <SpecRow label="Panel Engine & Technology" value={pictureTechnology} />
              </div>
            </div>
          )}

          {/* Smart Platform & Audio */}
          {(isValidValue(smartTvPlatform) || isValidValue(audio)) && (
            <div>
              <SpecSectionHeader title="Smart Platform & Audio Output" />
              <div>
                <SpecRow label="Smart TV Operating System" value={smartTvPlatform} />
                <SpecRow label="Sound Output & Speakers" value={audio} />
              </div>
            </div>
          )}

          {/* Ports, Wireless & Power */}
          {(isValidValue(ports) || isValidValue(wireless) || isValidValue(powerConsumption)) && (
            <div>
              <SpecSectionHeader title="Connectivity & Energy" />
              <div>
                <SpecRow label="HDMI / USB Ports" value={ports} />
                <SpecRow label="Wireless & Network" value={wireless} />
                <SpecRow label="Power Consumption" value={powerConsumption} />
              </div>
            </div>
          )}

          {/* Dimensions & Weight */}
          {(isValidValue(formattedDim) || isValidValue(formattedWeight)) && (
            <div>
              <SpecSectionHeader title="Dimensions & Weight" />
              <div>
                <SpecRow label="Dimensions (with Stand)" value={formattedDim} />
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
