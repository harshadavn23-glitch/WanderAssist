/**
 * crypto.ts — Web Crypto API utilities for WanderAssist
 * SHA-256 hashing with salt for secure password storage
 *
 * CANONICAL ARGUMENT ORDER: hashPassword(salt, password)
 * The encoded payload is ALWAYS: salt + password (concatenated in that order)
 * Do NOT change this order — it must match between registration and login.
 */

/** Generate a random 16-byte hex salt */
export function generateSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Hash a password with a given salt using SHA-256.
 * Payload = salt + password (salt always first).
 *
 * @param salt   - The hex salt string (from generateSalt)
 * @param password - The plain-text password
 */
export async function hashPassword(
  salt: string,
  password: string,
): Promise<string> {
  const encoder = new TextEncoder();
  // CRITICAL: salt is always prepended. Do not reorder.
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
