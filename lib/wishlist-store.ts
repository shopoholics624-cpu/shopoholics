import { getDb } from "@/lib/firebase-admin";

const COLLECTION_NAME = "wishlists";

/**
 * Reads persistent wishlist product IDs from Firestore.
 * Returns empty array [] if document does not exist.
 */
export async function readWishlistFromFile(wishlistKey: string): Promise<string[]> {
  if (!wishlistKey) return [];
  try {
    const db = getDb();
    const docRef = db.collection(COLLECTION_NAME).doc(wishlistKey);
    const snap = await docRef.get();

    if (!snap.exists) {
      return [];
    }

    const data = snap.data();
    if (data && Array.isArray(data.productIds)) {
      return Array.from(new Set(data.productIds.map((id: any) => String(id)).filter(Boolean)));
    }
  } catch (err: any) {
    console.error(`[WishlistStore/Firestore] Read error for ${wishlistKey}:`, err.message);
    throw err;
  }
  return [];
}

/**
 * Writes persistent wishlist product IDs to Firestore for a specific wishlistKey.
 */
export async function writeWishlistToFile(wishlistKey: string, productIds: string[]): Promise<void> {
  if (!wishlistKey) return;
  try {
    const db = getDb();
    const docRef = db.collection(COLLECTION_NAME).doc(wishlistKey);
    const uniqueIds = Array.from(new Set((productIds || []).map((id) => String(id)).filter(Boolean)));
    await docRef.set(
      {
        wishlistKey,
        productIds: uniqueIds,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err: any) {
    console.error(`[WishlistStore/Firestore] Write error for ${wishlistKey}:`, err.message);
    throw err;
  }
}

/**
 * Deletes a persistent wishlist document from Firestore.
 */
export async function deleteWishlistFile(wishlistKey: string): Promise<void> {
  if (!wishlistKey) return;
  try {
    const db = getDb();
    const docRef = db.collection(COLLECTION_NAME).doc(wishlistKey);
    await docRef.delete();
  } catch (err: any) {
    console.warn(`[WishlistStore/Firestore] Delete error for ${wishlistKey}:`, err.message);
  }
}

/**
 * Safely merges guest wishlist product IDs into customer wishlist in Firestore without duplicates using a transaction.
 */
export async function mergeGuestWishlistIntoCustomer(
  guestWishlistKey: string,
  customerWishlistKey: string
): Promise<string[]> {
  if (!guestWishlistKey || !customerWishlistKey || guestWishlistKey === customerWishlistKey) {
    return readWishlistFromFile(customerWishlistKey);
  }

  const db = getDb();
  const guestDocRef = db.collection(COLLECTION_NAME).doc(guestWishlistKey);
  const customerDocRef = db.collection(COLLECTION_NAME).doc(customerWishlistKey);

  try {
    let mergedIds: string[] = [];

    await db.runTransaction(async (transaction) => {
      const guestSnap = await transaction.get(guestDocRef);
      const customerSnap = await transaction.get(customerDocRef);

      const guestIds: string[] = guestSnap.exists && Array.isArray(guestSnap.data()?.productIds) ? guestSnap.data()!.productIds : [];
      const customerIds: string[] = customerSnap.exists && Array.isArray(customerSnap.data()?.productIds) ? customerSnap.data()!.productIds : [];

      if (guestIds.length === 0) {
        mergedIds = customerIds;
        return;
      }

      mergedIds = Array.from(new Set([...customerIds.map(String), ...guestIds.map(String)]));

      // Save merged customer wishlist document
      transaction.set(
        customerDocRef,
        {
          wishlistKey: customerWishlistKey,
          productIds: mergedIds,
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      // Clean up transient guest wishlist document
      transaction.delete(guestDocRef);
    });

    return mergedIds;
  } catch (err: any) {
    console.error(`[WishlistStore/Firestore] Transaction merge error for ${guestWishlistKey} -> ${customerWishlistKey}:`, err.message);
    return readWishlistFromFile(customerWishlistKey);
  }
}
