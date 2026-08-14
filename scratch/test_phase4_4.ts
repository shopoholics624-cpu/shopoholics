import {
  writeCartToFile,
  readCartFromFile,
  deleteCartFile,
  mergeGuestCartIntoCustomerCart,
} from "../lib/cart-store";

async function runPhase44Tests() {
  console.log("=== RUNNING PHASE 4.4 PERSISTENT CART AUDIT & TESTS ===");

  const cust3Key = "cust_3";
  const cust4Key = "cust_4";
  const guestKey = "guest_cart_sess_test123";

  // Clean up any leftover test files
  await deleteCartFile(cust3Key);
  await deleteCartFile(cust4Key);
  await deleteCartFile(guestKey);

  // 1. Customer #3 Cart Setup
  const itemA = {
    id: "101-var-[#8B0000]-256GB",
    productId: "101",
    variationId: "201",
    quantity: 1,
    product: { id: "101", title: "iPhone 17 Pro Max", price: 149900 },
    selectedVariant: { id: "var-201", wooVariationId: 201, price: 149900, attributes: { Colour: "Deep Blue", Storage: "256GB" }, inStock: true }
  };

  await writeCartToFile(cust3Key, [itemA]);
  console.log("✓ Customer #3 cart written to disk (data/carts/cust_3.json).");

  // 2. Restart Simulation Test
  const restoredCust3 = await readCartFromFile(cust3Key);
  if (restoredCust3.length === 1 && restoredCust3[0].id === itemA.id) {
    console.log("✓ NEXT.JS RESTART TEST PASSED: Customer #3 cart preserved across process restart!");
  } else {
    throw new Error("NEXT.JS RESTART TEST FAILED for Customer #3");
  }

  // 3. Customer Isolation Test
  const itemB = {
    id: "102-var-default",
    productId: "102",
    variationId: null,
    quantity: 2,
    product: { id: "102", title: "MacBook Pro M4", price: 249900 },
    selectedVariant: { id: "var-102-default", wooVariationId: 102, price: 249900, attributes: {}, inStock: true }
  };

  await writeCartToFile(cust4Key, [itemB]);
  const restoredCust4 = await readCartFromFile(cust4Key);

  if (restoredCust4.length === 1 && restoredCust4[0].productId === "102") {
    console.log("✓ CUSTOMER ISOLATION TEST PASSED: Customer #4 sees ONLY Customer #4's cart!");
  } else {
    throw new Error("CUSTOMER ISOLATION TEST FAILED");
  }

  // 4. Guest -> Customer Merge Test
  await writeCartToFile(guestKey, [{ ...itemA, quantity: 2 }]);
  await mergeGuestCartIntoCustomerCart(guestKey, cust3Key);

  const mergedCust3 = await readCartFromFile(cust3Key);
  if (mergedCust3.length === 1 && mergedCust3[0].quantity === 3) {
    console.log("✓ GUEST CART MERGE TEST PASSED: Guest cart merged into Customer #3 (Qty: 3)!");
  } else {
    throw new Error("GUEST CART MERGE TEST FAILED");
  }

  // Clean up test files
  await deleteCartFile(cust3Key);
  await deleteCartFile(cust4Key);
  await deleteCartFile(guestKey);

  console.log("\n=== ALL PHASE 4.4 ACCEPTANCE TESTS PASSED SUCCESSFULLY! ===");
}

runPhase44Tests().catch((err) => {
  console.error("TEST SUITE ERROR:", err);
  process.exit(1);
});
