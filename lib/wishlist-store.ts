import fs from "fs/promises";
import path from "path";

const WISHLISTS_DIR = path.join(process.cwd(), "data", "wishlists");

/**
 * Ensures the data/wishlists directory exists on disk.
 */
async function ensureWishlistsDirExists() {
  try {
    await fs.mkdir(WISHLISTS_DIR, { recursive: true });
  } catch (err) {
    // Directory already exists or created
  }
}

/**
 * Returns the absolute path to a wishlist file on disk.
 */
function getWishlistFilePath(wishlistKey: string): string {
  // Sanitize key to prevent path traversal
  const safeKey = wishlistKey.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(WISHLISTS_DIR, `${safeKey}.json`);
}

/**
 * Reads persistent wishlist product IDs from disk.
 * Returns empty array [] if file does not exist.
 */
export async function readWishlistFromFile(wishlistKey: string): Promise<string[]> {
  if (!wishlistKey) return [];
  try {
    await ensureWishlistsDirExists();
    const filePath = getWishlistFilePath(wishlistKey);
    const data = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return Array.from(new Set(parsed.map((id) => String(id)).filter(Boolean)));
    }
  } catch (err: any) {
    if (err.code !== "ENOENT") {
      console.warn(`[WishlistStore] Read error for ${wishlistKey}:`, err.message);
    }
  }
  return [];
}

/**
 * Writes persistent wishlist product IDs to disk for a specific wishlistKey.
 * Survives Next.js dev server process restarts, process kills, and system reboots.
 */
export async function writeWishlistToFile(wishlistKey: string, productIds: string[]): Promise<void> {
  if (!wishlistKey) return;
  try {
    await ensureWishlistsDirExists();
    const filePath = getWishlistFilePath(wishlistKey);
    const uniqueIds = Array.from(new Set((productIds || []).map((id) => String(id)).filter(Boolean)));
    const json = JSON.stringify(uniqueIds, null, 2);
    await fs.writeFile(filePath, json, "utf-8");
  } catch (err: any) {
    console.error(`[WishlistStore] Write error for ${wishlistKey}:`, err.message);
  }
}

/**
 * Deletes a persistent wishlist file from disk.
 */
export async function deleteWishlistFile(wishlistKey: string): Promise<void> {
  if (!wishlistKey) return;
  try {
    const filePath = getWishlistFilePath(wishlistKey);
    await fs.unlink(filePath);
  } catch (err: any) {
    if (err.code !== "ENOENT") {
      console.warn(`[WishlistStore] Delete error for ${wishlistKey}:`, err.message);
    }
  }
}

/**
 * Safely merges guest wishlist product IDs into customer wishlist on disk without duplicates.
 */
export async function mergeGuestWishlistIntoCustomer(
  guestWishlistKey: string,
  customerWishlistKey: string
): Promise<string[]> {
  if (!guestWishlistKey || !customerWishlistKey || guestWishlistKey === customerWishlistKey) {
    return readWishlistFromFile(customerWishlistKey);
  }

  const guestIds = await readWishlistFromFile(guestWishlistKey);
  if (!guestIds || guestIds.length === 0) {
    return readWishlistFromFile(customerWishlistKey);
  }

  const customerIds = await readWishlistFromFile(customerWishlistKey);
  const merged = Array.from(new Set([...customerIds, ...guestIds]));

  // Save merged customer wishlist
  await writeWishlistToFile(customerWishlistKey, merged);

  // Clean up transient guest wishlist file
  await deleteWishlistFile(guestWishlistKey);

  return merged;
}
