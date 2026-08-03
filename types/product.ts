export interface ProductVariant {
  id: string;
  name: string;
  colorName: string;
  colorHex: string;
  storage?: string;
  price: number;
  originalPrice?: number;
  image: string;
  inStock: boolean;
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

export interface Product {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  brand: string;
  category: CategoryType;
  categoryLabel: string;
  lifestyle?: LifestyleType[];
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: "FLAGSHIP" | "NEW" | "LIMITED" | "BEST SELLER" | "HOT" | "EDITOR CHOICE";
  images: string[];
  featuredImage: string;
  description: string;
  features: string[];
  variants: ProductVariant[];
  specs: ProductSpec[];
  isFeatured?: boolean;
  isTrending?: boolean;
  isNewArrival?: boolean;
  isDeal?: boolean;
  discountPercentage?: number;
  emiAvailable?: boolean;
  freeDelivery?: boolean;
  expressDelivery?: boolean;
}

export interface CategoryFilter {
  id: string;
  name: string;
  count: number;
}
