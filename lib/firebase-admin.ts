import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let firebaseAdminApp: App | undefined;
let firestoreDb: Firestore | undefined;

/**
 * Initializes and returns the singleton Firebase Admin instance.
 * Reuses existing initialized app during Next.js Turbopack development hot reloads.
 */
export function getFirebaseAdminApp(): App {
  if (firebaseAdminApp) {
    return firebaseAdminApp;
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    firebaseAdminApp = existingApps[0];
    return firebaseAdminApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "[FirebaseAdmin] Missing required server-side environment variables: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY."
    );
  }

  // Convert escaped "\\n" characters in private key string into actual newlines
  if (privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  try {
    firebaseAdminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    return firebaseAdminApp;
  } catch (err: any) {
    console.error("[FirebaseAdmin] App initialization error:", err);
    throw new Error(`[FirebaseAdmin] Initialization failed: ${err.message}`);
  }
}

/**
 * Returns the singleton Firestore database client.
 */
export function getDb(): Firestore {
  if (firestoreDb) {
    return firestoreDb;
  }
  const app = getFirebaseAdminApp();
  firestoreDb = getFirestore(app);
  try {
    firestoreDb.settings({ ignoreUndefinedProperties: true });
  } catch (err) {
    // Ignore if already configured
  }
  return firestoreDb;
}
