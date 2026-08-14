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

import { encryptSessionPayload, decryptSessionPayload } from "../lib/auth";

async function testSessionSecret() {
  console.log("=== TESTING DEDICATED SESSION_SECRET ENCRYPTION ===");
  console.log("SESSION_SECRET present:", Boolean(process.env.SESSION_SECRET));

  const testPayload = {
    customerId: 99,
    email: "test.customer@example.com",
    firstName: "Test",
    lastName: "User",
    displayName: "Test User",
    createdAt: Date.now(),
    rememberMe: true,
  };

  const token = encryptSessionPayload(testPayload);
  console.log("Encrypted token length:", token.length);

  const decrypted = decryptSessionPayload(token);
  if (decrypted && decrypted.customerId === 99 && decrypted.email === "test.customer@example.com") {
    console.log("✓ SESSION_SECRET test PASSED: Token encrypted and decrypted successfully with SESSION_SECRET!");
  } else {
    throw new Error("SESSION_SECRET test FAILED: Decrypted payload mismatch.");
  }
}

testSessionSecret().catch((err) => {
  console.error("SESSION SECRET TEST FAILED:", err);
  process.exit(1);
});
