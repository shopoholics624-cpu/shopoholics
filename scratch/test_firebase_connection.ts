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

import { getDb } from "../lib/firebase-admin";

async function testFirebaseConnection() {
  console.log("=== TESTING FIREBASE ADMIN FIRESTORE CONNECTION ===");
  console.log("Project ID:", process.env.FIREBASE_PROJECT_ID);
  console.log("Client Email:", process.env.FIREBASE_CLIENT_EMAIL);

  const db = getDb();
  const testRef = db.collection("test_health_check").doc("ping");
  await testRef.set({ timestamp: Date.now(), status: "connected" });
  const doc = await testRef.get();
  console.log("✓ Successfully wrote and read test doc from Firestore:", doc.data());
  await testRef.delete();
  console.log("✓ Successfully cleaned up test doc.");
  console.log("=== FIREBASE FIRESTORE CONNECTION VERIFIED ===");
}

testFirebaseConnection().catch((err) => {
  console.error("FIREBASE CONNECTION TEST FAILED:", err);
  process.exit(1);
});
