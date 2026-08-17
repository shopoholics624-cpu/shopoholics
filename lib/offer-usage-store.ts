import { getDb } from "@/lib/firebase-admin";

const USAGE_COLLECTION = "customer_offer_usage";

export interface OfferUsageRecord {
  usedCount: number;
  lastUsedAt: number;
  orderIds?: string[];
}

export type CustomerOfferUsageMap = Record<string, OfferUsageRecord>;

function getWooCredentials() {
  const url = process.env.WOOCOMMERCE_URL;
  const key = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

  if (!url || !key || !secret) return null;
  return {
    baseUrl: url.replace(/\/+$/, ""),
    authHeader: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
  };
}

/**
 * Reads persistent offer usage history for a customer account from Firestore.
 */
export async function getCustomerOfferUsage(customerId: number): Promise<CustomerOfferUsageMap> {
  if (!customerId || customerId <= 0) return {};

  try {
    const db = getDb();
    const docRef = db.collection(USAGE_COLLECTION).doc(`cust_${customerId}`);
    const snap = await docRef.get();

    if (!snap.exists) {
      return {};
    }

    const data = snap.data();
    return (data?.offers as CustomerOfferUsageMap) || {};
  } catch (err: any) {
    console.warn(`[OfferUsageStore] Error reading usage for customer ${customerId}:`, err.message);
    return {};
  }
}

/**
 * Commits offer usage for a customer account upon successful order placement.
 */
export async function recordCustomerOfferUsage(
  customerId: number,
  offerId: string,
  orderId: string
): Promise<void> {
  if (!customerId || !offerId) return;

  try {
    const db = getDb();
    const docRef = db.collection(USAGE_COLLECTION).doc(`cust_${customerId}`);
    const snap = await docRef.get();

    const existingData = snap.exists ? snap.data() : {};
    const existingOffers: CustomerOfferUsageMap = existingData?.offers || {};
    const currentOfferUsage = existingOffers[offerId] || { usedCount: 0, lastUsedAt: 0, orderIds: [] };

    const updatedOfferUsage: OfferUsageRecord = {
      usedCount: (currentOfferUsage.usedCount || 0) + 1,
      lastUsedAt: Date.now(),
      orderIds: Array.from(new Set([...(currentOfferUsage.orderIds || []), String(orderId)])),
    };

    await docRef.set(
      {
        customerId,
        offers: {
          ...existingOffers,
          [offerId]: updatedOfferUsage,
        },
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err: any) {
    console.error(`[OfferUsageStore] Error recording offer ${offerId} for customer ${customerId}:`, err.message);
  }
}

/**
 * Checks the customer's total confirmed order count across WooCommerce and Firestore.
 */
export async function getCustomerTotalOrderCount(customerId: number): Promise<number> {
  if (!customerId || customerId <= 0) return 0;

  let count = 0;
  const creds = getWooCredentials();

  if (creds) {
    try {
      const res = await fetch(
        `${creds.baseUrl}/wp-json/wc/v3/orders?customer=${customerId}&per_page=1&status=processing,completed,on-hold,pending`,
        {
          headers: { Authorization: creds.authHeader },
          cache: "no-store",
        }
      );

      if (res.ok) {
        const totalHeader = res.headers.get("x-wp-total");
        if (totalHeader) {
          const parsed = parseInt(totalHeader, 10);
          if (!isNaN(parsed)) {
            count = Math.max(count, parsed);
          }
        } else {
          const orders = await res.json();
          if (Array.isArray(orders)) {
            count = Math.max(count, orders.length);
          }
        }
      }
    } catch (err) {
      console.warn(`[OfferUsageStore] Error querying WooCommerce orders for customer ${customerId}:`, err);
    }
  }

  return count;
}
