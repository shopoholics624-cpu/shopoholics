import { Product, CategoryType, LifestyleType, ProductVariant, ProductStructuredInfo, ProductCategoryMeta } from "@/types/product";
import { WooProduct, WooCategory, WooBrand, WooProductQueryParams, WooProductVariation } from "@/types/woocommerce";
import { isColourAttribute, formatVariationAttributeLabel, formatAttributeValue, getColorHex } from "@/lib/attribute-utils";

/**
 * Utility to decode common HTML entities returned by WooCommerce API (e.g. &amp; -> &)
 */
export function decodeHtmlEntities(str: string): string {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'");
}

/**
 * Server-side helper to get WooCommerce Environment Variables safely.
 * Returns null if credentials are not configured or are placeholder values.
 */
function getWooCommerceCredentials() {
  const url = process.env.WOOCOMMERCE_URL;
  const key = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

  if (
    !url ||
    !key ||
    !secret ||
    url === "https://example.com" ||
    key.includes("dummy") ||
    secret.includes("dummy")
  ) {
    return null;
  }

  return {
    baseUrl: url.replace(/\/+$/, ""),
    authHeader: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
  };
}

/**
 * Helper to strip HTML tags from raw WooCommerce HTML description strings.
 */
function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").trim();
}

/**
 * Normalizes raw WooCommerce attribute slugs into clean human-readable labels.
 */
export function normalizeAttributeName(rawName: string): string {
  return formatVariationAttributeLabel(rawName);
}

/**
 * Normalizes a WooCommerce product object into the frontend Product interface (types/product.ts).
 */
export function transformWooProductToProduct(
  woo: WooProduct,
  rawVariations?: WooProductVariation[]
): Product {
  const regularPrice = parseFloat(woo.regular_price || woo.price || "0");
  const salePrice = parseFloat(woo.sale_price || "0");
  const currentPrice = parseFloat(woo.price || (salePrice > 0 ? woo.sale_price : woo.regular_price) || "0");

  let discountPercentage = 0;
  if (regularPrice > 0 && salePrice > 0 && salePrice < regularPrice) {
    discountPercentage = Math.round(((regularPrice - salePrice) / regularPrice) * 100);
  }

  // Find Brand attribute if available
  const brandAttr = woo.attributes?.find(
    (attr) => attr.name.toLowerCase() === "brand" || attr.name.toLowerCase() === "manufacturer"
  );
  const categoryName = woo.categories?.[0]?.name || "Electronics";
  const rawBrandName = brandAttr?.options?.[0];
  const brandName = (rawBrandName && rawBrandName.toLowerCase() !== categoryName.toLowerCase())
    ? rawBrandName
    : categoryName;

  // Map Category slug to frontend CategoryType
  const primaryCategorySlug = (woo.categories?.[0]?.slug || "smartphones").toLowerCase();
  const validCategories: CategoryType[] = [
    "smartphones",
    "laptops",
    "desktops",
    "wearables",
    "audio",
    "gaming",
    "cameras",
    "smarthome",
    "monitors",
    "storage",
    "office",
    "accessories",
  ];
  const mappedCategory: CategoryType = validCategories.includes(primaryCategorySlug as CategoryType)
    ? (primaryCategorySlug as CategoryType)
    : "smartphones";

  // Images
  const fallbackImage = "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=1200&auto=format&fit=crop";
  const images = woo.images?.length > 0 ? woo.images.map((img) => img.src) : [fallbackImage];
  const featuredImage = images[0] || fallbackImage;

  // Extract raw WooCommerce description and short_description
  const wooDescription = (woo.description || "").trim();
  const wooShortDescription = (woo.short_description || "").trim();

  // Strict fallback policy: description -> short_description -> "No product description available."
  const rawDescriptionHtml = wooDescription
    ? wooDescription
    : wooShortDescription
    ? wooShortDescription
    : "No product description available.";

  const rawDescriptionText = stripHtml(rawDescriptionHtml);

  const features = rawDescriptionText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 5 && line !== "No product description available.")
    .slice(0, 5);

  if (features.length === 0) {
    features.push(`${woo.name} - Official Specifications`);
    features.push("100% Genuine Certified Hardware");
    features.push("Manufacturer Warranty Included");
  }

  // Dictionary of all attributes for structured spec mapping
  const specMap: Record<string, string> = {};
  (woo.attributes || []).forEach((attr) => {
    const label = normalizeAttributeName(attr.name);
    const val = attr.options.join(", ");
    specMap[label] = val;
    specMap[attr.name] = val;
    specMap[attr.name.toLowerCase()] = val;
  });

  // Specifications from WooCommerce attributes
  const specs = (woo.attributes || []).map((attr) => ({
    name: normalizeAttributeName(attr.name),
    value: attr.options.join(", "),
    category: "Performance" as const,
  }));

  // Attribute Groups for multi-attribute variation selection UI
  const attributeGroups = (woo.attributes || [])
    .filter((attr) => attr.options && attr.options.length > 0)
    .map((attr) => ({
      name: attr.name,
      options: attr.options,
    }));

  // Build variants from raw WooCommerce variations if provided
  let variants: ProductVariant[] = [];

  if (rawVariations && rawVariations.length > 0) {
    variants = rawVariations.map((v) => {
      const vRegularPrice = parseFloat(v.regular_price || v.price || String(currentPrice));
      const vCurrentPrice = parseFloat(v.price || String(currentPrice));

      const attrDict: Record<string, string> = {};
      (v.attributes || []).forEach((a) => {
        if (a.name && a.option) {
          const normName = normalizeAttributeName(a.name);
          attrDict[normName] = a.option;
          attrDict[a.name] = a.option;
          attrDict[a.name.toLowerCase()] = a.option;
        }
      });

      const attrNameString = v.attributes.map((a) => a.option).join(" / ") || "Standard Variation";
      const colorAttr = v.attributes.find((a) => isColourAttribute(a.name));
      const storageAttr = v.attributes.find((a) => {
        const lower = a.name.toLowerCase();
        return lower.includes("storage") || lower.includes("capacity") || lower.includes("ram") || lower.includes("memory") || (lower.includes("size") && /^\d+(GB|TB|MB)$/i.test(a.option));
      });

      const parsedColorName = colorAttr?.option || (colorAttr ? "Standard" : v.attributes.length === 1 && !storageAttr ? v.attributes[0].option : "Standard");
      const parsedStorage = storageAttr?.option;

      return {
        id: `var-${v.id}`,
        wooVariationId: v.id,
        sku: v.sku || woo.sku || `SKU-${v.id}`,
        name: attrNameString,
        colorName: parsedColorName,
        colorHex: getColorHex(parsedColorName),
        storage: parsedStorage,
        attributes: attrDict,
        price: vCurrentPrice,
        originalPrice: vRegularPrice > vCurrentPrice ? vRegularPrice : undefined,
        image: v.image?.src || featuredImage,
        inStock: v.purchasable !== false && v.stock_status !== "outofstock",
        stockStatus: v.stock_status || "instock",
      };
    });
  } else if (woo.attributes && woo.attributes.length > 0) {
    // Generate variants from attributes
    const firstAttr = woo.attributes[0];
    const normFirstName = normalizeAttributeName(firstAttr.name);

    variants = firstAttr.options.map((opt, idx) => ({
      id: `var-${woo.id}-${idx}`,
      sku: woo.sku || `SKU-${woo.id}-${idx}`,
      name: opt,
      colorName: normFirstName === "Colour" ? opt : "Standard",
      colorHex: idx % 2 === 0 ? "#8B0000" : "#261816",
      storage: normFirstName === "Storage" ? opt : undefined,
      attributes: { [firstAttr.name]: opt, [firstAttr.name.toLowerCase()]: opt, [normFirstName]: opt },
      price: currentPrice,
      originalPrice: regularPrice > currentPrice ? regularPrice : undefined,
      image: featuredImage,
      inStock: woo.stock_status !== "outofstock" && woo.purchasable !== false,
      stockStatus: woo.stock_status || "instock",
    }));
  } else {
    // Single default variant
    variants = [
      {
        id: `var-${woo.id}-default`,
        sku: woo.sku || `SKU-${woo.id}`,
        name: "Standard Edition",
        colorName: "Standard",
        colorHex: "#8B0000",
        price: currentPrice,
        originalPrice: regularPrice > currentPrice ? regularPrice : undefined,
        image: featuredImage,
        inStock: woo.stock_status !== "outofstock" && woo.purchasable !== false,
        stockStatus: woo.stock_status || "instock",
      },
    ];
  }

  // Weight & Dimensions into structuredInfo
  const parsedWeight = parseFloat(woo.weight || "0");
  const parsedLength = parseFloat(woo.dimensions?.length || "0");
  const parsedWidth = parseFloat(woo.dimensions?.width || "0");
  const parsedHeight = parseFloat(woo.dimensions?.height || "0");

  const structuredInfo: ProductStructuredInfo = {
    overview: rawDescriptionHtml,
    keyFeatures: features,
    warranty: "2-Year Concierge Hardware Warranty",
    weight: parsedWeight > 0 ? { value: parsedWeight, unit: "kg" } : undefined,
    dimensions:
      parsedLength > 0 || parsedWidth > 0 || parsedHeight > 0
        ? { length: parsedLength, width: parsedWidth, height: parsedHeight, unit: "cm" }
        : undefined,
    specs: {
      displaySize: specMap["Display Size"] || specMap["Display"] || specMap["Screen Size"] || specMap["pa_display"],
      displayResolution: specMap["Resolution"] || specMap["Display Resolution"] || specMap["pa_resolution"],
      refreshRate: specMap["Refresh Rate"] || specMap["pa_refresh_rate"],
      processor: specMap["Processor"] || specMap["Chipset"] || specMap["CPU"] || specMap["pa_processor"],
      memory: specMap["RAM"] || specMap["Memory"] || specMap["pa_ram"],
      storage: specMap["Storage"] || specMap["Capacity"] || specMap["pa_storage"],
      cameraMain: specMap["Main Camera"] || specMap["Camera"] || specMap["Rear Camera"] || specMap["pa_camera"],
      cameraFront: specMap["Front Camera"] || specMap["pa_front_camera"],
      batteryCapacity: specMap["Battery"] || specMap["Battery Capacity"] || specMap["pa_battery"],
      chargingSpeed: specMap["Charging Speed"] || specMap["Fast Charging"] || specMap["pa_charging"],
      os: specMap["Operating System"] || specMap["OS"] || specMap["pa_os"],
      graphics: specMap["Graphics"] || specMap["GPU"] || specMap["pa_graphics"],
      soundProfile: specMap["Sound Profile"] || specMap["Audio"] || specMap["pa_audio"],
      noiseCancellation: specMap["Noise Cancellation"] || specMap["ANC"] || specMap["pa_anc"],
      ...specMap,
    },
  };

  // Build category metadata list with HTML entity decoding
  const categoriesList: ProductCategoryMeta[] = (woo.categories || []).map((c) => ({
    id: c.id,
    name: decodeHtmlEntities(c.name),
    slug: c.slug,
    parent: c.parent,
  }));

  // Primary Category Selection Algorithm:
  // 1. Filter out administrative categories ("uncategorized", "featured").
  // 2. Prefer specific child category (parent > 0, or last non-administrative entry in list).
  // 3. Fallback to first valid entry or default Catalog object.
  const validCatList = categoriesList.filter(
    (c) => c.slug !== "uncategorized" && c.slug !== "featured"
  );
  const primaryCategory =
    validCatList.find((c) => typeof c.parent === "number" && c.parent > 0) ||
    validCatList[validCatList.length - 1] ||
    validCatList[0] || {
      id: 0,
      name: "Catalog",
      slug: "all",
    };

  const ratingNum = parseFloat(woo.average_rating || "4.8");

  return {
    id: String(woo.id),
    slug: woo.slug || `product-${woo.id}`,
    title: woo.name,
    type: woo.type || (rawVariations && rawVariations.length > 0 ? "variable" : "simple"),
    hasVariations: woo.type === "variable" || (rawVariations && rawVariations.length > 0),
    tagline: stripHtml(woo.short_description) || woo.name,
    brand: brandName,
    category: mappedCategory,
    categorySlugs: (woo.categories || []).map((c) => c.slug),
    categoryIds: (woo.categories || []).map((c) => c.id),
    categories: categoriesList,
    primaryCategory,
    categoryLabel: primaryCategory.name || decodeHtmlEntities(woo.categories?.[0]?.name) || "Electronics",
    lifestyle: ["work", "travel"] as LifestyleType[],
    price: currentPrice,
    originalPrice: regularPrice > currentPrice ? regularPrice : undefined,
    rating: isNaN(ratingNum) || ratingNum === 0 ? 4.8 : ratingNum,
    reviewCount: woo.rating_count || 12,
    badge: woo.featured ? "FLAGSHIP" : woo.total_sales > 10 ? "BEST SELLER" : undefined,
    isFeatured: woo.featured || false,
    isTrending: woo.total_sales > 5,
    isNewArrival: true,
    discountPercentage: discountPercentage > 0 ? discountPercentage : undefined,
    emiAvailable: true,
    freeDelivery: true,
    expressDelivery: true,
    featuredImage,
    images,
    description: rawDescriptionHtml,
    features,
    variants,
    attributeGroups: attributeGroups.length > 0 ? attributeGroups : undefined,
    specs,
    structuredInfo,
    inStock: woo.stock_status !== "outofstock" && woo.purchasable !== false,
    stockStatus: woo.stock_status || "instock",
  };
}

/**
 * Fetches products from WooCommerce REST API v3 (Server-side only).
 */
export async function getWooProducts(params?: WooProductQueryParams): Promise<{
  products: Product[];
  total: number;
  totalPages: number;
  isMockData: boolean;
}> {
  const creds = getWooCommerceCredentials();

  if (!creds) {
    return {
      products: [],
      total: 0,
      totalPages: 0,
      isMockData: true,
    };
  }

  const query = new URLSearchParams();
  if (params?.page) query.append("page", String(params.page));
  if (params?.per_page) query.append("per_page", String(params.per_page));
  if (params?.search) query.append("search", params.search);

  if (params?.category && params.category !== "all") {
    const catStr = params.category.trim();
    if (/^\d+$/.test(catStr)) {
      query.append("category", catStr);
    } else {
      const allCategories = await getWooCategories();
      const targetSlug = catStr.toLowerCase();

      const aliasMap: Record<string, string[]> = {
        smartphones: ["smart-phones", "mobile-phones", "smartphones"],
        laptops: ["laptops", "notebooks", "desktops-laptops"],
        audio: ["headphones-earphones", "home-theatres", "studio-audio", "speakers"],
        wearables: ["smart-watches", "wearables"],
        cameras: ["cctv-cameras", "cameras-drones", "content-creation"],
        smarthome: ["security-solutions", "smart-home-automation"],
        storage: ["storage-devices", "hard-disks", "pendrives"],
        office: ["printers", "computer-accessories", "apps-softwares"],
      };

      const possibleSlugs = aliasMap[targetSlug] || [targetSlug];

      const foundCat = allCategories.find(
        (c) =>
          possibleSlugs.includes(c.slug.toLowerCase()) ||
          c.slug.toLowerCase() === targetSlug ||
          c.name.toLowerCase() === targetSlug ||
          String(c.id) === targetSlug
      );

      if (foundCat) {
        console.log(
          `[Category Debug] Requested category: "${params.category}" -> Resolved WooCommerce Category ID: ${foundCat.id} (${foundCat.name})`
        );
        query.append("category", String(foundCat.id));
      } else {
        console.warn(
          `[Category Debug] Requested category: "${params.category}" could not be resolved to a WooCommerce Category ID.`
        );
      }
    }
  }

  if (params?.brand && params.brand !== "all") {
    const brandStr = params.brand.trim();
    if (/^\d+$/.test(brandStr)) {
      query.append("brand", brandStr);
    } else {
      const allBrands = await getWooBrands();
      const targetBrandSlug = brandStr.toLowerCase();

      const foundBrand = allBrands.find(
        (b) =>
          b.slug.toLowerCase() === targetBrandSlug ||
          b.name.toLowerCase() === targetBrandSlug ||
          String(b.id) === targetBrandSlug
      );

      if (foundBrand) {
        console.log(
          `[Brand Debug] Requested brand: "${params.brand}" -> Resolved WooCommerce Brand ID: ${foundBrand.id} (${foundBrand.name})`
        );
        query.append("brand", String(foundBrand.id));
      } else {
        console.warn(
          `[Brand Debug] Requested brand: "${params.brand}" could not be resolved to a WooCommerce Brand ID.`
        );
      }
    }
  }

  if (params?.orderby) query.append("orderby", params.orderby);
  if (params?.order) query.append("order", params.order);
  if (params?.slug) query.append("slug", params.slug);
  if (params?.status) query.append("status", params.status);
  else query.append("status", "publish");

  const endpoint = `${creds.baseUrl}/wp-json/wc/v3/products?${query.toString()}`;

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: creds.authHeader,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error(`[WooCommerce Service] API error HTTP ${res.status}`);
      return { products: [], total: 0, totalPages: 0, isMockData: true };
    }

    const total = parseInt(res.headers.get("X-WP-Total") || "0", 10);
    const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "0", 10);
    const rawWooProducts: WooProduct[] = await res.json();

    const normalizedProducts = rawWooProducts.map((p) => transformWooProductToProduct(p));

    return {
      products: normalizedProducts,
      total: total || normalizedProducts.length,
      totalPages: totalPages || 1,
      isMockData: false,
    };
  } catch (error) {
    console.error("[WooCommerce Service] Request failed:", error instanceof Error ? error.message : error);
    return { products: [], total: 0, totalPages: 0, isMockData: true };
  }
}

/**
 * Fetches WooCommerce product variations for a variable product (Server-side only).
 */
export async function getWooProductVariations(productId: string | number): Promise<WooProductVariation[]> {
  const creds = getWooCommerceCredentials();
  if (!creds) return [];

  try {
    const res = await fetch(`${creds.baseUrl}/wp-json/wc/v3/products/${productId}/variations?per_page=100`, {
      method: "GET",
      headers: {
        Authorization: creds.authHeader,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("[WooCommerce Service] Failed to fetch product variations:", error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * Fetches a single WooCommerce product variation by product ID and variation ID (Server-side only).
 */
export async function getWooVariationById(
  productId: string | number,
  variationId: string | number
): Promise<WooProductVariation | null> {
  const creds = getWooCommerceCredentials();
  if (!creds || !productId || !variationId) return null;

  try {
    const res = await fetch(
      `${creds.baseUrl}/wp-json/wc/v3/products/${productId}/variations/${variationId}`,
      {
        method: "GET",
        headers: {
          Authorization: creds.authHeader,
          "Content-Type": "application/json",
        },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(
      `[WooCommerce Service] Failed to fetch variation ${variationId} for product ${productId}:`,
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

/**
 * Fetches a single WooCommerce product by slug (Server-side only).
 */
export async function getWooProductBySlug(slug: string): Promise<Product | null> {
  const creds = getWooCommerceCredentials();
  if (!creds) return null;

  try {
    const res = await fetch(`${creds.baseUrl}/wp-json/wc/v3/products?slug=${encodeURIComponent(slug)}`, {
      method: "GET",
      headers: {
        Authorization: creds.authHeader,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;

    const rawWooList: WooProduct[] = await res.json();
    if (!rawWooList || rawWooList.length === 0) return null;

    const rawWooProduct = rawWooList[0];

    // If product is variable, fetch its variations
    if (rawWooProduct.type === "variable" && rawWooProduct.id) {
      const rawVariations = await getWooProductVariations(rawWooProduct.id);
      return transformWooProductToProduct(rawWooProduct, rawVariations);
    }

    return transformWooProductToProduct(rawWooProduct);
  } catch (error) {
    console.error("[WooCommerce Service] Failed to fetch product by slug:", error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Fetches a single WooCommerce product by ID (Server-side only).
 */
export async function getWooProductById(id: string | number): Promise<Product | null> {
  const creds = getWooCommerceCredentials();
  if (!creds) return null;

  try {
    const res = await fetch(`${creds.baseUrl}/wp-json/wc/v3/products/${id}`, {
      method: "GET",
      headers: {
        Authorization: creds.authHeader,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;

    const rawWooProduct: WooProduct = await res.json();
    if (rawWooProduct.type === "variable") {
      const rawVariations = await getWooProductVariations(rawWooProduct.id);
      return transformWooProductToProduct(rawWooProduct, rawVariations);
    }

    return transformWooProductToProduct(rawWooProduct);
  } catch (error) {
    console.error("[WooCommerce Service] Failed to fetch product by ID:", error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Fetches WooCommerce product categories (Server-side only).
 */
export async function getWooCategories(): Promise<WooCategory[]> {
  const creds = getWooCommerceCredentials();
  if (!creds) return [];

  try {
    const res = await fetch(`${creds.baseUrl}/wp-json/wc/v3/products/categories?per_page=100`, {
      method: "GET",
      headers: {
        Authorization: creds.authHeader,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];
    const rawCategories: WooCategory[] = await res.json();
    return rawCategories.map((c) => ({
      ...c,
      name: decodeHtmlEntities(c.name),
    }));
  } catch (error) {
    console.error("[WooCommerce Service] Failed to fetch categories:", error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * Centralized Category Visibility Helper:
 * A category is visible if:
 * 1. category.count > 0
 * OR
 * 2. It is a parent category (count = 0) with at least one active child category (child.count > 0).
 */
export function isCategoryVisible(category: WooCategory, allCategories: WooCategory[] = []): boolean {
  if (!category) return false;

  // Direct product count > 0
  if (category.count && category.count > 0) {
    return true;
  }

  // Check if any child category has products > 0
  const hasActiveChild = allCategories.some(
    (child) => child.parent === category.id && isCategoryVisible(child, allCategories)
  );

  return hasActiveChild;
}

/**
 * Fetches ONLY visible WooCommerce product categories (Server-side only).
 * Filters out empty categories where count = 0 and no active child categories exist.
 */
export async function getWooVisibleCategories(): Promise<WooCategory[]> {
  const allCategories = await getWooCategories();
  if (!allCategories || allCategories.length === 0) return [];

  return allCategories.filter((cat) => isCategoryVisible(cat, allCategories));
}

/**
 * Resolves a single WooCommerce category by slug or ID.
 */
export async function getWooCategoryBySlug(slugOrId: string): Promise<WooCategory | null> {
  const categories = await getWooCategories();
  if (!categories || categories.length === 0) return null;

  const target = slugOrId.toLowerCase().trim();
  return (
    categories.find(
      (c) => c.slug.toLowerCase() === target || String(c.id) === target || c.name.toLowerCase() === target
    ) || null
  );
}

/**
 * Fetches WooCommerce product brands from /wp-json/wc/v3/products/brands (Server-side only).
 */
export async function getWooBrands(): Promise<WooBrand[]> {
  const creds = getWooCommerceCredentials();
  if (!creds) return [];

  try {
    const res = await fetch(`${creds.baseUrl}/wp-json/wc/v3/products/brands?per_page=100`, {
      method: "GET",
      headers: {
        Authorization: creds.authHeader,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];
    const rawBrands: WooBrand[] = await res.json();
    return rawBrands.map((b) => ({
      ...b,
      name: decodeHtmlEntities(b.name),
    }));
  } catch (error) {
    console.error("[WooCommerce Service] Failed to fetch brands:", error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * Resolves a single WooCommerce brand by slug or ID.
 */
export async function getWooBrandBySlug(slugOrId: string): Promise<WooBrand | null> {
  const brands = await getWooBrands();
  if (!brands || brands.length === 0) return null;

  const target = slugOrId.toLowerCase().trim();
  return (
    brands.find(
      (b) => b.slug.toLowerCase() === target || String(b.id) === target || b.name.toLowerCase() === target
    ) || null
  );
}

/**
 * Fetches WooCommerce customer data by customerId server-side.
 */
export async function getWooCustomerById(customerId: number): Promise<any | null> {
  const creds = getWooCommerceCredentials();
  if (!creds || !customerId) return null;

  try {
    const res = await fetch(`${creds.baseUrl}/wp-json/wc/v3/customers/${customerId}`, {
      method: "GET",
      headers: {
        Authorization: creds.authHeader,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("[WooCommerce Service] Failed to fetch customer:", error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Permanently deletes a customer account from WooCommerce via REST API.
 */
export async function deleteWooCustomer(customerId: number): Promise<{ success: boolean; message?: string }> {
  const creds = getWooCommerceCredentials();
  if (!creds || !customerId) {
    return { success: false, message: "WooCommerce credentials or customer ID missing." };
  }

  try {
    const res = await fetch(`${creds.baseUrl}/wp-json/wc/v3/customers/${customerId}?force=true`, {
      method: "DELETE",
      headers: {
        Authorization: creds.authHeader,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (res.ok) {
      return { success: true, message: "WooCommerce customer deleted successfully." };
    }

    const errData = await res.json().catch(() => ({}));
    return {
      success: false,
      message: errData.message || `WooCommerce returned status ${res.status}`,
    };
  } catch (error) {
    console.error("[WooCommerce Service] Failed to delete customer:", error instanceof Error ? error.message : error);
    return { success: false, message: "Unable to connect to WooCommerce service." };
  }
}

/**
 * Updates a customer's password in WooCommerce via REST API.
 */
export async function updateWooCustomerPassword(
  customerId: number,
  newPassword: string
): Promise<{ success: boolean; message?: string }> {
  const creds = getWooCommerceCredentials();
  if (!creds || !customerId || !newPassword) {
    return { success: false, message: "WooCommerce credentials, customer ID, or password missing." };
  }

  try {
    const res = await fetch(`${creds.baseUrl}/wp-json/wc/v3/customers/${customerId}`, {
      method: "PUT",
      headers: {
        Authorization: creds.authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: newPassword }),
      cache: "no-store",
    });

    if (res.ok) {
      return { success: true, message: "Password updated successfully in WooCommerce." };
    }

    const errData = await res.json().catch(() => ({}));
    return {
      success: false,
      message: errData.message || "Failed to update password in WooCommerce.",
    };
  } catch (error) {
    console.error("[WooCommerce Service] Failed to update customer password:", error instanceof Error ? error.message : error);
    return { success: false, message: "Unable to connect to WooCommerce service." };
  }
}

