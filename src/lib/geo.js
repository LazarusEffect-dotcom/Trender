// Trender Geolocation & Regional Currency Engine
// Maps detected client country to official national currency and reference exchange rates.

export const COUNTRY_CURRENCY_MAP = {
  // North America
  US: { currency: "USD", name: "United States", flag: "🇺🇸", symbol: "$" },
  CA: { currency: "CAD", name: "Canada", flag: "🇨🇦", symbol: "CA$" },
  MX: { currency: "MXN", name: "Mexico", flag: "🇲🇽", symbol: "Mex$" },

  // Europe - Eurozone
  DE: { currency: "EUR", name: "Germany", flag: "🇩🇪", symbol: "€" },
  FR: { currency: "EUR", name: "France", flag: "🇫🇷", symbol: "€" },
  IT: { currency: "EUR", name: "Italy", flag: "🇮🇹", symbol: "€" },
  ES: { currency: "EUR", name: "Spain", flag: "🇪🇸", symbol: "€" },
  NL: { currency: "EUR", name: "Netherlands", flag: "🇳🇱", symbol: "€" },
  BE: { currency: "EUR", name: "Belgium", flag: "🇧🇪", symbol: "€" },
  AT: { currency: "EUR", name: "Austria", flag: "🇦🇹", symbol: "€" },
  IE: { currency: "EUR", name: "Ireland", flag: "🇮🇪", symbol: "€" },
  PT: { currency: "EUR", name: "Portugal", flag: "🇵🇹", symbol: "€" },
  FI: { currency: "EUR", name: "Finland", flag: "🇫🇮", symbol: "€" },
  GR: { currency: "EUR", name: "Greece", flag: "🇬🇷", symbol: "€" },
  EU: { currency: "EUR", name: "European Union", flag: "🇪🇺", symbol: "€" },

  // Europe - Non-Eurozone
  GB: { currency: "GBP", name: "United Kingdom", flag: "🇬🇧", symbol: "£" },
  CH: { currency: "CHF", name: "Switzerland", flag: "🇨🇭", symbol: "CHF" },
  SE: { currency: "SEK", name: "Sweden", flag: "🇸🇪", symbol: "kr" },
  NO: { currency: "NOK", name: "Norway", flag: "🇳🇴", symbol: "kr" },
  DK: { currency: "DKK", name: "Denmark", flag: "🇩🇰", symbol: "kr" },
  PL: { currency: "PLN", name: "Poland", flag: "🇵🇱", symbol: "zł" },
  TR: { currency: "TRY", name: "Turkey", flag: "🇹🇷", symbol: "₺" },

  // Asia & Pacific
  IN: { currency: "INR", name: "India", flag: "🇮🇳", symbol: "₹" },
  JP: { currency: "JPY", name: "Japan", flag: "🇯🇵", symbol: "¥" },
  CN: { currency: "CNY", name: "China", flag: "🇨🇳", symbol: "¥" },
  HK: { currency: "HKD", name: "Hong Kong", flag: "🇭🇰", symbol: "HK$" },
  KR: { currency: "KRW", name: "South Korea", flag: "🇰🇷", symbol: "₩" },
  SG: { currency: "SGD", name: "Singapore", flag: "🇸🇬", symbol: "S$" },
  AU: { currency: "AUD", name: "Australia", flag: "🇦🇺", symbol: "A$" },
  NZ: { currency: "NZD", name: "New Zealand", flag: "🇳🇿", symbol: "NZ$" },
  ID: { currency: "IDR", name: "Indonesia", flag: "🇮🇩", symbol: "Rp" },
  TH: { currency: "THB", name: "Thailand", flag: "🇹🇭", symbol: "฿" },
  MY: { currency: "MYR", name: "Malaysia", flag: "🇲🇾", symbol: "RM" },
  PH: { currency: "PHP", name: "Philippines", flag: "🇵🇭", symbol: "₱" },
  VN: { currency: "VND", name: "Vietnam", flag: "🇻🇳", symbol: "₫" },
  TW: { currency: "TWD", name: "Taiwan", flag: "🇹🇼", symbol: "NT$" },
  PK: { currency: "PKR", name: "Pakistan", flag: "🇵🇰", symbol: "Rs" },
  BD: { currency: "BDT", name: "Bangladesh", flag: "🇧🇩", symbol: "৳" },

  // Middle East
  AE: { currency: "AED", name: "United Arab Emirates", flag: "🇦🇪", symbol: "AED" },
  SA: { currency: "SAR", name: "Saudi Arabia", flag: "🇸🇦", symbol: "SAR" },
  QA: { currency: "QAR", name: "Qatar", flag: "🇶🇦", symbol: "QR" },
  KW: { currency: "KWD", name: "Kuwait", flag: "🇰🇼", symbol: "KD" },
  IL: { currency: "ILS", name: "Israel", flag: "🇮🇱", symbol: "₪" },

  // South America
  BR: { currency: "BRL", name: "Brazil", flag: "🇧🇷", symbol: "R$" },
  AR: { currency: "ARS", name: "Argentina", flag: "🇦🇷", symbol: "ARS$" },
  CL: { currency: "CLP", name: "Chile", flag: "🇨🇱", symbol: "CLP$" },
  CO: { currency: "COP", name: "Colombia", flag: "🇨🇴", symbol: "COL$" },

  // Africa
  ZA: { currency: "ZAR", name: "South Africa", flag: "🇿🇦", symbol: "R" },
  EG: { currency: "EGP", name: "Egypt", flag: "🇪🇬", symbol: "E£" },
  NG: { currency: "NGN", name: "Nigeria", flag: "🇳🇬", symbol: "₦" },
  KE: { currency: "KES", name: "Kenya", flag: "🇰🇪", symbol: "KSh" },
};

export const TIMEZONE_COUNTRY_MAP = {
  // South Asia
  "Asia/Kolkata": "IN", "Asia/Calcutta": "IN", "Asia/Colombo": "LK", "Asia/Karachi": "PK", "Asia/Dhaka": "BD",
  // United Kingdom & Ireland
  "Europe/London": "GB", "Europe/Dublin": "IE", "Europe/Belfast": "GB",
  // Western & Central Europe
  "Europe/Paris": "FR", "Europe/Berlin": "DE", "Europe/Rome": "IT", "Europe/Madrid": "ES",
  "Europe/Amsterdam": "NL", "Europe/Brussels": "BE", "Europe/Vienna": "AT", "Europe/Zurich": "CH",
  "Europe/Stockholm": "SE", "Europe/Oslo": "NO", "Europe/Copenhagen": "DK", "Europe/Helsinki": "FI",
  "Europe/Lisbon": "PT", "Europe/Athens": "GR", "Europe/Warsaw": "PL", "Europe/Prague": "CZ",
  "Europe/Budapest": "HU", "Europe/Bucharest": "RO", "Europe/Istanbul": "TR",
  // North America
  "America/New_York": "US", "America/Chicago": "US", "America/Los_Angeles": "US", "America/Denver": "US",
  "America/Phoenix": "US", "America/Detroit": "US", "America/Anchorage": "US", "Pacific/Honolulu": "US",
  "America/Toronto": "CA", "America/Vancouver": "CA", "America/Montreal": "CA", "America/Edmonton": "CA",
  "America/Mexico_City": "MX", "America/Cancun": "MX", "America/Monterrey": "MX",
  // Latin America
  "America/Sao_Paulo": "BR", "America/Rio_Branco": "BR", "America/Fortaleza": "BR",
  "America/Buenos_Aires": "AR", "America/Santiago": "CL", "America/Bogota": "CO",
  // Asia Pacific
  "Asia/Tokyo": "JP", "Asia/Seoul": "KR", "Asia/Singapore": "SG", "Asia/Hong_Kong": "HK",
  "Asia/Taipei": "TW", "Asia/Shanghai": "CN", "Asia/Chongqing": "CN", "Asia/Kuala_Lumpur": "MY",
  "Asia/Bangkok": "TH", "Asia/Jakarta": "ID", "Asia/Manila": "PH", "Asia/Ho_Chi_Minh": "VN",
  "Australia/Sydney": "AU", "Australia/Melbourne": "AU", "Australia/Brisbane": "AU", "Australia/Perth": "AU",
  "Pacific/Auckland": "NZ",
  // Middle East & Africa
  "Asia/Dubai": "AE", "Asia/Riyadh": "SA", "Asia/Qatar": "QA", "Asia/Kuwait": "KW",
  "Asia/Jerusalem": "IL", "Africa/Cairo": "EG", "Africa/Johannesburg": "ZA",
  "Africa/Lagos": "NG", "Africa/Nairobi": "KE",
};

export const SUPPORTED_CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸", locale: "en-US" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺", locale: "de-DE" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧", locale: "en-GB" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳", locale: "en-IN" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵", locale: "ja-JP" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar", flag: "🇨🇦", locale: "en-CA" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺", locale: "en-AU" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", flag: "🇨🇭", locale: "de-CH" },
  { code: "AED", symbol: "AED", name: "UAE Dirham", flag: "🇦🇪", locale: "ar-AE" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬", locale: "en-SG" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", flag: "🇨🇳", locale: "zh-CN" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", flag: "🇧🇷", locale: "pt-BR" },
  { code: "KRW", symbol: "₩", name: "South Korean Won", flag: "🇰🇷", locale: "ko-KR" },
  { code: "MXN", symbol: "Mex$", name: "Mexican Peso", flag: "🇲🇽", locale: "es-MX" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", flag: "🇳🇿", locale: "en-NZ" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", flag: "🇸🇪", locale: "sv-SE" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", flag: "🇭🇰", locale: "zh-HK" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", flag: "🇳🇴", locale: "nb-NO" },
  { code: "DKK", symbol: "kr", name: "Danish Krone", flag: "🇩🇰", locale: "da-DK" },
  { code: "ZAR", symbol: "R", name: "South African Rand", flag: "🇿🇦", locale: "en-ZA" },
  { code: "SAR", symbol: "SAR", name: "Saudi Riyal", flag: "🇸🇦", locale: "ar-SA" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", flag: "🇹🇷", locale: "tr-TR" },
];

export const DEFAULT_RATES_USD = {
  USD: 1.0,
  EUR: 0.9220,
  GBP: 0.7710,
  INR: 84.10,
  JPY: 152.40,
  CAD: 1.3880,
  AUD: 1.5180,
  CHF: 0.8660,
  CNY: 7.1200,
  BRL: 5.6800,
  AED: 3.6725,
  SGD: 1.3210,
  KRW: 1382.0,
  MXN: 19.88,
  NZD: 1.6720,
  SEK: 10.62,
  HKD: 7.7730,
  NOK: 10.95,
  DKK: 6.87,
  ZAR: 17.68,
  SAR: 3.75,
  TRY: 34.25,
  PLN: 4.02,
  IDR: 15600,
  THB: 33.8,
  MYR: 4.35,
  PHP: 57.8,
  VND: 25300,
  ILS: 3.75,
};

/**
 * Multi-tier Geolocation detector:
 * Tier 1: Vercel Edge Headers (/api/geo)
 * Tier 2: Free CORS IP lookup (ipwho.is)
 * Tier 3: Browser Timezone mapping (Intl.DateTimeFormat)
 * Tier 4: Browser language locale (navigator.language)
 * Tier 5: Fallback default (US / USD)
 */
export async function detectGeolocation() {
  // Tier 1: Edge Header via internal API
  try {
    const res = await fetch("/api/geo", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data?.countryCode && COUNTRY_CURRENCY_MAP[data.countryCode]) {
        const info = COUNTRY_CURRENCY_MAP[data.countryCode];
        return {
          countryCode: data.countryCode,
          countryName: data.city ? `${data.city}, ${info.name}` : info.name,
          currency: info.currency,
          symbol: info.symbol,
          flag: info.flag,
          source: "edge-header",
        };
      }
    }
  } catch {}

  // Tier 2: Fast CORS-friendly public IP Geolocation
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch("https://ipwho.is/", { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data?.success && data?.country_code && COUNTRY_CURRENCY_MAP[data.country_code]) {
        const info = COUNTRY_CURRENCY_MAP[data.country_code];
        return {
          countryCode: data.country_code,
          countryName: data.city ? `${data.city}, ${info.name}` : info.name,
          currency: info.currency,
          symbol: info.symbol,
          flag: info.flag,
          source: "ip-geolocation",
        };
      }
    }
  } catch {}

  // Tier 3: Browser Timezone Mapping
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const country = TIMEZONE_COUNTRY_MAP[tz];
    if (country && COUNTRY_CURRENCY_MAP[country]) {
      const info = COUNTRY_CURRENCY_MAP[country];
      return {
        countryCode: country,
        countryName: info.name,
        currency: info.currency,
        symbol: info.symbol,
        flag: info.flag,
        source: "timezone-inference",
      };
    }
  } catch {}

  // Tier 4: Browser Language / Locale
  try {
    const lang = (navigator.language || "").split("-")[1]?.toUpperCase();
    if (lang && COUNTRY_CURRENCY_MAP[lang]) {
      const info = COUNTRY_CURRENCY_MAP[lang];
      return {
        countryCode: lang,
        countryName: info.name,
        currency: info.currency,
        symbol: info.symbol,
        flag: info.flag,
        source: "locale-inference",
      };
    }
  } catch {}

  // Tier 5: Default fallback
  return {
    countryCode: "US",
    countryName: "United States",
    currency: "USD",
    symbol: "$",
    flag: "🇺🇸",
    source: "default",
  };
}
