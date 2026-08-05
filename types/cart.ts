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
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
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
}
