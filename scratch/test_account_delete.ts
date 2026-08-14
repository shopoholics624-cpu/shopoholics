import { getWooCustomerById } from "../lib/woocommerce";

async function testCustomerLookups() {
  console.log("Testing WooCommerce Customer Lookup helper...");
  // Test lookup for dummy ID
  const cust = await getWooCustomerById(999999);
  console.log("Lookup Non-existent Customer (999999):", cust === null ? "PASSED (null returned)" : "FAILED");
}

testCustomerLookups().catch(console.error);
