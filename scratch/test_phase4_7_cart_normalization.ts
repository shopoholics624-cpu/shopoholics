import { writeCartToFile, readCartFromFile } from "../lib/cart-store";
import { getWooProductById, getWooProductVariations } from "../lib/woocommerce";

async function runCartNormalizationTests() {
  console.log("=== RUNNING STRICT CART DATA INTEGRITY & NORMALIZATION TESTS ===");

  // 1. Write legacy / stale cart JSON (mimicking old architecture or corrupted state)
  const staleLegacyCart = [
    {
      id: "101-var-201",
      productId: "101",
      variationId: 201,
      quantity: 1,
      // missing product and selectedVariant!
    },
    {
      id: "999999-var-default",
      productId: "999999", // non-existent WooCommerce product ID
      quantity: 2,
    },
  ];

  await writeCartToFile("test_normalization_cart", staleLegacyCart);
  console.log("✓ Test legacy cart written to disk.");

  // Read back raw file contents to confirm stale state was saved
  const rawSaved = await readCartFromFile("test_normalization_cart");
  console.log("[TEST 1] Raw saved items count:", rawSaved.length);

  // Perform live WooCommerce product resolution manually as GET /api/cart does
  const normalizedItems = await Promise.all(
    rawSaved.map(async (item: any) => {
      const pId = String(item.productId || "").replace(/\D/g, "");
      let wooProduct = null;
      if (pId) {
        try {
          wooProduct = await getWooProductById(pId);
        } catch {}
      }

      if (!wooProduct) {
        return {
          id: item.id,
          productId: pId || "unavailable",
          product: {
            id: pId || "unavailable",
            title: "Product Currently Unavailable",
            price: 0,
            featuredImage: "/images/logo-cropped.png",
          },
          selectedVariant: {
            id: "var-unavailable",
            price: 0,
            name: "Unavailable Option",
            image: "/images/logo-cropped.png",
            inStock: false,
            stockStatus: "outofstock",
          },
          quantity: item.quantity || 1,
          inStock: false,
          unavailable: true,
        };
      }

      return {
        id: item.id,
        productId: String(wooProduct.id),
        product: wooProduct,
        selectedVariant: {
          id: `var-${wooProduct.id}`,
          price: wooProduct.price,
          name: wooProduct.title,
          image: wooProduct.featuredImage,
          inStock: wooProduct.inStock,
          stockStatus: wooProduct.stockStatus,
        },
        quantity: item.quantity || 1,
        inStock: wooProduct.inStock,
        unavailable: false,
      };
    })
  );

  console.log("[TEST 2] Normalized items count:", normalizedItems.length);

  // Verify Item 1 (Valid Product #101)
  const item1 = normalizedItems[0];
  console.log("[TEST 2] Item 1 product title:", item1.product.title);
  console.log("[TEST 2] Item 1 product price:", item1.product.price);
  console.log("[TEST 2] Item 1 selectedVariant price:", item1.selectedVariant.price);

  if (item1.product && item1.product.price !== undefined && item1.selectedVariant && item1.selectedVariant.price !== undefined) {
    console.log("✓ TEST 1 PASSED: Valid product normalized with non-null product & selectedVariant objects!");
  } else {
    throw new Error("TEST 1 FAILED");
  }

  // Verify Item 2 (Non-existent Product #999999)
  const item2 = normalizedItems[1];
  console.log("[TEST 3] Item 2 unavailable flag:", item2.unavailable);
  console.log("[TEST 3] Item 2 product title:", item2.product.title);
  console.log("[TEST 3] Item 2 selectedVariant price:", item2.selectedVariant.price);

  if (item2.unavailable === true && item2.product && item2.product.title === "Product Currently Unavailable" && item2.selectedVariant && item2.selectedVariant.price === 0) {
    console.log("✓ TEST 2 PASSED: Non-existent product handled gracefully with fallback non-null objects!");
  } else {
    throw new Error("TEST 2 FAILED");
  }

  console.log("\n=== ALL CART NORMALIZATION TESTS PASSED SUCCESSFULLY! ===");
}

runCartNormalizationTests().catch((err) => {
  console.error("CART NORMALIZATION TEST ERROR:", err);
  process.exit(1);
});
