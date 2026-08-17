import { getDb } from "@/lib/firebase-admin";

const COLLECTION_NAME = "compares";
const MAX_COMPARE_LIMIT = 4;

/**
 * Reads persistent compare product IDs from Firestore.
 * Returns empty array [] if document does not exist.
 */
export async function readCompareFromFile(compareKey: string): Promise<string[]> {
  if (!compareKey) return [];
  try {
    const db = getDb();
    const docRef = db.collection(COLLECTION_NAME).doc(compareKey);
    const snap = await docRef.get();

    if (!snap.exists) {
      return [];
    }

    const data = snap.data();
    if (data && Array.isArray(data.productIds)) {
      return Array.from(new Set(data.productIds.map((id: any) => String(id)).filter(Boolean))).slice(0, MAX_COMPARE_LIMIT);
    }
  } catch (err: any) {
    console.error(`[CompareStore/Firestore] Read error for ${compareKey}:`, err.message);
    throw err;
  }
  return [];
}

/**
 * Writes persistent compare product IDs to Firestore for a specific compareKey.
 */
export async function writeCompareToFile(compareKey: string, productIds: string[]): Promise<void> {
  if (!compareKey) return;
  try {
    const db = getDb();
    const docRef = db.collection(COLLECTION_NAME).doc(compareKey);
    const uniqueIds = Array.from(new Set((productIds || []).map((id) => String(id)).filter(Boolean))).slice(0, MAX_COMPARE_LIMIT);
    await docRef.set(
      {
        compareKey,
        productIds: uniqueIds,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err: any) {
    console.error(`[CompareStore/Firestore] Write error for ${compareKey}:`, err.message);
    throw err;
  }
}

/**
 * Deletes a persistent compare document from Firestore.
 */
export async function deleteCompareFile(compareKey: string): Promise<void> {
  if (!compareKey) return;
  try {
    const db = getDb();
    const docRef = db.collection(COLLECTION_NAME).doc(compareKey);
    await docRef.delete();
  } catch (err: any) {
    console.warn(`[CompareStore/Firestore] Delete error for ${compareKey}:`, err.message);
  }
}

/**
 * Safely merges guest compare product IDs into customer compare list in Firestore without duplicates using a transaction.
 */
export async function mergeGuestCompareIntoCustomer(
  guestCompareKey: string,
  customerCompareKey: string
): Promise<string[]> {
  if (!guestCompareKey || !customerCompareKey || guestCompareKey === customerCompareKey) {
    return readCompareFromFile(customerCompareKey);
  }

  const db = getDb();
  const guestDocRef = db.collection(COLLECTION_NAME).doc(guestCompareKey);
  const customerDocRef = db.collection(COLLECTION_NAME).doc(customerCompareKey);

  try {
    let mergedIds: string[] = [];

    await db.runTransaction(async (transaction) => {
      const guestSnap = await transaction.get(guestDocRef);
      const customerSnap = await transaction.get(customerDocRef);

      const guestIds: string[] = guestSnap.exists && Array.isArray(guestSnap.data()?.productIds) ? guestSnap.data()!.productIds : [];
      const customerIds: string[] = customerSnap.exists && Array.isArray(customerSnap.data()?.productIds) ? customerSnap.data()!.productIds : [];

      if (guestIds.length === 0) {
        mergedIds = customerIds.slice(0, MAX_COMPARE_LIMIT);
        return;
      }

      mergedIds = Array.from(new Set([...customerIds.map(String), ...guestIds.map(String)])).slice(0, MAX_COMPARE_LIMIT);

      // Save merged customer compare document
      transaction.set(
        customerDocRef,
        {
          compareKey: customerCompareKey,
          productIds: mergedIds,
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      // Clean up transient guest compare document
      transaction.delete(guestDocRef);
    });

    return mergedIds;
  } catch (err: any) {
    console.error(`[CompareStore/Firestore] Transaction merge error for ${guestCompareKey} -> ${customerCompareKey}:`, err.message);
    return readCompareFromFile(customerCompareKey);
  }
}
