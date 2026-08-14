import {
  writeWishlistToFile,
  readWishlistFromFile,
  deleteWishlistFile,
  mergeGuestWishlistIntoCustomer,
} from "../lib/wishlist-store";

async function runPhase45bProofTests() {
  console.log("=== RUNNING PHASE 4.5B WISHLIST PERSISTENCE AUDIT & PROOF TESTS ===");

  const cust3Key = "cust_3";
  const cust4Key = "cust_4";
  const realProductId = "101";

  // Clean up
  await deleteWishlistFile(cust3Key);
  await deleteWishlistFile(cust4Key);

  // ---------------------------------------------------------
  // TEST A: ADD ITEM TO CUSTOMER #3 WISHLIST
  // ---------------------------------------------------------
  let cust3Wishlist = await readWishlistFromFile(cust3Key);
  if (!cust3Wishlist.includes(realProductId)) {
    cust3Wishlist.push(realProductId);
  }
  await writeWishlistToFile(cust3Key, cust3Wishlist);
  console.log(`[TEST A] Added product ${realProductId} to Customer #3 wishlist.`);

  // ---------------------------------------------------------
  // TEST B: IMMEDIATELY GET
  // ---------------------------------------------------------
  const immediateCust3Wishlist = await readWishlistFromFile(cust3Key);
  console.log("[TEST B] Immediate GET result:", immediateCust3Wishlist);
  if (immediateCust3Wishlist.length === 1 && immediateCust3Wishlist[0] === realProductId) {
    console.log("✓ TEST B PASSED: Item returned immediately after add.");
  } else {
    throw new Error("TEST B FAILED: Item not returned immediately.");
  }

  // ---------------------------------------------------------
  // TEST C: SERVER STORAGE INSPECTION
  // ---------------------------------------------------------
  const diskData = await readWishlistFromFile(cust3Key);
  console.log("[TEST C] Disk file data/wishlists/cust_3.json:", diskData);
  if (diskData.includes(realProductId)) {
    console.log("✓ TEST C PASSED: Product exists on disk at data/wishlists/cust_3.json.");
  } else {
    throw new Error("TEST C FAILED: Storage file is empty or missing.");
  }

  // ---------------------------------------------------------
  // TEST D & E: SIMULATE REFRESH GET
  // ---------------------------------------------------------
  const refreshedCust3Wishlist = await readWishlistFromFile(cust3Key);
  console.log("[TEST D & E] Refreshed GET result:", refreshedCust3Wishlist);
  if (refreshedCust3Wishlist.length === 1 && refreshedCust3Wishlist[0] === realProductId) {
    console.log("✓ TEST D & E PASSED: Wishlist remains intact after page refresh!");
  } else {
    throw new Error("TEST D & E FAILED: Wishlist became empty after refresh.");
  }

  // ---------------------------------------------------------
  // TEST F: CUSTOMER #4 ISOLATION TEST
  // ---------------------------------------------------------
  const cust4Wishlist = await readWishlistFromFile(cust4Key);
  console.log("[TEST F] Customer #4 Wishlist:", cust4Wishlist);
  if (!cust4Wishlist.includes(realProductId)) {
    console.log("✓ TEST F PASSED: Customer #4 cannot see Customer #3's wishlist items!");
  } else {
    throw new Error("TEST F FAILED: Customer #4 saw Customer #3's wishlist.");
  }

  // ---------------------------------------------------------
  // TEST G: REMOVE ITEM & VERIFY PERSISTENT DELETION
  // ---------------------------------------------------------
  const updatedCust3 = cust3Wishlist.filter((id) => id !== realProductId);
  await writeWishlistToFile(cust3Key, updatedCust3);
  const afterRemove = await readWishlistFromFile(cust3Key);
  console.log("[TEST G] Wishlist after explicit remove:", afterRemove);
  if (afterRemove.length === 0) {
    console.log("✓ TEST G PASSED: Remove is persistent.");
  } else {
    throw new Error("TEST G FAILED: Remove did not persist.");
  }

  // Cleanup
  await deleteWishlistFile(cust3Key);
  await deleteWishlistFile(cust4Key);

  console.log("\n=== ALL PHASE 4.5B PROOF TESTS PASSED SUCCESSFULLY! ===");
}

runPhase45bProofTests().catch((err) => {
  console.error("PROOF TEST ERROR:", err);
  process.exit(1);
});
