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
 * Formats reviewer name safely, stripping any email domain to prevent exposing customer emails.
 */
export function formatReviewerName(rawName?: string): string {
  if (!rawName || typeof rawName !== "string") return "Verified Customer";
  let trimmed = rawName.trim();
  if (!trimmed) return "Verified Customer";

  if (trimmed.includes("@")) {
    trimmed = trimmed.split("@")[0].trim();
  }

  // Extract First Name if full name is provided (e.g. "Shravan Yeole" -> "Shravan")
  if (trimmed.includes(" ")) {
    trimmed = trimmed.split(" ")[0].trim();
  }

  if (!trimmed) return "Verified Customer";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
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
  rawVariations?: WooProductVariation[],
  reviewsSummaryMap?: Map<string, { rating: number; reviewCount: number }>
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

  // Extract raw WooCommerce description and short_description independently
  const wooDescription = (woo.description || "").trim();
  const wooShortDescription = (woo.short_description || "").trim();

  // Dictionary of all attributes for structured spec mapping
  const specMap: Record<string, string> = {};
  (woo.attributes || []).forEach((attr) => {
    const label = normalizeAttributeName(attr.name);
    const val = attr.options.join(", ");
    specMap[label] = val;
    specMap[attr.name] = val;
    specMap[attr.name.toLowerCase()] = val;
  });

  // WooCommerce Product Attributes Classification (Strict WooCommerce "variation" Flag Logic)
  // Used for variations = ON (attr.variation === true)  -> Variation Selection beside product images
  // Used for variations = OFF (attr.variation === false) -> Technical Specifications section below

  // 1. Variation Attributes (Used for variations = ON)
  const variationAttributes = (woo.attributes || []).filter(
    (attr) => attr.options && attr.options.length > 0 && Boolean(attr.variation) === true
  );

  const attributeGroups = variationAttributes.map((attr) => ({
    name: normalizeAttributeName(attr.name),
    options: attr.options,
  }));

  // Track variation attribute names to prevent duplicates in Technical Specifications
  const variationAttrNames = new Set<string>();
  variationAttributes.forEach((attr) => {
    variationAttrNames.add(normalizeAttributeName(attr.name).toLowerCase().trim());
    variationAttrNames.add(attr.name.toLowerCase().trim());
  });

  // 2. Non-Variation Attributes (Used for variations = OFF) -> Technical Specifications below
  const specNameSet = new Set<string>();
  const specs: Array<{ name: string; value: string; category: "Performance" }> = [];

  (woo.attributes || []).forEach((attr) => {
    if (!attr.options || attr.options.length === 0) return;
    const normName = normalizeAttributeName(attr.name);
    const lowerNorm = normName.toLowerCase().trim();
    const lowerRaw = attr.name.toLowerCase().trim();

    // Skip variation attributes (they are shown beside product images, not repeated below)
    if (Boolean(attr.variation) === true || variationAttrNames.has(lowerNorm) || variationAttrNames.has(lowerRaw)) {
      return;
    }

    // Skip duplicates within specs
    if (specNameSet.has(lowerNorm)) return;
    specNameSet.add(lowerNorm);

    specs.push({
      name: normName,
      value: attr.options.join(", "),
      category: "Performance",
    });
  });

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
    overview: wooDescription,
    keyFeatures: [],
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

  const pidStr = String(woo.id);
  let ratingNum = 0;
  let countNum = 0;

  if (reviewsSummaryMap && reviewsSummaryMap.has(pidStr)) {
    const summary = reviewsSummaryMap.get(pidStr)!;
    ratingNum = summary.rating;
    countNum = summary.reviewCount;
  } else {
    const rawRating = parseFloat(woo.average_rating || "0");
    ratingNum = isNaN(rawRating) ? 0 : rawRating;
    const rawCount = typeof woo.rating_count === "number" ? woo.rating_count : parseInt(String(woo.rating_count || "0"), 10) || 0;
    countNum = ratingNum > 0 && rawCount === 0 ? 1 : rawCount;
  }

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
    rating: ratingNum,
    reviewCount: countNum,
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
    description: wooDescription,
    shortDescription: wooShortDescription,
    short_description: wooShortDescription,
    features: [],
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
  // When searching, fetch up to 100 real products from store to allow multi-faceted scoring
  if (params?.search && params.search.trim()) {
    query.append("per_page", "100");
  } else if (params?.per_page) {
    query.append("per_page", String(params.per_page));
  }

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
        query.append("category", String(foundCat.id));
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
        query.append("brand", String(foundBrand.id));
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
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`[WooCommerce Service] API error HTTP ${res.status}`);
      return { products: [], total: 0, totalPages: 0, isMockData: true };
    }

    const rawWooProducts: WooProduct[] = await res.json();

    // Apply intelligent multi-faceted relevance scoring when search query is present
    let finalRawProducts = rawWooProducts;
    if (params?.search && params.search.trim()) {
      finalRawProducts = scoreAndRankWooProducts(rawWooProducts, params.search);
    }

    const reviewsMap = await getWooApprovedReviewsSummaryMap();
    const normalizedProducts = finalRawProducts.map((p) => transformWooProductToProduct(p, undefined, reviewsMap));

    return {
      products: normalizedProducts,
      total: normalizedProducts.length,
      totalPages: 1,
      isMockData: false,
    };
  } catch (error) {
    console.error("[WooCommerce Service] Request failed:", error instanceof Error ? error.message : error);
    return { products: [], total: 0, totalPages: 0, isMockData: true };
  }
}

/**
 * Intelligent Multi-Faceted Relevance Scoring for WooCommerce Products
 * Matches across:
 * - Product Title (Exact match, Prefix match, Word boundaries, Substring)
 * - Categories (Name & Slug match, e.g. "head" -> "Headphones & Earphones", "lap" -> "Laptops", "watch" -> "Smart Watches", "phone" -> "Smartphones / Mobile Phones")
 * - Product Tags (e.g. "headphone", "earbuds", "cellphone", "photoshop", "magsafe")
 * - Brand & Attributes (e.g. "Apple", "Samsung", "Phonokart", "Wireless", "ANC", "10000mAh")
 * - Short description and Specifications
 *
 * Ranks closest matches first, followed by broader related matches.
 */
export function scoreAndRankWooProducts(
  products: WooProduct[],
  searchQuery: string
): WooProduct[] {
  const cleanQuery = searchQuery.trim().toLowerCase();
  if (!cleanQuery) return products;

  const tokens = cleanQuery.split(/\s+/).filter(Boolean);

  const scored = products.map((p) => {
    const title = decodeHtmlEntities(p.name || "").toLowerCase();
    const desc = decodeHtmlEntities(
      (p.description || "") + " " + (p.short_description || "")
    ).toLowerCase();
    const categories = (p.categories || []).map((c) =>
      (decodeHtmlEntities(c.name || "") + " " + (c.slug || "")).toLowerCase()
    );
    const tags = (p.tags || []).map((t) =>
      decodeHtmlEntities(t.name || "").toLowerCase()
    );
    const attributes = (p.attributes || []).map((a) =>
      [
        decodeHtmlEntities(a.name || "").toLowerCase(),
        ...(a.options || []).map((o) => decodeHtmlEntities(o).toLowerCase()),
      ].join(" ")
    );

    let totalScore = 0;
    let matchedTokens = 0;

    for (const token of tokens) {
      let tokenScore = 0;

      // 1. Exact title match or title starts with token (Highest relevance)
      if (title === token) {
        tokenScore += 160;
      } else if (title.startsWith(token)) {
        tokenScore += 120;
      } else if (title.includes(token)) {
        const words = title.split(/[\s\-_\/]+/);
        if (words.some((w) => w === token || w.startsWith(token))) {
          tokenScore += 90;
        } else {
          tokenScore += 70;
        }
      }

      // 2. Category matching (e.g. "head" matches "Headphones & Earphones", "lap" matches "Laptops", "watch" matches "Smart Watches")
      for (const cat of categories) {
        if (cat.includes(token)) {
          tokenScore += 55;
          break;
        }
      }

      // 3. Tag matching (e.g. "head" matches "headphone", "ear" matches "earbuds")
      for (const tag of tags) {
        if (tag.includes(token)) {
          tokenScore += 45;
          break;
        }
      }

      // 4. Attribute / Brand matching (e.g. "wireless", "magsafe", "10000mah")
      for (const attr of attributes) {
        if (attr.includes(token)) {
          tokenScore += 35;
          break;
        }
      }

      // 5. Description matching
      if (desc.includes(token)) {
        tokenScore += 20;
      }

      if (tokenScore > 0) {
        matchedTokens++;
        totalScore += tokenScore;
      }
    }

    if (tokens.length > 1 && matchedTokens < tokens.length) {
      totalScore = Math.floor(totalScore * (matchedTokens / tokens.length) * 0.5);
    }

    return { product: p, score: totalScore };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);
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
      cache: "no-store",
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
        cache: "no-store",
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
      cache: "no-store",
    });

    if (!res.ok) return null;

    const rawWooList: WooProduct[] = await res.json();
    if (!rawWooList || rawWooList.length === 0) return null;

    const rawWooProduct = rawWooList[0];
    const reviewsMap = await getWooApprovedReviewsSummaryMap();

    // If product is variable, fetch its variations
    if (rawWooProduct.type === "variable" && rawWooProduct.id) {
      const rawVariations = await getWooProductVariations(rawWooProduct.id);
      return transformWooProductToProduct(rawWooProduct, rawVariations, reviewsMap);
    }

    return transformWooProductToProduct(rawWooProduct, undefined, reviewsMap);
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
      cache: "no-store",
    });

    if (!res.ok) return null;

    const rawWooProduct: WooProduct = await res.json();
    const reviewsMap = await getWooApprovedReviewsSummaryMap();
    if (rawWooProduct.type === "variable") {
      const rawVariations = await getWooProductVariations(rawWooProduct.id);
      return transformWooProductToProduct(rawWooProduct, rawVariations, reviewsMap);
    }

    return transformWooProductToProduct(rawWooProduct, undefined, reviewsMap);
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
      cache: "no-store",
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
      cache: "no-store",
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

export interface WooReview {
  id: number;
  date_created: string;
  reviewer: string;
  reviewer_email?: string;
  review: string;
  rating: number;
  verified: boolean;
}

/**
 * Fetches WooCommerce customers and builds a map of email/username -> first_name
 */
export async function getWooCustomerFirstNameMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const creds = getWooCommerceCredentials();
  if (!creds) return map;

  try {
    const res = await fetch(`${creds.baseUrl}/wp-json/wc/v3/customers?per_page=100`, {
      method: "GET",
      headers: {
        Authorization: creds.authHeader,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return map;
    const customers: any[] = await res.json();
    if (!Array.isArray(customers)) return map;

    for (const c of customers) {
      const firstName = (c.first_name || "").trim();
      if (!firstName) continue;

      const formattedFirst = firstName.charAt(0).toUpperCase() + firstName.slice(1);

      if (c.email) {
        map.set(c.email.toLowerCase().trim(), formattedFirst);
        const localPart = c.email.split("@")[0].toLowerCase().trim();
        if (localPart) map.set(localPart, formattedFirst);
      }

      if (c.username) {
        map.set(c.username.toLowerCase().trim(), formattedFirst);
        if (c.username.includes("@")) {
          const uLocal = c.username.split("@")[0].toLowerCase().trim();
          if (uLocal) map.set(uLocal, formattedFirst);
        }
      }
    }
    return map;
  } catch (err) {
    console.warn("[WooCommerce Service] Failed to fetch customer first name map:", err);
    return map;
  }
}

/**
 * Fetches WooCommerce product reviews for a specific product (Server-side only).
 */
export async function getWooProductReviews(productId: string | number): Promise<WooReview[]> {
  const creds = getWooCommerceCredentials();
  if (!creds || !productId) return [];

  try {
    const cleanId = String(productId).replace(/\D/g, "");
    if (!cleanId) return [];

    const [res, customerMap] = await Promise.all([
      fetch(
        `${creds.baseUrl}/wp-json/wc/v3/products/reviews?product=${cleanId}&status=approved&per_page=20`,
        {
          method: "GET",
          headers: {
            Authorization: creds.authHeader,
            "Content-Type": "application/json",
          },
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        }
      ),
      getWooCustomerFirstNameMap(),
    ]);

    if (!res.ok) return [];
    const rawReviews: any[] = await res.json();
    if (!Array.isArray(rawReviews)) return [];

    return rawReviews.map((r: any) => {
      const rawEmail = (r.reviewer_email || r.reviewer || "").toLowerCase().trim();
      const localPart = rawEmail.includes("@") ? rawEmail.split("@")[0].trim() : rawEmail;

      let matchedFirstName = customerMap.get(rawEmail) || customerMap.get(localPart);

      // If no customer map hit, fallback to formatReviewerName
      if (!matchedFirstName) {
        matchedFirstName = formatReviewerName(r.reviewer);
      }

      return {
        id: r.id,
        date_created: r.date_created || r.date_created_gmt || new Date().toISOString(),
        reviewer: matchedFirstName,
        review: r.review || "",
        rating: typeof r.rating === "number" ? r.rating : parseInt(r.rating || "5", 10),
        verified: Boolean(r.verified),
      };
    });
  } catch (error) {
    console.warn(`[WooCommerce Service] Failed to fetch reviews for product ${productId}:`, error);
    return [];
  }
}

/**
 * Fetches approved review summaries across products in a single call to map actual ratings/counts.
 */
export async function getWooApprovedReviewsSummaryMap(): Promise<Map<string, { rating: number; reviewCount: number }>> {
  const map = new Map<string, { rating: number; reviewCount: number }>();
  const creds = getWooCommerceCredentials();
  if (!creds) return map;

  try {
    const res = await fetch(
      `${creds.baseUrl}/wp-json/wc/v3/products/reviews?status=approved&per_page=100`,
      {
        method: "GET",
        headers: {
          Authorization: creds.authHeader,
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!res.ok) return map;
    const rawReviews: any[] = await res.json();
    if (!Array.isArray(rawReviews)) return map;

    const stats = new Map<string, { sum: number; count: number }>();
    for (const r of rawReviews) {
      if (!r.product_id) continue;
      const pid = String(r.product_id);
      const rating = typeof r.rating === "number" ? r.rating : parseInt(r.rating || "5", 10);
      const current = stats.get(pid) || { sum: 0, count: 0 };
      stats.set(pid, { sum: current.sum + rating, count: current.count + 1 });
    }

    stats.forEach((val, pid) => {
      if (val.count > 0) {
        map.set(pid, {
          rating: val.sum / val.count,
          reviewCount: val.count,
        });
      }
    });

    return map;
  } catch (error) {
    console.warn("[WooCommerce Service] Failed to fetch reviews summary map:", error);
    return map;
  }
}

export interface CreateWooReviewInput {
  productId: number;
  rating: number;
  review: string;
  reviewer: string;
  reviewerEmail: string;
}

export interface CreateWooReviewResult {
  success: boolean;
  message: string;
  review?: WooReview;
  status?: string;
}

/**
 * Posts a new WooCommerce product review (Server-side only).
 */
export async function createWooProductReview(
  input: CreateWooReviewInput
): Promise<CreateWooReviewResult> {
  const creds = getWooCommerceCredentials();
  if (!creds || !input.productId) {
    return { success: false, message: "WooCommerce API service unavailable." };
  }

  try {
    const res = await fetch(`${creds.baseUrl}/wp-json/wc/v3/products/reviews`, {
      method: "POST",
      headers: {
        Authorization: creds.authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: input.productId,
        rating: input.rating,
        review: input.review,
        reviewer: input.reviewer,
        reviewer_email: input.reviewerEmail,
      }),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        message: data.message || `WooCommerce API error (Status ${res.status}).`,
      };
    }

    const status = data.status || "approved";
    const isApproved = status === "approved";

    return {
      success: true,
      status,
      message: isApproved
        ? "Your review has been submitted successfully."
        : "Your review has been submitted and is awaiting approval.",
      review: {
        id: data.id || Date.now(),
        date_created: data.date_created || new Date().toISOString(),
        reviewer: data.reviewer || input.reviewer,
        reviewer_email: data.reviewer_email || input.reviewerEmail,
        review: data.review || input.review,
        rating: typeof data.rating === "number" ? data.rating : input.rating,
        verified: Boolean(data.verified),
      },
    };
  } catch (error: any) {
    console.error("[WooCommerce Service] Failed to create product review:", error);
    return { success: false, message: "Unable to connect to WooCommerce review service." };
  }
}

