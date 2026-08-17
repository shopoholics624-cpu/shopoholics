import { CartItem, AppliedCartOffer } from "@/types/cart";
import { HomepageOffer } from "@/types/homepage";

export interface CustomerEvaluationContext {
  customerId?: number | null;
  totalOrderCount?: number;
  usedOffers?: Record<string, { usedCount: number }>;
}

export interface DiscountEvaluationResult {
  discountTotal: number;
  appliedOffer: AppliedCartOffer | null;
  eligibleItemIds: string[];
}

/**
 * Checks if an offer is currently active according to its enabled status and schedule.
 */
export function isOfferActive(offer: HomepageOffer, now = Date.now()): boolean {
  if (!offer || !offer.isEnabled) return false;

  if (offer.startDate) {
    const startTime = new Date(offer.startDate).getTime();
    if (!isNaN(startTime) && now < startTime) {
      return false;
    }
  }

  if (offer.expiryDate) {
    const expiryTime = new Date(offer.expiryDate).getTime();
    if (!isNaN(expiryTime) && now > expiryTime) {
      return false;
    }
  }

  return true;
}

/**
 * Validates whether the customer account is eligible for the offer based on its usage rule.
 */
export function isOfferEligibleForCustomer(
  offer: HomepageOffer,
  context?: CustomerEvaluationContext
): boolean {
  if (!offer || !offer.isEnabled) return false;

  const usageRule = offer.usageRule || "unlimited";

  if (usageRule === "unlimited" || usageRule === "once_per_order") {
    return true;
  }

  // Account-restricted rules require authenticated customer account
  if (!context || !context.customerId || context.customerId <= 0) {
    return false;
  }

  if (usageRule === "first_order_only") {
    const orderCount = context.totalOrderCount ?? 0;
    if (orderCount > 0) return false;
    const usage = context.usedOffers?.[offer.id];
    if (usage && (usage.usedCount || 0) > 0) return false;
    return true;
  }

  if (usageRule === "once_per_customer") {
    const usage = context.usedOffers?.[offer.id];
    if (usage && (usage.usedCount || 0) > 0) return false;
    return true;
  }

  return true;
}

/**
 * Determines if a specific cart item is eligible for the given offer.
 */
export function isItemEligibleForOffer(item: CartItem, offer: HomepageOffer): boolean {
  if (!item || item.isFreeGift || item.unavailable) return false;

  const applyTo: "entire_store" | "category" | "products" =
    offer.applyTo ||
    ((offer.targetProductIds && offer.targetProductIds.length > 0) || offer.targetProduct
      ? "products"
      : offer.targetCategory
      ? "category"
      : "entire_store");

  if (applyTo === "entire_store") {
    return true;
  }

  if (applyTo === "category") {
    if (!offer.targetCategory) return true; // Entire store fallback
    const targetSlug = offer.targetCategory.trim().toLowerCase();

    const product = item.product || {};
    const itemCatSlug = (product.category || "").toLowerCase();
    const itemCatLabel = (product.categoryLabel || "").toLowerCase();
    const itemCategorySlugs = (product.categorySlugs || []).map((s: string) => String(s).toLowerCase());
    const itemCategories = (product.categories || []).map((c: any) =>
      String(c.slug || c.name || "").toLowerCase()
    );

    return (
      itemCatSlug === targetSlug ||
      itemCatLabel === targetSlug ||
      itemCategorySlugs.includes(targetSlug) ||
      itemCategories.includes(targetSlug)
    );
  }

  if (applyTo === "products") {
    const targetIds = (offer.targetProductIds || []).map((id) => Number(id));
    const targetSlug = (offer.targetProduct || "").trim().toLowerCase();

    const rawItemId = item.productId || item.product?.id || item.id || "";
    const cleanId = Number(String(rawItemId).replace(/\D/g, ""));
    const itemSlug = (item.product?.slug || "").trim().toLowerCase();

    const matchesId = !isNaN(cleanId) && cleanId > 0 && targetIds.includes(cleanId);
    const matchesSlug = Boolean(targetSlug && itemSlug === targetSlug);

    return matchesId || matchesSlug;
  }

  return false;
}

/**
 * Universal evaluation of cart discount based on active homepage offers,
 * customer account eligibility rules, and maximum eligible quantity limits per order.
 */
export function evaluateCartDiscount(
  items: CartItem[],
  offers: HomepageOffer[],
  customerContext?: CustomerEvaluationContext,
  preferredCode?: string
): DiscountEvaluationResult {
  const activeOffers = (offers || []).filter(
    (o) => isOfferActive(o) && isOfferEligibleForCustomer(o, customerContext)
  );

  if (!items || items.length === 0 || activeOffers.length === 0) {
    return { discountTotal: 0, appliedOffer: null, eligibleItemIds: [] };
  }

  let candidates = activeOffers;
  if (preferredCode && preferredCode.trim()) {
    const codeMatch = activeOffers.find(
      (o) => o.code && o.code.trim().toUpperCase() === preferredCode.trim().toUpperCase()
    );
    if (codeMatch) {
      candidates = [codeMatch];
    }
  }

  let bestResult: DiscountEvaluationResult = {
    discountTotal: 0,
    appliedOffer: null,
    eligibleItemIds: [],
  };

  for (const offer of candidates) {
    const eligibleItems = items.filter((item) => isItemEligibleForOffer(item, offer));
    if (eligibleItems.length === 0) continue;

    // Flatten eligible items into individual product units sorted descending by unit price
    // to apply discount to highest-priced eligible items up to maxEligibleQuantity
    const unitPrices: number[] = [];
    for (const item of eligibleItems) {
      const unitPrice = item.selectedVariant?.price ?? item.product?.price ?? 0;
      const qty = Math.max(1, item.quantity || 1);
      for (let q = 0; q < qty; q++) {
        unitPrices.push(unitPrice);
      }
    }
    unitPrices.sort((a, b) => b - a);

    const maxQty =
      offer.maxEligibleQuantity !== null &&
      offer.maxEligibleQuantity !== undefined &&
      offer.maxEligibleQuantity > 0
        ? offer.maxEligibleQuantity
        : unitPrices.length;

    const discountedUnits = unitPrices.slice(0, maxQty);
    const eligibleSubtotal = discountedUnits.reduce((sum, p) => sum + p, 0);

    if (eligibleSubtotal <= 0) continue;

    let discount = 0;
    if (offer.discountType === "percent") {
      const pct = Math.max(0, Math.min(100, Number(offer.discountAmount) || 0));
      discount = Math.round(eligibleSubtotal * (pct / 100));
    } else {
      const fixedVal = Math.max(0, Number(offer.discountAmount) || 0);
      discount = Math.min(eligibleSubtotal, Math.round(fixedVal));
    }

    if (discount > bestResult.discountTotal) {
      const applyTo =
        offer.applyTo ||
        ((offer.targetProductIds && offer.targetProductIds.length > 0) || offer.targetProduct
          ? "products"
          : offer.targetCategory
          ? "category"
          : "entire_store");

      bestResult = {
        discountTotal: discount,
        eligibleItemIds: eligibleItems.map((i) => i.id),
        appliedOffer: {
          id: offer.id,
          title: offer.title,
          code: offer.code,
          discountType: offer.discountType,
          discountAmount: offer.discountAmount,
          applyTo,
          targetCategory: offer.targetCategory,
          targetProductIds: offer.targetProductIds,
          usageRule: offer.usageRule || "unlimited",
          maxEligibleQuantity: offer.maxEligibleQuantity || null,
          calculatedDiscount: discount,
          eligibleItemsCount: discountedUnits.length,
          description:
            offer.tagline || `${offer.discountAmount}${offer.discountType === "percent" ? "%" : "₹"} OFF`,
        },
      };
    }
  }

  return bestResult;
}
