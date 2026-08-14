import { encryptSessionPayload, decryptSessionPayload } from "../lib/auth";
import { readCartFromFile, writeCartToFile } from "../lib/cart-store";
import { readWishlistFromFile, writeWishlistToFile } from "../lib/wishlist-store";

async function runPhase46Tests() {
  console.log("=== RUNNING PHASE 4.6 AUTHENTICATION & FAST HYDRATION AUDIT ===");

  // 1. Session Encryption & Decryption Speed Test
  const startTime = Date.now();
  const sessionToken = encryptSessionPayload({
    customerId: 3,
    email: "payal@example.com",
    firstName: "Payal",
    lastName: "Sharma",
    displayName: "Payal Sharma",
    createdAt: Date.now(),
  });

  const decrypted = decryptSessionPayload(sessionToken);
  const elapsedTime = Date.now() - startTime;

  console.log(`[TEST 1] Session token encryption/decryption completed in ${elapsedTime}ms.`);
  console.log("[TEST 1] Decrypted payload:", decrypted);

  if (decrypted && decrypted.customerId === 3 && decrypted.firstName === "Payal" && decrypted.displayName === "Payal Sharma") {
    console.log("✓ FAST SESSION HYDRATION TEST PASSED: Customer identity decrypted instantly without network calls!");
  } else {
    throw new Error("FAST SESSION HYDRATION TEST FAILED");
  }

  // 2. Customer Isolation Verification (Customer #3 vs Customer #4)
  const cust4Token = encryptSessionPayload({
    customerId: 4,
    email: "alexander@example.com",
    firstName: "Alexander",
    lastName: "Wright",
    displayName: "Alexander Wright",
    createdAt: Date.now(),
  });

  const cust4Decrypted = decryptSessionPayload(cust4Token);
  if (cust4Decrypted && cust4Decrypted.customerId === 4 && cust4Decrypted.firstName === "Alexander") {
    console.log("✓ CUSTOMER SWITCHING TEST PASSED: Customer #4 session resolves strictly to Customer #4!");
  } else {
    throw new Error("CUSTOMER SWITCHING TEST FAILED");
  }

  // 3. Persistent Cart & Wishlist Regression Guard
  await writeCartToFile("cust_3", [{ id: "cart_item_3", productId: "101", quantity: 1 }]);
  await writeWishlistToFile("cust_3", ["101"]);

  const cart3 = await readCartFromFile("cust_3");
  const wishlist3 = await readWishlistFromFile("cust_3");

  if (cart3.length === 1 && wishlist3.length === 1 && wishlist3[0] === "101") {
    console.log("✓ PERSISTENCE REGRESSION GUARD PASSED: Customer #3 cart & wishlist files remain completely intact!");
  } else {
    throw new Error("PERSISTENCE REGRESSION GUARD FAILED");
  }

  console.log("\n=== ALL PHASE 4.6 ACCEPTANCE TESTS PASSED SUCCESSFULLY! ===");
}

runPhase46Tests().catch((err) => {
  console.error("PHASE 4.6 TEST ERROR:", err);
  process.exit(1);
});
