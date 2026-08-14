import { getDb } from "@/lib/firebase-admin";

const COLLECTION_NAME = "carts";

/**
 * Reads persistent cart items from Firestore.
 * Returns empty array [] if document does not exist.
 */
export async function readCartFromFile(cartKey: string): Promise<any[]> {
  if (!cartKey) return [];
  try {
    const db = getDb();
    const docRef = db.collection(COLLECTION_NAME).doc(cartKey);
    const snap = await docRef.get();

    if (!snap.exists) {
      return [];
    }

    const data = snap.data();
    if (data && Array.isArray(data.items)) {
      return data.items;
    }
  } catch (err: any) {
    console.error(`[CartStore/Firestore] Read error for ${cartKey}:`, err.message);
    throw err;
  }
  return [];
}

/**
 * Writes persistent cart items to Firestore for a specific cartKey.
 */
export async function writeCartToFile(cartKey: string, items: any[]): Promise<void> {
  if (!cartKey) return;
  try {
    const db = getDb();
    const docRef = db.collection(COLLECTION_NAME).doc(cartKey);
    const cleanItems = JSON.parse(JSON.stringify(items || []));
    await docRef.set(
      {
        cartKey,
        items: cleanItems,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err: any) {
    console.error(`[CartStore/Firestore] Write error for ${cartKey}:`, err.message);
    throw err;
  }
}

/**
 * Deletes a persistent cart document from Firestore.
 */
export async function deleteCartFile(cartKey: string): Promise<void> {
  if (!cartKey) return;
  try {
    const db = getDb();
    const docRef = db.collection(COLLECTION_NAME).doc(cartKey);
    await docRef.delete();
  } catch (err: any) {
    console.warn(`[CartStore/Firestore] Delete error for ${cartKey}:`, err.message);
  }
}

/**
 * Safely merges guest cart items into customer cart items in Firestore without duplicates using a transaction.
 */
export async function mergeGuestCartIntoCustomerCart(
  guestCartKey: string,
  customerCartKey: string
): Promise<any[]> {
  if (!guestCartKey || !customerCartKey || guestCartKey === customerCartKey) {
    return readCartFromFile(customerCartKey);
  }

  const db = getDb();
  const guestDocRef = db.collection(COLLECTION_NAME).doc(guestCartKey);
  const customerDocRef = db.collection(COLLECTION_NAME).doc(customerCartKey);

  try {
    let mergedItems: any[] = [];

    await db.runTransaction(async (transaction) => {
      const guestSnap = await transaction.get(guestDocRef);
      const customerSnap = await transaction.get(customerDocRef);

      const guestItems: any[] = guestSnap.exists && Array.isArray(guestSnap.data()?.items) ? guestSnap.data()!.items : [];
      const customerItems: any[] = customerSnap.exists && Array.isArray(customerSnap.data()?.items) ? customerSnap.data()!.items : [];

      if (guestItems.length === 0) {
        mergedItems = customerItems;
        return;
      }

      // Merge items based on composite item ID
      mergedItems = [...customerItems];
      guestItems.forEach((gItem) => {
        const existingIdx = mergedItems.findIndex((cItem) => cItem.id === gItem.id);
        if (existingIdx > -1) {
          mergedItems[existingIdx].quantity += gItem.quantity;
        } else {
          mergedItems.push(gItem);
        }
      });

      // Save merged customer cart document
      transaction.set(
        customerDocRef,
        {
          cartKey: customerCartKey,
          items: mergedItems,
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      // Clean up transient guest cart document
      transaction.delete(guestDocRef);
    });

    return mergedItems;
  } catch (err: any) {
    console.error(`[CartStore/Firestore] Transaction merge error for ${guestCartKey} -> ${customerCartKey}:`, err.message);
    return readCartFromFile(customerCartKey);
  }
}
