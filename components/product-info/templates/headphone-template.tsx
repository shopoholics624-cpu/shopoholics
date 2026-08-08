"use client";

import { Product } from "@/types/product";
import { UnitSystem, formatDimension, convertMeasurement, isValidValue } from "@/lib/unit-converter";
import { SpecRow, SpecSectionHeader } from "../spec-row";
import { Package, ShieldCheck, CheckCircle2 } from "lucide-react";

interface HeadphoneTemplateProps {
  product: Product;
  unitSystem: UnitSystem;
}

export function HeadphoneTemplate({ product, unitSystem }: HeadphoneTemplateProps) {
  const sInfo = product.structuredInfo;
  const s = sInfo?.specs || {};

  const getLegacySpec = (name: string) => {
    const found = product.specs.find((item) => item.name.toLowerCase() === name.toLowerCase());
    return found ? found.value : null;
  };

  const overview = sInfo?.overview || product.description;
  const keyFeatures = sInfo?.keyFeatures || product.features;

  const driverSize = s.driverSize || getLegacySpec("Driver Size") || getLegacySpec("Drivers");
  const soundProfile = s.soundProfile || getLegacySpec("Sound Profile") || getLegacySpec("Audio");
  const noiseCancellation = s.noiseCancellation || getLegacySpec("Noise Cancellation") || getLegacySpec("ANC");
  const microphones = s.microphones || getLegacySpec("Microphones") || getLegacySpec("Mic");
  const bluetoothVersion = s.bluetoothVersion || getLegacySpec("Bluetooth Version") || getLegacySpec("Connectivity");
  const batteryLife = s.batteryLife || getLegacySpec("Battery Life") || getLegacySpec("Battery");
  const chargingSpeed = s.chargingSpeed || getLegacySpec("Charging");
  const controls = s.controls || getLegacySpec("Controls");
  const waterResistance = s.waterResistance || getLegacySpec("Water Resistance") || getLegacySpec("IP Rating");
  const compatibility = s.compatibility || getLegacySpec("Compatibility");

  // Dimensions & Weight
  const formattedDim = formatDimension(sInfo?.dimensions, unitSystem);
  const formattedWeight = sInfo?.weight
    ? convertMeasurement(sInfo.weight.value, sInfo.weight.unit, unitSystem).label
    : getLegacySpec("Weight");

  const whatsInTheBox = sInfo?.whatsInTheBox || [
    `${product.title}`,
    "Smart Charging Case",
    "Silicone Ear Tips (S, M, L)",
    "USB-C Braided Charging Cable",
    "User Manual",
  ];

  const warranty = sInfo?.warranty || "2-Year Official Audio Manufacturer Warranty";

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
          {/* Sound & Driver */}
          {(isValidValue(driverSize) || isValidValue(soundProfile)) && (
            <div>
              <SpecSectionHeader title="Acoustic Driver & Sound" />
              <div>
                <SpecRow label="Acoustic Driver Size" value={driverSize} />
                <SpecRow label="Sound Signature & Profile" value={soundProfile} />
              </div>
            </div>
          )}

          {/* Noise Cancellation & Mics */}
          {(isValidValue(noiseCancellation) || isValidValue(microphones)) && (
            <div>
              <SpecSectionHeader title="Active Noise Cancellation & Mics" />
              <div>
                <SpecRow label="Noise Cancellation (ANC)" value={noiseCancellation} />
                <SpecRow label="Voice Microphones" value={microphones} />
              </div>
            </div>
          )}

          {/* Connectivity & Battery */}
          {(isValidValue(bluetoothVersion) || isValidValue(batteryLife) || isValidValue(chargingSpeed)) && (
            <div>
              <SpecSectionHeader title="Connectivity & Power" />
              <div>
                <SpecRow label="Bluetooth / Wireless" value={bluetoothVersion} />
                <SpecRow label="Total Battery Life" value={batteryLife} />
                <SpecRow label="Fast Charging Speed" value={chargingSpeed} />
              </div>
            </div>
          )}

          {/* Controls, IP Rating & Compatibility */}
          {(isValidValue(controls) || isValidValue(waterResistance) || isValidValue(compatibility)) && (
            <div>
              <SpecSectionHeader title="Controls & Water Resistance" />
              <div>
                <SpecRow label="Touch & Button Controls" value={controls} />
                <SpecRow label="Water / Sweat Resistance" value={waterResistance} />
                <SpecRow label="Device Compatibility" value={compatibility} />
              </div>
            </div>
          )}

          {/* Dimensions & Weight */}
          {(isValidValue(formattedDim) || isValidValue(formattedWeight)) && (
            <div>
              <SpecSectionHeader title="Dimensions & Weight" />
              <div>
                <SpecRow label="Earpiece Dimensions" value={formattedDim} />
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
