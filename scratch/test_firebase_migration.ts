import fs from "fs";
import path from "path";

// Load environment variables from .env.local
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const lines = envContent.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}
loadEnvLocal();

import {
  readCartFromFile,
  writeCartToFile,
  deleteCartFile,
  mergeGuestCartIntoCustomerCart,
} from "../lib/cart-store";
import {
  readWishlistFromFile,
  writeWishlistToFile,
  deleteWishlistFile,
  mergeGuestWishlistIntoCustomer,
} from "../lib/wishlist-store";
import { getDb } from "../lib/firebase-admin";

async function runMigrationTests() {
  console.log("==================================================");
  console.log("FIREBASE FIRESTORE CART & WISHLIST MIGRATION SUITE");
  console.log("==================================================");

  // 1. Clean up test keys in Firestore
  const testKeys = ["guest_test_100", "cust_3", "cust_4", "guest_wish_100"];
  for (const k of testKeys) {
    await deleteCartFile(k);
    await deleteWishlistFile(k);
  }

  // TEST A: Guest Cart Firestore Persistence
  console.log("\n[TEST A] Guest Cart Firestore Persistence...");
  const dummyItem1 = {
    id: "p101-var-default",
    productId: 101,
    variationId: 0,
    selectedAttributes: {},
    quantity: 2,
    product: { id: 101, name: "Wireless Headphones", price: 2999 },
  };
  await writeCartToFile("guest_test_100", [dummyItem1]);
  let cartA = await readCartFromFile("guest_test_100");
  if (cartA.length === 1 && cartA[0].id === "p101-var-default" && cartA[0].quantity === 2) {
    console.log("✓ TEST A PASSED: Guest cart persisted and retrieved from Firestore.");
  } else {
    throw new Error("TEST A FAILED: Cart items match failed.");
  }

  // TEST B: Customer Cart & Isolation (Customer 3 vs Customer 4)
  console.log("\n[TEST B] Customer Cart Isolation (Cust 3 vs Cust 4)...");
  const cust3Item = {
    id: "p202-var-default",
    productId: 202,
    variationId: 0,
    selectedAttributes: {},
    quantity: 1,
    product: { id: 202, name: "Smart Watch", price: 4999 },
  };
  const cust4Item = {
    id: "p303-var-default",
    productId: 303,
    variationId: 0,
    selectedAttributes: {},
    quantity: 5,
    product: { id: 303, name: "Bluetooth Speaker", price: 1999 },
  };
  await writeCartToFile("cust_3", [cust3Item]);
  await writeCartToFile("cust_4", [cust4Item]);

  const cust3Cart = await readCartFromFile("cust_3");
  const cust4Cart = await readCartFromFile("cust_4");

  if (cust3Cart[0]?.productId === 202 && cust4Cart[0]?.productId === 303 && cust3Cart.length === 1 && cust4Cart.length === 1) {
    console.log("✓ TEST B PASSED: Customer 3 cart (id=202) is strictly isolated from Customer 4 cart (id=303).");
  } else {
    throw new Error("TEST B FAILED: Customer isolation check failed.");
  }

  // TEST C: Wishlist Persistence & Isolation
  console.log("\n[TEST C] Wishlist Persistence & Isolation...");
  await writeWishlistToFile("cust_3", ["101", "202"]);
  await writeWishlistToFile("cust_4", ["303"]);

  const cust3Wish = await readWishlistFromFile("cust_3");
  const cust4Wish = await readWishlistFromFile("cust_4");

  if (cust3Wish.includes("101") && cust3Wish.includes("202") && cust4Wish.includes("303") && !cust4Wish.includes("101")) {
    console.log("✓ TEST C PASSED: Customer 3 wishlist ['101', '202'] is isolated from Customer 4 wishlist ['303'].");
  } else {
    throw new Error("TEST C FAILED: Wishlist isolation check failed.");
  }

  // TEST D: Guest -> Customer Cart & Wishlist Merge
  console.log("\n[TEST D] Guest -> Customer Merge...");
  // Guest cart contains item 101 (qty 2). Customer 3 cart contains item 101 (qty 1) & item 202 (qty 1).
  await writeCartToFile("guest_test_100", [{ ...dummyItem1, quantity: 2 }]);
  await writeCartToFile("cust_3", [{ ...dummyItem1, quantity: 1 }, cust3Item]);

  const mergedCart = await mergeGuestCartIntoCustomerCart("guest_test_100", "cust_3");
  const guestCartAfterMerge = await readCartFromFile("guest_test_100");

  const item101 = mergedCart.find((i) => i.productId === 101);
  if (item101 && item101.quantity === 3 && mergedCart.length === 2 && guestCartAfterMerge.length === 0) {
    console.log("✓ TEST D1 PASSED: Guest cart merged into Customer 3 (qty 1 + 2 = 3) and guest cart doc was deleted from Firestore.");
  } else {
    throw new Error(`TEST D1 FAILED: Merged cart quantity expected 3, got ${item101?.quantity}`);
  }

  // Wishlist Merge
  await writeWishlistToFile("guest_wish_100", ["505", "101"]);
  await writeWishlistToFile("cust_3", ["101", "202"]);
  const mergedWish = await mergeGuestWishlistIntoCustomer("guest_wish_100", "cust_3");
  const guestWishAfterMerge = await readWishlistFromFile("guest_wish_100");

  if (mergedWish.includes("505") && mergedWish.includes("101") && mergedWish.includes("202") && guestWishAfterMerge.length === 0) {
    console.log("✓ TEST D2 PASSED: Guest wishlist merged into Customer 3 wishlist and guest wishlist doc was deleted.");
  } else {
    throw new Error("TEST D2 FAILED: Wishlist merge failed.");
  }

  // TEST E: Account Deletion Cleanup
  console.log("\n[TEST E] Account Deletion Cleanup...");
  await deleteCartFile("cust_3");
  await deleteWishlistFile("cust_3");

  const deletedCart = await readCartFromFile("cust_3");
  const deletedWish = await readWishlistFromFile("cust_3");

  if (deletedCart.length === 0 && deletedWish.length === 0) {
    console.log("✓ TEST E PASSED: Customer 3 cart & wishlist documents deleted from Firestore.");
  } else {
    throw new Error("TEST E FAILED: Deletion cleanup check failed.");
  }

  // Clean up remaining test keys
  for (const k of testKeys) {
    await deleteCartFile(k);
    await deleteWishlistFile(k);
  }

  console.log("\n==================================================");
  console.log("ALL FIREBASE MIGRATION TESTS PASSED SUCCESSFULLY! ✓");
  console.log("==================================================");
}

runMigrationTests().catch((err) => {
  console.error("MIGRATION TEST SUITE ERROR:", err);
  process.exit(1);
});
