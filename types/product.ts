export interface ProductAttributeGroup {
  name: string;
  options: string[];
}

export interface ProductVariant {
  id: string;
  wooVariationId?: number;
  sku?: string;
  name: string;
  colorName: string;
  colorHex: string;
  storage?: string;
  attributes?: Record<string, string>;
  price: number;
  originalPrice?: number;
  image: string;
  inStock: boolean;
  stockStatus?: "instock" | "outofstock" | "onbackorder";
}

export interface ProductSpec {
  name: string;
  value: string;
  category: "Display" | "Performance" | "Camera" | "Battery" | "Design" | "Connectivity" | "Storage" | "Audio";
}

export type CategoryType =
  | "smartphones"
  | "laptops"
  | "desktops"
  | "wearables"
  | "audio"
  | "gaming"
  | "cameras"
  | "smarthome"
  | "monitors"
  | "storage"
  | "office"
  | "accessories";

export type LifestyleType =
  | "gaming"
  | "creator"
  | "photography"
  | "music"
  | "work"
  | "office"
  | "student"
  | "smarthome"
  | "travel";

export interface FreeGiftBundle {
  id: string;
  enabled: boolean;
  headline?: string;
  giftTitle: string;
  giftImage: string;
  giftOriginalPrice: number;
  giftDescription: string;
  promoEndDate?: string;
  minQuantity?: number;
  maxGiftsPerOrder?: number;
  isAutoIncluded: boolean;
  badgeText?: string;
  // WooCommerce Ready Metadata
  wooCommerceCampaignId?: string;
  startDate?: string;
  endDate?: string;
  applicableBrands?: string[];
  applicableCategories?: CategoryType[];
}

export interface ProductStructuredInfo {
  overview?: string;
  keyFeatures?: string[];
  whatsInTheBox?: string[];
  warranty?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit: "in" | "cm" | "mm";
  };
  weight?: {
    value: number;
    unit: "g" | "kg" | "lb" | "oz";
  };
  // Category-Specific Dynamic Specification Fields
  specs?: {
    // Smartphone
    processor?: string;
    displaySize?: string;
    displayResolution?: string;
    refreshRate?: string;
    cameraMain?: string;
    cameraFront?: string;
    batteryCapacity?: string;
    chargingSpeed?: string;
    os?: string;
    connectivity?: string;
    storage?: string;
    memory?: string;
    security?: string;
    sensors?: string;
    // Laptop / Desktop
    graphics?: string;
    keyboardTrackpad?: string;
    wireless?: string;
    ports?: string;
    audio?: string;
    webcam?: string;
    // TV
    hdrSupport?: string;
    pictureTechnology?: string;
    smartTvPlatform?: string;
    powerConsumption?: string;
    // Headphones / Audio
    driverSize?: string;
    soundProfile?: string;
    noiseCancellation?: string;
    microphones?: string;
    bluetoothVersion?: string;
    batteryLife?: string;
    controls?: string;
    waterResistance?: string;
    compatibility?: string;
    // Camera
    sensorType?: string;
    lensMount?: string;
    isoRange?: string;
    shutterSpeed?: string;
    videoRecording?: string;
    autofocus?: string;
    viewfinder?: string;
    // Smartwatch / Wearables
    healthFeatures?: string;
    fitnessTracking?: string;
    // Fallback dictionary for any extra custom WooCommerce attributes
    [key: string]: any;
  };
}

export interface ProductCategoryMeta {
  id: number;
  name: string;
  slug: string;
  parent?: number;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  type?: "simple" | "variable" | "grouped" | "external";
  hasVariations?: boolean;
  tagline: string;
  brand: string;
  category: CategoryType;
  categorySlugs?: string[];
  categoryIds?: number[];
  categories?: ProductCategoryMeta[];
  primaryCategory?: ProductCategoryMeta;
  categoryLabel: string;
  lifestyle?: LifestyleType[];
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: "FLAGSHIP" | "NEW" | "LIMITED" | "BEST SELLER" | "HOT" | "EDITOR CHOICE" | "FREE GIFT";
  images: string[];
  featuredImage: string;
  description: string;
  features: string[];
  variants: ProductVariant[];
  attributeGroups?: ProductAttributeGroup[];
  specs: ProductSpec[];
  structuredInfo?: ProductStructuredInfo;
  isFeatured?: boolean;
  isTrending?: boolean;
  isNewArrival?: boolean;
  isDeal?: boolean;
  discountPercentage?: number;
  emiAvailable?: boolean;
  freeDelivery?: boolean;
  expressDelivery?: boolean;
  freeGiftBundle?: FreeGiftBundle;
  sku?: string;
  inStock?: boolean;
  stockStatus?: "instock" | "outofstock" | "onbackorder";
}

export interface CategoryFilter {
  id: string;
  name: string;
  count: number;
}
