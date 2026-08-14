import fs from "fs/promises";
import path from "path";

const CARTS_DIR = path.join(process.cwd(), "data", "carts");

/**
 * Ensures the data/carts directory exists on disk.
 */
async function ensureCartsDirExists() {
  try {
    await fs.mkdir(CARTS_DIR, { recursive: true });
  } catch (err) {
    // Directory already exists or created
  }
}

/**
 * Returns the absolute path to a cart file on disk.
 */
function getCartFilePath(cartKey: string): string {
  // Sanitize cart key to prevent path traversal
  const safeKey = cartKey.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(CARTS_DIR, `${safeKey}.json`);
}

/**
 * Reads persistent cart items from disk.
 * Returns empty array [] if file does not exist.
 */
export async function readCartFromFile(cartKey: string): Promise<any[]> {
  if (!cartKey) return [];
  try {
    await ensureCartsDirExists();
    const filePath = getCartFilePath(cartKey);
    const data = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err: any) {
    if (err.code !== "ENOENT") {
      console.warn(`[CartStore] Read error for ${cartKey}:`, err.message);
    }
  }
  return [];
}

/**
 * Writes persistent cart items to disk for a specific cartKey.
 * Survives Next.js dev server process restarts, process kills, and system reboots.
 */
export async function writeCartToFile(cartKey: string, items: any[]): Promise<void> {
  if (!cartKey) return;
  try {
    await ensureCartsDirExists();
    const filePath = getCartFilePath(cartKey);
    const json = JSON.stringify(items || [], null, 2);
    await fs.writeFile(filePath, json, "utf-8");
  } catch (err: any) {
    console.error(`[CartStore] Write error for ${cartKey}:`, err.message);
  }
}

/**
 * Deletes a persistent cart file from disk (e.g. upon explicit Clear Cart or successful checkout).
 */
export async function deleteCartFile(cartKey: string): Promise<void> {
  if (!cartKey) return;
  try {
    const filePath = getCartFilePath(cartKey);
    await fs.unlink(filePath);
  } catch (err: any) {
    if (err.code !== "ENOENT") {
      console.warn(`[CartStore] Delete error for ${cartKey}:`, err.message);
    }
  }
}

/**
 * Safely merges guest cart items into customer cart items on disk without duplicates.
 */
export async function mergeGuestCartIntoCustomerCart(
  guestCartKey: string,
  customerCartKey: string
): Promise<any[]> {
  if (!guestCartKey || !customerCartKey || guestCartKey === customerCartKey) {
    return readCartFromFile(customerCartKey);
  }

  const guestItems = await readCartFromFile(guestCartKey);
  if (!guestItems || guestItems.length === 0) {
    return readCartFromFile(customerCartKey);
  }

  const customerItems = await readCartFromFile(customerCartKey);

  // Merge items based on composite item ID
  guestItems.forEach((gItem) => {
    const existingIdx = customerItems.findIndex((cItem) => cItem.id === gItem.id);
    if (existingIdx > -1) {
      customerItems[existingIdx].quantity += gItem.quantity;
    } else {
      customerItems.push(gItem);
    }
  });

  // Save merged customer cart
  await writeCartToFile(customerCartKey, customerItems);

  // Clean up transient guest cart file
  await deleteCartFile(guestCartKey);

  return customerItems;
}
