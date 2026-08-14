import fs from "fs";
import path from "path";

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

import { getWooProductById, getWooProductVariations, getWooVariationById } from "../lib/woocommerce";
import { readCartFromFile, writeCartToFile, deleteCartFile } from "../lib/cart-store";

async function testCartIntegration() {
  console.log("==================================================");
  console.log("TESTING WOOCOMMERCE -> CART INTEGRATION RESOLUTION");
  console.log("==================================================");

  const testCartKey = "cust_3";
  await deleteCartFile(testCartKey);

  // 1. TEST SIMPLE PRODUCT LOOKUP & VALIDATION
  console.log("\n[TEST 1] Testing Simple Product Validation (ID: 5980)...");
  const simpleProduct = await getWooProductById("5980");
  if (!simpleProduct) {
    throw new Error("Simple product 5980 could not be fetched from WooCommerce.");
  }
  console.log("Fetched simple product:", {
    id: simpleProduct.id,
    title: simpleProduct.title,
    type: simpleProduct.type,
    price: simpleProduct.price,
    inStock: simpleProduct.inStock,
    stockStatus: simpleProduct.stockStatus,
  });

  if (simpleProduct.inStock === false || simpleProduct.stockStatus === "outofstock") {
    throw new Error("TEST 1 FAILED: Simple product 5980 incorrectly marked as out of stock.");
  }
  console.log("✓ TEST 1 PASSED: Simple product 5980 is VALID and AVAILABLE.");

  // 2. TEST VARIABLE PRODUCT & SPECIFIC VARIATION LOOKUP
  console.log("\n[TEST 2] Testing Variable Product & Variation Lookup (Product: 6076, Var: 6088)...");
  const varProduct = await getWooProductById("6076");
  const rawVar = await getWooVariationById("6076", "6088");

  if (!varProduct || !rawVar) {
    throw new Error("Variable product 6076 or variation 6088 could not be fetched.");
  }
  console.log("Fetched variation details:", {
    varId: rawVar.id,
    price: rawVar.price,
    purchasable: rawVar.purchasable,
    stock_status: rawVar.stock_status,
    manage_stock: (rawVar as any).manage_stock,
    stock_quantity: (rawVar as any).stock_quantity,
  });

  const isVarAvailable = rawVar.purchasable !== false && rawVar.stock_status !== "outofstock";
  if (!isVarAvailable) {
    throw new Error("TEST 2 FAILED: Variation 6088 incorrectly marked as unavailable.");
  }
  console.log("✓ TEST 2 PASSED: Variation 6088 is VALID and AVAILABLE.");

  // 3. TEST CART FIRESTORE PERSISTENCE WITH WOOCOMMERCE DATA
  console.log("\n[TEST 3] Testing Cart Storage & Firestore Revalidation...");
  const cartItemSimple = {
    id: "5980-var-default",
    productId: "5980",
    variationId: null,
    product: simpleProduct,
    selectedVariant: {
      id: "var-5980-default",
      wooVariationId: 5980,
      sku: simpleProduct.sku || "SKU-5980",
      name: simpleProduct.title,
      colorName: "Standard",
      colorHex: "#8B0000",
      attributes: {},
      price: simpleProduct.price,
      image: simpleProduct.featuredImage,
      inStock: true,
      stockStatus: "instock",
    },
    quantity: 1,
    hasProtectionPlan: false,
    protectionPlanCost: 990,
    sku: simpleProduct.sku || "SKU-5980",
    selectedAttributes: {},
  };

  const cartItemVar = {
    id: "6076-var-6088",
    productId: "6076",
    variationId: 6088,
    product: varProduct,
    selectedVariant: {
      id: "var-6088",
      wooVariationId: 6088,
      sku: rawVar.sku || "SKU-6088",
      name: "Selected Variation",
      colorName: "Natural Titanium",
      colorHex: "#8B0000",
      storage: "1TB",
      attributes: { Storage: "1TB" },
      price: parseFloat(rawVar.price),
      image: rawVar.image?.src || varProduct.featuredImage,
      inStock: true,
      stockStatus: "instock",
    },
    quantity: 1,
    hasProtectionPlan: false,
    protectionPlanCost: 990,
    sku: rawVar.sku || "SKU-6088",
    selectedAttributes: { Storage: "1TB" },
  };

  await writeCartToFile(testCartKey, [cartItemSimple, cartItemVar]);

  const retrievedCart = await readCartFromFile(testCartKey);
  console.log(`Retrieved ${retrievedCart.length} items from Firestore cart cust_3.`);

  const simpleInCart = retrievedCart.find((i) => i.productId === "5980");
  const varInCart = retrievedCart.find((i) => i.productId === "6076");

  if (!simpleInCart || !varInCart) {
    throw new Error("TEST 3 FAILED: Cart items could not be retrieved from Firestore.");
  }

  if (simpleInCart.selectedVariant.inStock === false || varInCart.selectedVariant.inStock === false) {
    throw new Error("TEST 3 FAILED: Firestore cart items returned inStock: false.");
  }

  console.log("✓ TEST 3 PASSED: Both simple and variable products successfully persisted and retrieved with inStock: true!");

  // Clean up
  await deleteCartFile(testCartKey);
  console.log("\n==================================================");
  console.log("ALL WOOCOMMERCE CART INTEGRATION TESTS PASSED! ✓");
  console.log("==================================================");
}

testCartIntegration().catch((err) => {
  console.error("CART INTEGRATION TEST FAILED:", err);
  process.exit(1);
});
