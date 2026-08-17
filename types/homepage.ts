export type HeroRedirectType = "product" | "category" | "shop" | "custom" | "none";

export interface HeroSlide {
  id: string;
  title: string;
  alt: string;
  desktopImage: string; // 1920x1080 recommended
  desktopMediaId?: number; // WordPress Media Attachment ID
  mobileImage?: string; // 1080x1920 recommended
  mobileMediaId?: number; // WordPress Media Attachment ID
  redirectType: HeroRedirectType;
  redirectValue?: string; // product slug, category slug, or custom URL
  order: number;
  isEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnnouncementItem {
  id: string;
  text: string;
  link?: string;
  order: number;
  isEnabled: boolean;
}

export type OfferUsageRule = "unlimited" | "once_per_customer" | "once_per_order" | "first_order_only";

export interface HomepageOffer {
  id: string;
  title: string;
  tagline: string;
  badge: string;
  code: string;
  discountType: "percent" | "fixed";
  discountAmount: number;
  applyTo?: "entire_store" | "category" | "products";
  image?: string;
  mediaId?: number; // WordPress Media Attachment ID
  targetCategory?: string; // slug of category
  targetProduct?: string; // legacy single product slug
  targetProductIds?: number[]; // list of WooCommerce product IDs
  targetProducts?: Array<{ id: number; name: string; slug: string }>; // list of selected products
  usageRule?: OfferUsageRule; // "unlimited" | "once_per_customer" | "once_per_order" | "first_order_only"
  maxEligibleQuantity?: number | null; // null/0: unlimited, 1: single product, >1: custom limit
  ctaHref?: string;
  startDate?: string;
  expiryDate?: string;
  isEnabled: boolean;
  order: number;
}

export interface HomepageCard {
  id: string;
  section: "category_slider" | "bento";
  slotName: string;
  title: string;
  subtitle?: string;
  badge?: string;
  image: string;
  mediaId?: number; // WordPress Media Attachment ID
  categorySlug?: string; // Target category slug in WooCommerce
  productSlug?: string; // Target product slug in WooCommerce for product-backed cards (Our Picks, Best Seller)
  productId?: number; // Target product ID in WooCommerce
  ctaText?: string;
  ctaHref?: string;
  isEnabled: boolean;
  order: number;
}

export interface HomepageConfig {
  heroSlides: HeroSlide[];
  announcements: AnnouncementItem[];
  offers: HomepageOffer[];
  cards: HomepageCard[];
  updatedAt?: string;
}
