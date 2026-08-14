import {
  writeWishlistToFile,
  readWishlistFromFile,
  deleteWishlistFile,
  mergeGuestWishlistIntoCustomer,
} from "../lib/wishlist-store";

import {
  writeCartToFile,
  readCartFromFile,
  deleteCartFile,
} from "../lib/cart-store";

async function runPhase45Tests() {
  console.log("=== RUNNING PHASE 4.5 CUSTOMER-SPECIFIC WISHLIST ISOLATION TESTS ===");

  const cust3WishlistKey = "cust_3";
  const cust4WishlistKey = "cust_4";
  const guestWishlistKey = "guest_wishlist_sess_test99";

  const cust3CartKey = "cust_3";

  // Clean up any leftover test files
  await deleteWishlistFile(cust3WishlistKey);
  await deleteWishlistFile(cust4WishlistKey);
  await deleteWishlistFile(guestWishlistKey);
  await deleteCartFile(cust3CartKey);

  // 1. Customer #3 Wishlist & Cart Setup
  const cust3Products = ["101", "102"];
  const cust3CartItems = [{ id: "cart_item_a", productId: "301", quantity: 1 }];

  await writeWishlistToFile(cust3WishlistKey, cust3Products);
  await writeCartToFile(cust3CartKey, cust3CartItems);
  console.log("✓ Customer #3 wishlist & cart saved to disk (data/wishlists/cust_3.json & data/carts/cust_3.json).");

  // 2. Customer #4 Wishlist Setup
  const cust4Products = ["201"];
  await writeWishlistToFile(cust4WishlistKey, cust4Products);
  console.log("✓ Customer #4 wishlist saved to disk (data/wishlists/cust_4.json).");

  // 3. Customer Isolation Verification
  const restoredCust3Wishlist = await readWishlistFromFile(cust3WishlistKey);
  const restoredCust4Wishlist = await readWishlistFromFile(cust4WishlistKey);

  console.log("Customer #3 Wishlist:", restoredCust3Wishlist);
  console.log("Customer #4 Wishlist:", restoredCust4Wishlist);

  if (
    restoredCust3Wishlist.length === 2 &&
    restoredCust3Wishlist.includes("101") &&
    restoredCust3Wishlist.includes("102") &&
    !restoredCust3Wishlist.includes("201")
  ) {
    console.log("✓ CUSTOMER #3 WISHLIST ISOLATION PASSED!");
  } else {
    throw new Error("CUSTOMER #3 WISHLIST ISOLATION FAILED");
  }

  if (
    restoredCust4Wishlist.length === 1 &&
    restoredCust4Wishlist.includes("201") &&
    !restoredCust4Wishlist.includes("101")
  ) {
    console.log("✓ CUSTOMER #4 WISHLIST ISOLATION PASSED!");
  } else {
    throw new Error("CUSTOMER #4 WISHLIST ISOLATION FAILED");
  }

  // 4. Guest -> Customer Merge Test
  await writeWishlistToFile(guestWishlistKey, ["102", "103"]);
  await mergeGuestWishlistIntoCustomer(guestWishlistKey, cust3WishlistKey);

  const mergedCust3Wishlist = await readWishlistFromFile(cust3WishlistKey);
  if (
    mergedCust3Wishlist.length === 3 &&
    mergedCust3Wishlist.includes("101") &&
    mergedCust3Wishlist.includes("102") &&
    mergedCust3Wishlist.includes("103")
  ) {
    console.log("✓ GUEST WISHLIST MERGE PASSED: Guest wishlist merged into Customer #3 (Unique items: 101, 102, 103)!");
  } else {
    throw new Error("GUEST WISHLIST MERGE FAILED");
  }

  // 5. Cart Independence Test
  const restoredCust3Cart = await readCartFromFile(cust3CartKey);
  if (restoredCust3Cart.length === 1 && restoredCust3Cart[0].productId === "301") {
    console.log("✓ CART INDEPENDENCE TEST PASSED: Customer #3 cart remains completely intact and unaffected by wishlist operations!");
  } else {
    throw new Error("CART INDEPENDENCE TEST FAILED");
  }

  // Clean up test files
  await deleteWishlistFile(cust3WishlistKey);
  await deleteWishlistFile(cust4WishlistKey);
  await deleteWishlistFile(guestWishlistKey);
  await deleteCartFile(cust3CartKey);

  console.log("\n=== ALL PHASE 4.5 ACCEPTANCE TESTS PASSED SUCCESSFULLY! ===");
}

runPhase45Tests().catch((err) => {
  console.error("TEST SUITE ERROR:", err);
  process.exit(1);
});
