import { Product, ProductVariant } from "./product";

export interface CartItem {
  id: string;
  product: Product;
  selectedVariant: ProductVariant;
  quantity: number;
  hasProtectionPlan: boolean;
  protectionPlanCost: number;
  isFreeGift?: boolean;
  parentProductId?: string;
  freeGiftDetails?: {
    headline: string;
    giftTitle: string;
    giftImage: string;
    giftOriginalPrice: number;
    giftDescription: string;
    badgeText: string;
  };
  productId?: string;
  variationId?: number | string | null;
  sku?: string;
  selectedAttributes?: Record<string, string>;
  inStock: boolean;
  unavailable?: boolean;
}

export interface AppliedCartOffer {
  id: string;
  title: string;
  code: string;
  discountType: "percent" | "fixed";
  discountAmount: number;
  applyTo: "entire_store" | "category" | "products";
  targetCategory?: string;
  targetProductIds?: number[];
  usageRule?: string;
  maxEligibleQuantity?: number | null;
  calculatedDiscount: number;
  eligibleItemsCount: number;
  description?: string;
}

export interface WooCommerceCartTotals {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  total: number;
  totalQuantity: number;
  appliedOffer?: AppliedCartOffer | null;
}

export interface GstDetails {
  isGstRequired: boolean;
  gstin: string;
  businessName: string;
  businessAddress?: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  fullName?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  gstDetails?: GstDetails;
}

export interface PaymentDetails {
  method: "card" | "apple_pay" | "crypto";
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
  cardName?: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  status: "Processing" | "Shipped" | "In Transit" | "Delivered";
  trackingNumber: string;
  estimatedDelivery: string;
  gstDetails?: GstDetails;
}
