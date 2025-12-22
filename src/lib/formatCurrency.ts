/**
 * Format currency in Euro with German locale
 * Example: 1234.56 → "1.234,56 €"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

/**
 * Format currency without symbol for compact display
 * Example: 1234.56 → "1.234,56"
 */
export function formatAmount(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Parse a German-formatted currency string back to number
 * Example: "1.234,56" → 1234.56
 */
export function parseCurrency(value: string): number {
  const cleaned = value
    .replace(/[€\s]/g, '') // Remove euro symbol and spaces
    .replace(/\./g, '')     // Remove thousand separators
    .replace(',', '.');     // Convert decimal separator
  return parseFloat(cleaned) || 0;
}
