"use client";

import { Product } from "@/types/product";
import { UnitSystem, formatDimension, convertMeasurement, isValidValue } from "@/lib/unit-converter";
import { SpecRow, SpecSectionHeader } from "../spec-row";
import { Package, ShieldCheck, CheckCircle2 } from "lucide-react";

import { DescriptionRenderer } from "../description-renderer";

interface LaptopTemplateProps {
  product: Product;
  unitSystem: UnitSystem;
}

export function LaptopTemplate({ product, unitSystem }: LaptopTemplateProps) {
  const sInfo = product.structuredInfo;
  const s = sInfo?.specs || {};

  const getLegacySpec = (name: string) => {
    const found = product.specs.find((item) => item.name.toLowerCase() === name.toLowerCase());
    return found ? found.value : null;
  };

  const overview = (product.description && product.description.trim()) || (sInfo?.overview && sInfo.overview.trim()) || "No product description available.";
  const keyFeatures = sInfo?.keyFeatures || product.features;

  const displaySize = s.displaySize || getLegacySpec("Display Size") || getLegacySpec("Display");
  const displayResolution = s.displayResolution || getLegacySpec("Resolution");
  const refreshRate = s.refreshRate || getLegacySpec("Refresh Rate");
  const processor = s.processor || getLegacySpec("Processor") || getLegacySpec("CPU");
  const graphics = s.graphics || getLegacySpec("Graphics") || getLegacySpec("GPU");
  const memory = s.memory || getLegacySpec("RAM") || getLegacySpec("Memory");
  const storage = s.storage || getLegacySpec("Storage") || getLegacySpec("SSD");
  const os = s.os || getLegacySpec("Operating System") || getLegacySpec("OS");
  const keyboardTrackpad = s.keyboardTrackpad || getLegacySpec("Keyboard");
  const ports = s.ports || getLegacySpec("Ports");
  const wireless = s.wireless || getLegacySpec("Wireless") || getLegacySpec("Connectivity");
  const batteryCapacity = s.batteryCapacity || getLegacySpec("Battery") || getLegacySpec("Battery Life");
  const audio = s.audio || getLegacySpec("Audio") || getLegacySpec("Speakers");
  const webcam = s.webcam || getLegacySpec("Webcam") || getLegacySpec("Camera");

  // Dimensions & Weight
  const formattedDim = formatDimension(sInfo?.dimensions, unitSystem);
  const formattedWeight = sInfo?.weight
    ? convertMeasurement(sInfo.weight.value, sInfo.weight.unit, unitSystem).label
    : getLegacySpec("Weight");

  const whatsInTheBox = sInfo?.whatsInTheBox || [
    `${product.title} Laptop`,
    "High-Wattage Power Adapter & Charging Cable",
    "Quick Setup Guide",
    "Safety & Warranty Documentation",
  ];

  const warranty = sInfo?.warranty || "2-Year On-Site Manufacturer Warranty + Accidental Protection";

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
          {/* Display */}
          {(isValidValue(displaySize) || isValidValue(displayResolution) || isValidValue(refreshRate)) && (
            <div>
              <SpecSectionHeader title="Display" />
              <div>
                <SpecRow label="Screen Size" value={displaySize} />
                <SpecRow label="Resolution" value={displayResolution} />
                <SpecRow label="Refresh Rate" value={refreshRate} />
              </div>
            </div>
          )}

          {/* Processor & Graphics */}
          {(isValidValue(processor) || isValidValue(graphics)) && (
            <div>
              <SpecSectionHeader title="Processor & Graphics" />
              <div>
                <SpecRow label="Processor (CPU)" value={processor} />
                <SpecRow label="Graphics Card (GPU)" value={graphics} />
              </div>
            </div>
          )}

          {/* Memory & Storage */}
          {(isValidValue(memory) || isValidValue(storage) || isValidValue(os)) && (
            <div>
              <SpecSectionHeader title="Memory & Storage" />
              <div>
                <SpecRow label="RAM / Memory" value={memory} />
                <SpecRow label="SSD Storage" value={storage} />
                <SpecRow label="Operating System" value={os} />
              </div>
            </div>
          )}

          {/* Keyboard, Audio & Webcam */}
          {(isValidValue(keyboardTrackpad) || isValidValue(audio) || isValidValue(webcam)) && (
            <div>
              <SpecSectionHeader title="Input, Audio & Camera" />
              <div>
                <SpecRow label="Keyboard & Trackpad" value={keyboardTrackpad} />
                <SpecRow label="Acoustic Speakers" value={audio} />
                <SpecRow label="Webcam" value={webcam} />
              </div>
            </div>
          )}

          {/* Ports & Connectivity */}
          {(isValidValue(ports) || isValidValue(wireless)) && (
            <div>
              <SpecSectionHeader title="Ports & Wireless Connectivity" />
              <div>
                <SpecRow label="I/O Ports" value={ports} />
                <SpecRow label="Wireless Standards" value={wireless} />
              </div>
            </div>
          )}

          {/* Battery & Power */}
          {isValidValue(batteryCapacity) && (
            <div>
              <SpecSectionHeader title="Battery & Power" />
              <div>
                <SpecRow label="Battery Endurance" value={batteryCapacity} />
              </div>
            </div>
          )}

          {/* Dimensions & Weight */}
          {(isValidValue(formattedDim) || isValidValue(formattedWeight)) && (
            <div>
              <SpecSectionHeader title="Dimensions & Weight" />
              <div>
                <SpecRow label="Chassis Dimensions" value={formattedDim} />
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
