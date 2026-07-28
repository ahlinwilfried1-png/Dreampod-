/**
 * Helper to determine currency symbol based on user phone country
 * Cameroon (+237 / 237) -> XAF
 * Other African countries -> XOF
 */
export function getCurrencySymbol(phone?: string): string {
  if (!phone) return "XAF"; // Default to XAF for Cameroon if not set
  const clean = phone.trim().replace(/[\s\-\(\)]/g, "");
  if (
    clean.startsWith("+237") ||
    clean.startsWith("237") ||
    clean.startsWith("6") && clean.length === 9 // Common 9-digit Cameroon mobile number starting with 6
  ) {
    return "XAF";
  }
  if (
    clean.startsWith("+229") || clean.startsWith("229") ||
    clean.startsWith("+226") || clean.startsWith("226") ||
    clean.startsWith("+228") || clean.startsWith("228") ||
    clean.startsWith("+225") || clean.startsWith("225")
  ) {
    return "XOF";
  }
  return "XAF";
}
