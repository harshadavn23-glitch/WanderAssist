/**
 * localAuth.ts — localStorage-based auth for WanderAssist
 *
 * Primary auth mechanism: always works regardless of canister availability.
 * Backend actor is used as a fire-and-forget sync layer only.
 *
 * Storage key: 'wanderassist-users'
 * Format: JSON array of UserRecord
 */

import { generateSalt, hashPassword } from "./crypto";
import { validatePassword } from "./validation";

const USERS_KEY = "wanderassist-users";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: number;
}

/** Load all stored users from localStorage */
function loadUsers(): UserRecord[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw) as UserRecord[];
  } catch {
    // ignore parse errors
  }
  return [];
}

/** Persist users array to localStorage */
function saveUsers(users: UserRecord[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore storage errors
  }
}

/** Generate a simple unique ID */
function generateId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Register a new user locally.
 * Validates password rules, checks email uniqueness, hashes password, persists.
 */
export async function localRegister(
  name: string,
  email: string,
  password: string,
): Promise<{ ok: string } | { err: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  // Name check
  if (!name || name.trim().length < 2) {
    return { err: "Name must be at least 2 characters." };
  }

  // Email format check
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(normalizedEmail)) {
    return { err: "Enter a valid email address." };
  }

  // Password strength check
  const pwIssues = validatePassword(password);
  if (pwIssues.length > 0) {
    return { err: pwIssues.join(". ") };
  }

  // Duplicate email check
  const users = loadUsers();
  const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return { err: "Email already registered. Please sign in." };
  }

  // Hash password — MUST use (salt, password) order to match localLogin
  const salt = generateSalt();
  const passwordHash = await hashPassword(salt, password);

  // Create and store user
  const newUser: UserRecord = {
    id: generateId(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    salt,
    createdAt: Date.now(),
  };

  users.push(newUser);
  saveUsers(users);

  return { ok: newUser.id };
}

/**
 * Log in an existing user locally.
 * Looks up by email, hashes the provided password with the stored salt, compares.
 */
export async function localLogin(
  email: string,
  password: string,
): Promise<
  { ok: { userId: string; name: string; email: string } } | { err: string }
> {
  const normalizedEmail = email.trim().toLowerCase();

  const users = loadUsers();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return { err: "No account found with this email. Please register first." };
  }

  // MUST use (salt, password) order — identical to how the hash was stored
  const attemptHash = await hashPassword(user.salt, password);
  if (attemptHash !== user.passwordHash) {
    return { err: "__HASH_MISMATCH__" };
  }

  return {
    ok: {
      userId: user.id,
      name: user.name,
      email: user.email,
    },
  };
}

/**
 * Retrieve the stored salt for an email address.
 * Returns null if the user doesn't exist locally.
 */
export function getLocalSalt(email: string): string | null {
  const normalizedEmail = email.trim().toLowerCase();
  const users = loadUsers();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  return user ? user.salt : null;
}

/**
 * Check if an email is already registered locally.
 */
export function isEmailRegistered(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  const users = loadUsers();
  return users.some((u) => u.email.toLowerCase() === normalizedEmail);
}

/**
 * Remove a user record by email from localStorage.
 * Used when a user wants to re-register after a hash mismatch
 * (e.g. after a code change invalidated stored hashes).
 * Returns true if a record was found and removed, false otherwise.
 */
export function resetAccount(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  const users = loadUsers();
  const filtered = users.filter(
    (u) => u.email.toLowerCase() !== normalizedEmail,
  );
  if (filtered.length === users.length) return false; // nothing removed
  saveUsers(filtered);
  return true;
}
