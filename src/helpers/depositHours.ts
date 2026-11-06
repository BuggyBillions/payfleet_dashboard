/**
 * Deposit Operating Hours Utility
 *
 * Verifies whether current date and time meet the operating hours condition:
 * - Return true if day is Monday - Saturday AND time is between 9:00 AM and 6:00 PM (inclusive).
 * - Otherwise return false.
 */

export const isDepositOperatingHours = (date: Date = new Date()): boolean => {
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  if (day < 1 || day > 6) {
    return false;
  }

  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const startMinutes = 9 * 60; // 9:00 AM = 540
  const endMinutes = 18 * 60; // 6:00 PM = 1080

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

export const DEPOSIT_OPERATING_HOURS_MESSAGE =
  "Deposits are only available Monday to Saturday, between 9:00 AM and 6:00 PM.";
