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

import { getWooProducts, getWooProductById, getWooProductVariations } from "../lib/woocommerce";

async function diagnoseWooProducts() {
  console.log("=== DIAGNOSING WOOCOMMERCE PRODUCT DATA ===");
  const res = await getWooProducts({ per_page: 5 });
  const products = res.products || [];
  console.log(`Fetched ${products.length} products from WooCommerce.`);

  for (const p of products) {
    console.log("\n--------------------------------------------------");
    console.log(`Product ID: ${p.id} (type: ${typeof p.id}) | Title: "${p.title}" | Type: ${p.type}`);
    console.log(`Price: ${p.price} | InStock: ${p.inStock} | StockStatus: ${p.stockStatus}`);
    
    // Fetch raw WooCommerce product object
    const rawP = await getWooProductById(String(p.id));
    console.log("Raw Product details:", {
      id: rawP?.id,
      title: rawP?.title,
      type: rawP?.type,
      inStock: rawP?.inStock,
      stockStatus: rawP?.stockStatus,
      variantsCount: rawP?.variants?.length,
    });

    if (rawP?.type === "variable" || rawP?.hasVariations) {
      try {
        const rawVars = await getWooProductVariations(String(p.id));
        console.log(`Variations count for product ${p.id}: ${rawVars.length}`);
        if (rawVars.length > 0) {
          console.log("First variation:", {
            id: rawVars[0].id,
            price: rawVars[0].price,
            stock_status: rawVars[0].stock_status,
            purchasable: rawVars[0].purchasable,
            manage_stock: (rawVars[0] as any).manage_stock,
            stock_quantity: (rawVars[0] as any).stock_quantity,
          });
        }
      } catch (err: any) {
        console.error(`Error fetching variations for ${p.id}:`, err.message);
      }
    }
  }
}

diagnoseWooProducts().catch((err) => {
  console.error("DIAGNOSIS FAILED:", err);
  process.exit(1);
});
