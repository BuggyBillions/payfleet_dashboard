import type { PendingVerification } from "../lib/interfaces";

export type { PendingVerification };

const PENDING_VERIFICATION_KEY = "payfleet_pending_verification";
const TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Saves a pending email/account verification payload to localStorage.
 */
export async function savePendingVerification(
  email: string,
  flow: "email_verification" | string = "email_verification",
): Promise<void> {
  const payload: PendingVerification = {
    flow,
    email,
    savedAt: Date.now(),
  };

  try {
    localStorage.setItem(PENDING_VERIFICATION_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("Failed to save pending verification:", error);
  }
}

/**
 * Retrieves the pending verification payload from localStorage if not expired.
 */
export async function getPendingVerification(): Promise<PendingVerification | null> {
  try {
    const raw = localStorage.getItem(PENDING_VERIFICATION_KEY);
    if (!raw) return null;

    const parsed: PendingVerification = JSON.parse(raw);
    const isExpired = Date.now() - parsed.savedAt > TTL_MS;

    if (isExpired) {
      await clearPendingVerification();
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Failed to retrieve pending verification:", error);
    await clearPendingVerification();
    return null;
  }
}

/**
 * Clears the stored pending verification payload from localStorage.
 */
export async function clearPendingVerification(): Promise<void> {
  try {
    localStorage.removeItem(PENDING_VERIFICATION_KEY);
  } catch (error) {
    console.error("Failed to clear pending verification:", error);
  }
}