/**
 * Helper to determine currency symbol based on user phone country
 * Cameroon (+237 / 237) -> XAF
 * Other countries -> XOF
 */
export function getCurrencySymbol(phone?: string): string {
  if (!phone) return "XOF";
  const clean = phone.trim().replace(/[\s\-\(\)]/g, "");
  if (clean.startsWith("+237") || clean.startsWith("237")) {
    return "XAF";
  }
  return "XOF";
}
