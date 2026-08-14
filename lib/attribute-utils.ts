/**
 * Centralized WooCommerce Attribute & Colour Normalization Utilities for Shop-O-Holics
 */

import { ProductVariant } from "@/types/product";

/**
 * Detects if an attribute name or slug represents a colour/color-related attribute.
 * e.g. "Colour", "Color", "pa_colour", "pa_color", "attribute_pa_colour", "attribute_pa_color", "finish", "shade", "hue"
 */
export function isColourAttribute(rawName: string): boolean {
  if (!rawName || typeof rawName !== "string") return false;
  const clean = rawName.replace(/^attribute_/, "").replace(/^pa_/, "").trim().toLowerCase();
  return (
    clean === "color" ||
    clean === "colour" ||
    clean.includes("color") ||
    clean.includes("colour") ||
    clean.includes("finish") ||
    clean.includes("shade") ||
    clean.includes("hue")
  );
}

/**
 * Canonicalizes raw attribute names/slugs into human-readable labels.
 * e.g. "pa_color" -> "Colour", "attribute_pa_storage" -> "Storage", "pa_ram" -> "RAM"
 */
export function formatVariationAttributeLabel(rawName: string, value?: string): string {
  if (!rawName || typeof rawName !== "string") return "Option";
  const clean = rawName.replace(/^attribute_/, "").replace(/^pa_/, "").trim();
  const lower = clean.toLowerCase();

  if (isColourAttribute(clean)) {
    return "Colour";
  }
  if (lower.includes("storage") || lower.includes("capacity")) {
    return "Storage";
  }
  if (lower.includes("ram") || lower.includes("memory")) {
    return "RAM";
  }
  if (lower.includes("size")) {
    return value && /^\d+(gb|tb|mb)$/i.test(value.trim()) ? "Storage" : "Size";
  }
  if (lower.includes("material")) {
    return "Material";
  }
  if (lower.includes("edition") || lower.includes("model")) {
    return "Edition";
  }

  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/**
 * Formats raw WooCommerce attribute option values or slugs into human-readable strings.
 * e.g. "deep-blue" -> "Deep Blue", "1tb" -> "1TB", "256gb" -> "256GB", "space-black" -> "Space Black"
 */
export function formatAttributeValue(val: string): string {
  if (!val || typeof val !== "string") return "";
  const trimmed = val.trim();

  // Storage / Capacity format: 256gb -> 256GB, 1tb -> 1TB
  if (/^\d+(gb|tb|mb)$/i.test(trimmed)) {
    const num = trimmed.match(/\d+/)?.[0] || "";
    const unit = trimmed.match(/[a-zA-Z]+/)?.[0]?.toUpperCase() || "";
    return `${num}${unit}`;
  }

  // Slug conversion: deep-blue -> Deep Blue, space-black -> Space Black, cosmic-orange -> Cosmic Orange
  return trimmed
    .split(/[-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Normalizes raw/selected attributes into canonical display entries.
 * Returns an array of clean { label, value, key } objects.
 */
export function getFormattedItemAttributes(
  selectedAttributes?: Record<string, string>,
  selectedVariant?: ProductVariant
): { label: string; value: string; rawKey: string }[] {
  const result: { label: string; value: string; rawKey: string }[] = [];
  const seenLabels = new Set<string>();

  // 1. Process explicit selectedAttributes map if available
  if (selectedAttributes && Object.keys(selectedAttributes).length > 0) {
    Object.entries(selectedAttributes).forEach(([key, val]) => {
      if (!val || typeof val !== "string" || !val.trim()) return;

      const label = formatVariationAttributeLabel(key, val);
      const lowerLabel = label.toLowerCase();

      if (!seenLabels.has(lowerLabel)) {
        const formattedVal = formatAttributeValue(val);
        if (formattedVal) {
          seenLabels.add(lowerLabel);
          result.push({ label, value: formattedVal, rawKey: key });
        }
      }
    });
  }

  // 2. Supplemental check from selectedVariant properties if any standard attribute is missing
  if (selectedVariant) {
    // Check for Colour
    if (!seenLabels.has("colour")) {
      const colorVal = selectedVariant.colorName;
      if (
        colorVal &&
        colorVal.trim() &&
        colorVal.toLowerCase() !== "standard" &&
        !/^\d+(gb|tb|mb)$/i.test(colorVal.trim())
      ) {
        const formattedVal = formatAttributeValue(colorVal);
        if (formattedVal) {
          seenLabels.add("colour");
          result.push({ label: "Colour", value: formattedVal, rawKey: "Colour" });
        }
      }
    }

    // Check for Storage
    if (!seenLabels.has("storage")) {
      const storageVal = selectedVariant.storage;
      if (storageVal && storageVal.trim()) {
        const formattedVal = formatAttributeValue(storageVal);
        if (formattedVal) {
          seenLabels.add("storage");
          result.push({ label: "Storage", value: formattedVal, rawKey: "Storage" });
        }
      }
    }

    // Fallback: parse from selectedVariant.name (e.g. "Deep Crimson / 512GB")
    if (result.length === 0 && selectedVariant.name && selectedVariant.name.toLowerCase() !== "standard edition") {
      const parts = selectedVariant.name.split("/").map((p) => p.trim());
      parts.forEach((part) => {
        if (!part || part.toLowerCase() === "standard") return;

        if (/^\d+(gb|tb|mb)$/i.test(part)) {
          if (!seenLabels.has("storage")) {
            seenLabels.add("storage");
            result.push({ label: "Storage", value: formatAttributeValue(part), rawKey: "Storage" });
          }
        } else if (/^\d+gb\s+ram$/i.test(part)) {
          if (!seenLabels.has("ram")) {
            seenLabels.add("ram");
            result.push({ label: "RAM", value: formatAttributeValue(part), rawKey: "RAM" });
          }
        } else {
          if (!seenLabels.has("colour")) {
            seenLabels.add("colour");
            result.push({ label: "Colour", value: formatAttributeValue(part), rawKey: "Colour" });
          }
        }
      });
    }
  }

  return result;
}

/**
 * Returns a CSS hex color code for visual swatches based on color name.
 */
export function getColorHex(colorName: string): string {
  if (!colorName) return "#8B0000";
  const name = colorName.toLowerCase();

  if (name.includes("black") || name.includes("dark") || name.includes("midnight") || name.includes("space black"))
    return "#1A1A1A";
  if (name.includes("white") || name.includes("starlight") || name.includes("silver")) return "#E5E7EB";
  if (name.includes("titanium") || name.includes("gray") || name.includes("grey") || name.includes("slate"))
    return "#6B7280";
  if (name.includes("crimson") || name.includes("red") || name.includes("burgundy")) return "#8B0000";
  if (name.includes("gold") || name.includes("amber")) return "#D4AF37";
  if (name.includes("blue") || name.includes("navy") || name.includes("pacific") || name.includes("sierra"))
    return "#1E3A8A";
  if (name.includes("green") || name.includes("alpine") || name.includes("emerald")) return "#065F46";
  if (name.includes("orange") || name.includes("coral")) return "#EA580C";
  if (name.includes("purple") || name.includes("violet") || name.includes("lavender")) return "#581C87";

  return "#8B0000";
}
