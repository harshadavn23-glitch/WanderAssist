import type { CurrencyRate } from "@/types/travel";

// Static fallback rates relative to 1 INR (how many INR = 1 foreign unit)
// Used when canister rates are unavailable
export const currencyRates: CurrencyRate[] = [
  { code: "USD", name: "US Dollar", symbol: "$", rate: 83.5 },
  { code: "EUR", name: "Euro", symbol: "€", rate: 90.2 },
  { code: "GBP", name: "British Pound", symbol: "£", rate: 105.6 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", rate: 0.56 },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", rate: 22.7 },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", rate: 61.8 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", rate: 54.3 },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", rate: 61.2 },
  { code: "THB", name: "Thai Baht", symbol: "฿", rate: 2.34 },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", rate: 0.0052 },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", rate: 17.8 },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", rate: 93.5 },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", rate: 22.3 },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs", rate: 0.26 },
  { code: "NPR", name: "Nepalese Rupee", symbol: "₨", rate: 0.63 },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", rate: 11.5 },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", rate: 10.7 },
  { code: "KRW", name: "South Korean Won", symbol: "₩", rate: 0.063 },
];

export function getRate(
  fromCode: string,
  toCode: string,
  rates?: CurrencyRate[],
): number {
  const rateList = rates ?? currencyRates;
  if (fromCode === toCode) return 1;
  const from = rateList.find((c) => c.code === fromCode);
  const to = rateList.find((c) => c.code === toCode);
  if (!from && fromCode !== "INR") return 0;
  if (!to && toCode !== "INR") return 0;
  // Convert via INR
  if (fromCode === "INR") return to ? 1 / to.rate : 0;
  if (toCode === "INR") return from ? from.rate : 0;
  return from && to ? from.rate / to.rate : 0;
}

export function convertAmount(
  amount: number,
  fromCode: string,
  toCode: string,
  rates?: CurrencyRate[],
): number {
  return amount * getRate(fromCode, toCode, rates);
}

// All supported currencies including INR as base
export const ALL_CURRENCIES: CurrencyRate[] = [
  { code: "INR", name: "Indian Rupee", symbol: "₹", rate: 1 },
  ...currencyRates,
];

// Flag emoji map for currency codes
export const CURRENCY_FLAGS: Record<string, string> = {
  INR: "🇮🇳",
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  JPY: "🇯🇵",
  AED: "🇦🇪",
  SGD: "🇸🇬",
  AUD: "🇦🇺",
  CAD: "🇨🇦",
  THB: "🇹🇭",
  IDR: "🇮🇩",
  MYR: "🇲🇾",
  CHF: "🇨🇭",
  SAR: "🇸🇦",
  LKR: "🇱🇰",
  NPR: "🇳🇵",
  CNY: "🇨🇳",
  HKD: "🇭🇰",
  KRW: "🇰🇷",
};
