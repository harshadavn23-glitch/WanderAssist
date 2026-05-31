/**
 * formatCurrency — centralised Indian Rupee formatter.
 * Always renders as ₹X,XX,XXX.XX (en-IN locale, 2 decimal places).
 *
 * Usage:
 *   formatCurrency(45000)       // "₹45,000.00"
 *   formatCurrency(123456.789)  // "₹1,23,456.79"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * formatCurrencyCompact — same as above but no fractional part when amount
 * is a whole number. Useful for price-per-person labels.
 *
 * formatCurrencyCompact(45000)      // "₹45,000"
 * formatCurrencyCompact(45000.50)   // "₹45,000.50"
 */
export function formatCurrencyCompact(amount: number): string {
  const hasDecimals = amount % 1 !== 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
