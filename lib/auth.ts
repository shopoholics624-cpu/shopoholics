import { cookies } from "next/headers";
import crypto from "crypto";

export const AUTH_COOKIE_NAME = "shopoholics_customer_session";

/**
 * Returns the dedicated server-side session secret.
 * Enforces mandatory SESSION_SECRET environment variable in production.
 */
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;

  if (process.env.NODE_ENV === "production") {
    if (!secret) {
      throw new Error(
        "[Auth] Missing required server-side environment variable: SESSION_SECRET. Production environment requires an explicit SESSION_SECRET configuration."
      );
    }
    return secret;
  }

  return secret || "shopoholics_dev_session_secret_key_2026";
}

export interface CustomerSessionPayload {
  customerId: number;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  createdAt: number;
  rememberMe?: boolean;
}

/**
 * Encrypts customer session payload into a secure hex string with HMAC signature.
 */
export function encryptSessionPayload(payload: CustomerSessionPayload): string {
  const sessionSecret = getSessionSecret();
  const jsonStr = JSON.stringify(payload);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", crypto.scryptSync(sessionSecret, "salt", 32), iv);
  
  let encrypted = cipher.update(jsonStr, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts and verifies a customer session string server-side.
 */
export function decryptSessionPayload(sessionToken: string): CustomerSessionPayload | null {
  try {
    const sessionSecret = getSessionSecret();
    const parts = sessionToken.split(":");
    if (parts.length !== 3) return null;

    const [ivHex, authTagHex, encryptedText] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", crypto.scryptSync(sessionSecret, "salt", 32), iv);

    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    const payload = JSON.parse(decrypted) as CustomerSessionPayload;
    if (!payload || !payload.customerId || !payload.email) {
      return null;
    }
    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Reads and returns the current authenticated customer session from HTTP-Only cookie.
 */
export async function getAuthenticatedCustomerSession(): Promise<CustomerSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    return decryptSessionPayload(token);
  } catch (err) {
    return null;
  }
}
