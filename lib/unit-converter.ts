export type UnitSystem = "metric" | "imperial";

export interface MeasureValue {
  value: number;
  unit: "in" | "ft" | "cm" | "mm" | "m" | "lb" | "oz" | "kg" | "g" | "f" | "c" | "mi" | "km";
}

/**
 * Converts a measurement value into the target unit system.
 */
export function convertMeasurement(
  val: number,
  fromUnit: MeasureValue["unit"],
  targetSystem: UnitSystem
): { value: number; label: string } {
  const unitLower = fromUnit.toLowerCase() as MeasureValue["unit"];

  // Length conversions (in, ft, cm, mm, m, mi, km)
  if (unitLower === "in" || unitLower === "cm" || unitLower === "mm") {
    if (targetSystem === "metric") {
      if (unitLower === "in") {
        const cm = val * 2.54;
        return { value: Number(cm.toFixed(1)), label: `${Number(cm.toFixed(1))} cm` };
      }
      if (unitLower === "mm") {
        return { value: val, label: `${val} mm` };
      }
      return { value: val, label: `${val} cm` };
    } else {
      // Imperial
      if (unitLower === "cm") {
        const inches = val / 2.54;
        return { value: Number(inches.toFixed(1)), label: `${Number(inches.toFixed(1))} in` };
      }
      if (unitLower === "mm") {
        const inches = val / 25.4;
        return { value: Number(inches.toFixed(2)), label: `${Number(inches.toFixed(2))} in` };
      }
      return { value: val, label: `${val} in` };
    }
  }

  if (unitLower === "ft" || unitLower === "m") {
    if (targetSystem === "metric") {
      if (unitLower === "ft") {
        const meters = val * 0.3048;
        if (meters < 1) {
          const cm = val * 30.48;
          return { value: Number(cm.toFixed(1)), label: `${Number(cm.toFixed(1))} cm` };
        }
        return { value: Number(meters.toFixed(2)), label: `${Number(meters.toFixed(2))} m` };
      }
      return { value: val, label: `${val} m` };
    } else {
      // Imperial
      if (unitLower === "m") {
        const feet = val * 3.28084;
        return { value: Number(feet.toFixed(1)), label: `${Number(feet.toFixed(1))} ft` };
      }
      return { value: val, label: `${val} ft` };
    }
  }

  if (unitLower === "mi" || unitLower === "km") {
    if (targetSystem === "metric") {
      if (unitLower === "mi") {
        const km = val * 1.60934;
        return { value: Number(km.toFixed(1)), label: `${Number(km.toFixed(1))} km` };
      }
      return { value: val, label: `${val} km` };
    } else {
      if (unitLower === "km") {
        const miles = val * 0.621371;
        return { value: Number(miles.toFixed(1)), label: `${Number(miles.toFixed(1))} mi` };
      }
      return { value: val, label: `${val} mi` };
    }
  }

  // Weight conversions (g, kg, lb, oz)
  if (unitLower === "g" || unitLower === "kg" || unitLower === "lb" || unitLower === "oz") {
    if (targetSystem === "metric") {
      if (unitLower === "lb") {
        const kg = val * 0.453592;
        if (kg < 1) {
          const g = val * 453.592;
          return { value: Math.round(g), label: `${Math.round(g)} g` };
        }
        return { value: Number(kg.toFixed(2)), label: `${Number(kg.toFixed(2))} kg` };
      }
      if (unitLower === "oz") {
        const g = val * 28.3495;
        return { value: Math.round(g), label: `${Math.round(g)} g` };
      }
      return { value: val, label: `${val} ${unitLower}` };
    } else {
      // Imperial
      if (unitLower === "g") {
        const oz = val * 0.035274;
        if (oz >= 16) {
          const lbs = oz / 16;
          return { value: Number(lbs.toFixed(2)), label: `${Number(lbs.toFixed(2))} lb` };
        }
        return { value: Number(oz.toFixed(1)), label: `${Number(oz.toFixed(1))} oz` };
      }
      if (unitLower === "kg") {
        const lbs = val * 2.20462;
        return { value: Number(lbs.toFixed(2)), label: `${Number(lbs.toFixed(2))} lb` };
      }
      return { value: val, label: `${val} ${unitLower}` };
    }
  }

  // Temperature
  if (unitLower === "f" || unitLower === "c") {
    if (targetSystem === "metric") {
      if (unitLower === "f") {
        const c = ((val - 32) * 5) / 9;
        return { value: Math.round(c), label: `${Math.round(c)}°C` };
      }
      return { value: val, label: `${val}°C` };
    } else {
      if (unitLower === "c") {
        const f = (val * 9) / 5 + 32;
        return { value: Math.round(f), label: `${Math.round(f)}°F` };
      }
      return { value: val, label: `${val}°F` };
    }
  }

  return { value: val, label: `${val} ${fromUnit}` };
}

/**
 * Format dimension string or convert object
 */
export function formatDimension(
  dim?: { length?: number; width?: number; height?: number; unit: "in" | "cm" | "mm" },
  targetSystem: UnitSystem = "metric"
): string | null {
  if (!dim || (!dim.length && !dim.width && !dim.height)) return null;

  const parts: string[] = [];
  if (dim.length) {
    parts.push(convertMeasurement(dim.length, dim.unit, targetSystem).label);
  }
  if (dim.width) {
    parts.push(convertMeasurement(dim.width, dim.unit, targetSystem).label);
  }
  if (dim.height) {
    parts.push(convertMeasurement(dim.height, dim.unit, targetSystem).label);
  }

  return parts.join(" × ");
}

/**
 * Helper to check if a value is valid for rendering (not null, undefined, "", "N/A", "Unknown")
 */
export function isValidValue(val: unknown): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === "string") {
    const trimmed = val.trim().toLowerCase();
    return (
      trimmed !== "" &&
      trimmed !== "n/a" &&
      trimmed !== "none" &&
      trimmed !== "unknown" &&
      trimmed !== "null" &&
      trimmed !== "undefined"
    );
  }
  if (Array.isArray(val)) {
    return val.length > 0 && val.some((item) => isValidValue(item));
  }
  if (typeof val === "number") {
    return !isNaN(val);
  }
  return true;
}
