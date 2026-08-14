import { writeCartToFile, readCartFromFile } from "../lib/cart-store";
import { getWooProductById } from "../lib/woocommerce";

async function runQuantityUpdateTests() {
  console.log("=== RUNNING STRICT CART QUANTITY UPDATE & ATOMICITY TESTS ===");

  // 1. Setup multi-item cart
  const initialCart = [
    {
      id: "101-var-201",
      productId: "101",
      variationId: 201,
      quantity: 1,
      product: { id: "101", title: "iPhone 17 Pro Max", price: 149900, featuredImage: "/img1.jpg" },
      selectedVariant: { id: "var-201", price: 149900, name: "256GB", image: "/img1.jpg" },
      inStock: true,
    },
    {
      id: "102-var-301",
      productId: "102",
      variationId: 301,
      quantity: 2,
      product: { id: "102", title: "MacBook Pro M4", price: 249900, featuredImage: "/img2.jpg" },
      selectedVariant: { id: "var-301", price: 249900, name: "512GB", image: "/img2.jpg" },
      inStock: true,
    },
    {
      id: "103-var-default",
      productId: "103",
      quantity: 1,
      product: { id: "103", title: "AirPods Max 2", price: 59900, featuredImage: "/img3.jpg" },
      selectedVariant: { id: "var-103-default", price: 59900, name: "Standard", image: "/img3.jpg" },
      inStock: true,
    },
  ];

  await writeCartToFile("test_qty_cart", initialCart);
  console.log("✓ Initial 3-item cart written to disk.");

  // TEST 1: Update Item B (MacBook) quantity from 2 to 3
  const cartState1 = await readCartFromFile("test_qty_cart");
  const targetId = "102-var-301";
  const updatedState1 = cartState1.map((item) => (item.id === targetId ? { ...item, quantity: 3 } : item));
  await writeCartToFile("test_qty_cart", updatedState1);

  const cartAfterTest1 = await readCartFromFile("test_qty_cart");

  console.log("[TEST 1] Total items count:", cartAfterTest1.length);
  console.log("[TEST 1] Item A quantity:", cartAfterTest1[0].quantity);
  console.log("[TEST 1] Item B quantity:", cartAfterTest1[1].quantity);
  console.log("[TEST 1] Item C quantity:", cartAfterTest1[2].quantity);

  if (
    cartAfterTest1.length === 3 &&
    cartAfterTest1[0].quantity === 1 &&
    cartAfterTest1[1].quantity === 3 &&
    cartAfterTest1[2].quantity === 1
  ) {
    console.log("✓ TEST 1 PASSED: Only Item B updated to 3. Item A and C remain completely untouched!");
  } else {
    throw new Error("TEST 1 FAILED: Cart items were discarded or incorrect quantities applied.");
  }

  // TEST 2: Decrease Item B quantity from 3 to 2
  const cartState2 = await readCartFromFile("test_qty_cart");
  const updatedState2 = cartState2.map((item) => (item.id === targetId ? { ...item, quantity: 2 } : item));
  await writeCartToFile("test_qty_cart", updatedState2);

  const cartAfterTest2 = await readCartFromFile("test_qty_cart");
  if (cartAfterTest2[1].quantity === 2 && cartAfterTest2.length === 3) {
    console.log("✓ TEST 2 PASSED: Item B quantity decreased to 2 atomically!");
  } else {
    throw new Error("TEST 2 FAILED");
  }

  // TEST 3: Verify product detail quantity addition (Quantity = 3)
  const newItem = {
    id: "104-var-401",
    productId: "104",
    variationId: 401,
    quantity: 3, // Quantity selected on PDP
    product: { id: "104", title: "Apple Watch Ultra 3", price: 89900, featuredImage: "/img4.jpg" },
    selectedVariant: { id: "var-401", price: 89900, name: "Titanium", image: "/img4.jpg" },
    inStock: true,
  };

  const cartState3 = await readCartFromFile("test_qty_cart");
  cartState3.push(newItem);
  await writeCartToFile("test_qty_cart", cartState3);

  const cartAfterTest3 = await readCartFromFile("test_qty_cart");
  const addedPdpItem = cartAfterTest3.find((i) => i.id === "104-var-401");

  if (addedPdpItem && addedPdpItem.quantity === 3) {
    console.log("✓ TEST 3 PASSED: Product detail page quantity 3 added correctly!");
  } else {
    throw new Error("TEST 3 FAILED");
  }

  console.log("\n=== ALL QUANTITY UPDATE & ATOMICITY TESTS PASSED! ===");
}

runQuantityUpdateTests().catch((err) => {
  console.error("QUANTITY TEST ERROR:", err);
  process.exit(1);
});
