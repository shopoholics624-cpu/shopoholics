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
  category: "Display" | "Performance" | "Camera" | "Battery" | "Design" | "Connectivity";
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: "smartphones" | "laptops" | "audio" | "wearables" | "accessories";
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: "FLAGSHIP" | "NEW" | "LIMITED" | "BEST SELLER";
  images: string[];
  featuredImage: string;
  description: string;
  features: string[];
  variants: ProductVariant[];
  specs: ProductSpec[];
  isFeatured?: boolean;
}

export interface CategoryFilter {
  id: string;
  name: string;
  count: number;
}
