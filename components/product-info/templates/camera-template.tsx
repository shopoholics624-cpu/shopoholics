"use client";

import { Product } from "@/types/product";
import { UnitSystem, formatDimension, convertMeasurement, isValidValue } from "@/lib/unit-converter";
import { SpecRow, SpecSectionHeader } from "../spec-row";
import { Package, ShieldCheck, CheckCircle2 } from "lucide-react";
import { DescriptionRenderer } from "../description-renderer";

interface CameraTemplateProps {
  product: Product;
  unitSystem: UnitSystem;
}

export function CameraTemplate({ product, unitSystem }: CameraTemplateProps) {
  const sInfo = product.structuredInfo;
  const s = sInfo?.specs || {};

  const getLegacySpec = (name: string) => {
    const found = product.specs.find((item) => item.name.toLowerCase() === name.toLowerCase());
    return found ? found.value : null;
  };

  const overview = (product.description && product.description.trim()) || (sInfo?.overview && sInfo.overview.trim()) || "No product description available.";
  const keyFeatures = sInfo?.keyFeatures || product.features;

  const sensorType = s.sensorType || getLegacySpec("Sensor Type") || getLegacySpec("Sensor");
  const displayResolution = s.displayResolution || getLegacySpec("Resolution") || getLegacySpec("Megapixels");
  const processor = s.processor || getLegacySpec("Image Processor") || getLegacySpec("Processor");
  const lensMount = s.lensMount || getLegacySpec("Lens Mount") || getLegacySpec("Mount");
  const isoRange = s.isoRange || getLegacySpec("ISO Sensitivity") || getLegacySpec("ISO");
  const shutterSpeed = s.shutterSpeed || getLegacySpec("Shutter Speed");
  const videoRecording = s.videoRecording || getLegacySpec("Video Recording") || getLegacySpec("Video");
  const autofocus = s.autofocus || getLegacySpec("Autofocus System") || getLegacySpec("AF");
  const viewfinder = s.viewfinder || getLegacySpec("Viewfinder") || getLegacySpec("EVF");
  const displaySize = s.displaySize || getLegacySpec("LCD Monitor") || getLegacySpec("Display");
  const connectivity = s.connectivity || getLegacySpec("Connectivity") || getLegacySpec("Wi-Fi / Bluetooth");
  const storage = s.storage || getLegacySpec("Storage") || getLegacySpec("Card Slot");
  const batteryLife = s.batteryLife || getLegacySpec("Battery") || getLegacySpec("Battery Life");

  // Dimensions & Weight
  const formattedDim = formatDimension(sInfo?.dimensions, unitSystem);
  const formattedWeight = sInfo?.weight
    ? convertMeasurement(sInfo.weight.value, sInfo.weight.unit, unitSystem).label
    : getLegacySpec("Weight");

  const whatsInTheBox = sInfo?.whatsInTheBox || [
    `${product.title} Body`,
    "Rechargeable Lithium-Ion Battery Pack",
    "Battery Charger & AC Adapter",
    "Shoulder Strap & Body Cap",
  ];

  const warranty = sInfo?.warranty || "2-Year Official Camera Warranty + Concierge Support";

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
          {/* Sensor & Optics */}
          {(isValidValue(sensorType) || isValidValue(displayResolution) || isValidValue(lensMount)) && (
            <div>
              <SpecSectionHeader title="Sensor & Lens Optics" />
              <div>
                <SpecRow label="Image Sensor Type" value={sensorType} />
                <SpecRow label="Effective Resolution" value={displayResolution} />
                <SpecRow label="Lens Mount Compatibility" value={lensMount} />
              </div>
            </div>
          )}

          {/* Exposure, ISO & Autofocus */}
          {(isValidValue(isoRange) || isValidValue(shutterSpeed) || isValidValue(autofocus)) && (
            <div>
              <SpecSectionHeader title="Exposure, ISO & Autofocus" />
              <div>
                <SpecRow label="ISO Sensitivity Range" value={isoRange} />
                <SpecRow label="Shutter Speed" value={shutterSpeed} />
                <SpecRow label="Autofocus (AF) System" value={autofocus} />
              </div>
            </div>
          )}

          {/* Video Recording & Viewfinder */}
          {(isValidValue(videoRecording) || isValidValue(viewfinder)) && (
            <div>
              <SpecSectionHeader title="Video Recording & Monitor" />
              <div>
                <SpecRow label="Video Resolution & FPS" value={videoRecording} />
                <SpecRow label="Display Screen / Viewfinder" value={viewfinder} />
              </div>
            </div>
          )}

          {/* Connectivity, Storage & Power */}
          {(isValidValue(connectivity) || isValidValue(storage) || isValidValue(batteryLife)) && (
            <div>
              <SpecSectionHeader title="Connectivity, Media & Battery" />
              <div>
                <SpecRow label="Wireless Transfer" value={connectivity} />
                <SpecRow label="Memory Card Compatibility" value={storage} />
                <SpecRow label="Battery Performance" value={batteryLife} />
              </div>
            </div>
          )}

          {/* Dimensions & Weight */}
          {(isValidValue(formattedDim) || isValidValue(formattedWeight)) && (
            <div>
              <SpecSectionHeader title="Dimensions & Weight" />
              <div>
                <SpecRow label="Camera Body Dimensions" value={formattedDim} />
                <SpecRow label="Weight (Body Only)" value={formattedWeight} />
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
