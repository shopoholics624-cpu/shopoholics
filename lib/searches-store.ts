import { getDb } from "@/lib/firebase-admin";

const COLLECTION_NAME = "recent_searches";
const MAX_SEARCHES = 10;

/**
 * Reads persistent recent searches from Firestore for a specific userKey or guestKey.
 * Returns an array of search strings.
 */
export async function readRecentSearches(key: string): Promise<string[]> {
  if (!key) return [];
  try {
    const db = getDb();
    const docRef = db.collection(COLLECTION_NAME).doc(key);
    const snap = await docRef.get();

    if (!snap.exists) {
      return [];
    }

    const data = snap.data();
    if (data && Array.isArray(data.searches)) {
      return data.searches.filter((s: any) => typeof s === "string" && s.trim().length > 0);
    }
  } catch (err: any) {
    console.error(`[SearchesStore/Firestore] Read error for ${key}:`, err.message);
  }
  return [];
}

/**
 * Adds or updates a search term for a userKey or guestKey.
 * Moves existing terms to the front, deduplicates, and limits to MAX_SEARCHES.
 */
export async function addRecentSearch(key: string, term: string): Promise<string[]> {
  if (!key) return [];
  const cleanTerm = term.trim().replace(/[\r\n\t]/g, " ");
  if (!cleanTerm || cleanTerm.length < 2 || cleanTerm.length > 60) {
    return readRecentSearches(key);
  }

  try {
    const current = await readRecentSearches(key);
    // Remove existing occurrence case-insensitively
    const filtered = current.filter((s) => s.toLowerCase() !== cleanTerm.toLowerCase());
    // Prepend new term
    const updated = [cleanTerm, ...filtered].slice(0, MAX_SEARCHES);

    const db = getDb();
    const docRef = db.collection(COLLECTION_NAME).doc(key);
    await docRef.set(
      {
        key,
        searches: updated,
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    return updated;
  } catch (err: any) {
    console.error(`[SearchesStore/Firestore] Write error for ${key}:`, err.message);
    return [];
  }
}

/**
 * Removes a specific search term for a userKey or guestKey.
 */
export async function removeRecentSearch(key: string, term: string): Promise<string[]> {
  if (!key || !term) return [];
  const cleanTerm = term.trim().toLowerCase();

  try {
    const current = await readRecentSearches(key);
    const updated = current.filter((s) => s.toLowerCase() !== cleanTerm);

    const db = getDb();
    const docRef = db.collection(COLLECTION_NAME).doc(key);
    if (updated.length === 0) {
      await docRef.delete();
    } else {
      await docRef.set(
        {
          key,
          searches: updated,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    }

    return updated;
  } catch (err: any) {
    console.error(`[SearchesStore/Firestore] Remove term error for ${key}:`, err.message);
    return [];
  }
}

/**
 * Clears all recent searches for a userKey or guestKey.
 */
export async function clearRecentSearches(key: string): Promise<void> {
  if (!key) return;
  try {
    const db = getDb();
    const docRef = db.collection(COLLECTION_NAME).doc(key);
    await docRef.delete();
  } catch (err: any) {
    console.warn(`[SearchesStore/Firestore] Delete error for ${key}:`, err.message);
  }
}
