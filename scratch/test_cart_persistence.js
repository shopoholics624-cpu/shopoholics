const fs = require('fs');
const path = require('path');

// Test writing and reading persistent customer cart file
const cartStore = require('../lib/cart-store');

async function testCartPersistence() {
  const custCartKey = "cust_3";
  const testItem = {
    id: "101-var-202",
    productId: "101",
    variationId: "202",
    quantity: 2,
    product: { id: "101", title: "iPhone 17 Pro Max", price: 149900 },
    selectedVariant: { id: "var-202", wooVariationId: 202, price: 149900, attributes: { Storage: "256GB" } }
  };

  console.log("Writing test customer cart for cust_3...");
  await cartStore.writeCartToFile(custCartKey, [testItem]);

  console.log("Reading test customer cart for cust_3...");
  const restored = await cartStore.readCartFromFile(custCartKey);
  console.log("Restored Cart Item Count:", restored.length);
  console.log("Restored Product Title:", restored[0]?.product?.title);
  console.log("Restored Quantity:", restored[0]?.quantity);

  if (restored.length === 1 && restored[0].product.title === "iPhone 17 Pro Max") {
    console.log("SUCCESS: Customer cart persistence test passed!");
  } else {
    console.error("FAIL: Customer cart restoration failed.");
  }
}

testCartPersistence().catch(console.error);
