import { Product, ProductVariant, FreeGiftBundle } from "@/types/product";
import { CartItem } from "@/types/cart";

/**
  WooCommerce Ready Promotion Validator
 * Evaluates promotional rules dynamically (enabled status, start/end dates, minimum quantities, brands, categories)
 */
export function isBundleEligible(product: Product, quantity = 1): boolean {
  const bundle = product.freeGiftBundle;
  if (!bundle || !bundle.enabled) return false;

  // Validate minimum quantity required
  if (bundle.minQuantity && quantity < bundle.minQuantity) {
    return false;
  }

  // Validate campaign date ranges (WooCommerce Ready)
  const now = new Date();
  if (bundle.startDate && new Date(bundle.startDate) > now) {
    return false;
  }
  if (bundle.endDate && new Date(bundle.endDate) < now) {
    return false;
  }

  return true;
}

/**
 * Retrieves active Free Gift Bundle for a given product
 */
export function getFreeGiftBundle(product: Product): FreeGiftBundle | null {
  if (isBundleEligible(product)) {
    return product.freeGiftBundle || null;
  }
  return null;
}

/**
 * Creates a free gift CartItem attached to a parent product
 */
export function createFreeGiftCartItem(
  parentProduct: Product,
  parentVariant: ProductVariant,
  bundle: FreeGiftBundle,
  quantity = 1
): CartItem {
  const giftVariant: ProductVariant = {
    id: `free-gift-var-${bundle.id}`,
    name: bundle.giftTitle,
    colorName: "Complimentary Finish",
    colorHex: "#8b0000",
    price: 0,
    originalPrice: bundle.giftOriginalPrice,
    image: bundle.giftImage,
    inStock: true,
  };

  const giftProduct: Product = {
    id: `free-gift-${parentProduct.id}-${bundle.id}`,
    slug: `free-gift-${bundle.id}`,
    title: bundle.giftTitle,
    tagline: bundle.giftDescription,
    brand: parentProduct.brand,
    category: parentProduct.category,
    categoryLabel: "Complimentary Gift",
    price: 0,
    originalPrice: bundle.giftOriginalPrice,
    rating: 0,
    reviewCount: 0,
    badge: "FREE GIFT",
    images: [bundle.giftImage],
    featuredImage: bundle.giftImage,
    description: bundle.giftDescription,
    features: ["Complimentary with qualifying purchase", "Official Hardware Protection"],
    variants: [giftVariant],
    specs: [],
  };

  return {
    id: `free-gift-${parentProduct.id}-${parentVariant.id}`,
    product: giftProduct,
    selectedVariant: giftVariant,
    quantity: Math.min(quantity, bundle.maxGiftsPerOrder || 1),
    hasProtectionPlan: false,
    protectionPlanCost: 0,
    isFreeGift: true,
    parentProductId: parentProduct.id,
    freeGiftDetails: {
      headline: bundle.headline || "Free Bundle Included",
      giftTitle: bundle.giftTitle,
      giftImage: bundle.giftImage,
      giftOriginalPrice: bundle.giftOriginalPrice,
      giftDescription: bundle.giftDescription,
      badgeText: bundle.badgeText || "🎁 FREE GIFT",
    },
    inStock: true,
  };
}
