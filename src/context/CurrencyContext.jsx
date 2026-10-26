import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import {
  COUNTRY_CURRENCY_MAP,
  SUPPORTED_CURRENCIES,
  DEFAULT_RATES_USD,
  detectGeolocation,
} from "../lib/geo.js";

const OVERRIDE_STORAGE_KEY = "trender.currency_override.v1";
const CACHED_GEO_KEY = "trender.geo_cache.v1";

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [rates, setRates] = useState(DEFAULT_RATES_USD);
  const [loading, setLoading] = useState(true);

  // Geo state
  const [geoInfo, setGeoInfo] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHED_GEO_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  // Manual override state
  const [currencyOverride, setCurrencyOverride] = useState(() => {
    try {
      return localStorage.getItem(OVERRIDE_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  // Fetch updated market rates from API
  const refreshRates = useCallback(async () => {
    try {
      const res = await fetch("/api/market");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.currencies) && data.currencies.length) {
          const fresh = { USD: 1.0 };
          data.currencies.forEach(c => {
            if (c.currency && Number(c.rate)) {
              fresh[c.currency] = Number(c.rate);
            }
          });
          setRates(prev => ({ ...prev, ...fresh }));
        }
      }
    } catch {}
  }, []);

  // Run geolocation detection
  const runDetection = useCallback(async () => {
    setLoading(true);
    try {
      const detected = await detectGeolocation();
      setGeoInfo(detected);
      try {
        localStorage.setItem(CACHED_GEO_KEY, JSON.stringify(detected));
      } catch {}
    } catch (err) {
      console.warn("Geolocation detection fallback:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runDetection();
    refreshRates();
  }, [runDetection, refreshRates]);

  // Active currency resolution
  const isAutoGeo = !currencyOverride;
  const activeCurrencyCode = useMemo(() => {
    if (currencyOverride) return currencyOverride;
    if (geoInfo?.currency) return geoInfo.currency;
    return "USD";
  }, [currencyOverride, geoInfo]);

  const activeCurrencyMeta = useMemo(() => {
    const found = SUPPORTED_CURRENCIES.find(c => c.code === activeCurrencyCode);
    if (found) return found;
    return {
      code: activeCurrencyCode,
      symbol: activeCurrencyCode,
      name: activeCurrencyCode,
      flag: geoInfo?.flag || "🌐",
      locale: "en-US",
    };
  }, [activeCurrencyCode, geoInfo]);

  // Set manual currency
  const setCurrency = useCallback((code) => {
    if (code === "AUTO") {
      setCurrencyOverride(null);
      try {
        localStorage.removeItem(OVERRIDE_STORAGE_KEY);
      } catch {}
      return;
    }
    setCurrencyOverride(code);
    try {
      localStorage.setItem(OVERRIDE_STORAGE_KEY, code);
    } catch {}
  }, []);

  // Reset to auto geolocation
  const resetToGeo = useCallback(() => {
    setCurrencyOverride(null);
    try {
      localStorage.removeItem(OVERRIDE_STORAGE_KEY);
    } catch {}
    runDetection();
  }, [runDetection]);

  // Numeric conversion from USD to active currency
  const convert = useCallback((amountInUSD) => {
    if (amountInUSD === null || amountInUSD === undefined || !Number.isFinite(Number(amountInUSD))) {
      return null;
    }
    const rate = rates[activeCurrencyCode] || 1.0;
    return Number((Number(amountInUSD) * rate).toFixed(2));
  }, [activeCurrencyCode, rates]);

  // Localized price formatting
  const formatPrice = useCallback((amountInUSD, { compact = false, digits = null } = {}) => {
    if (amountInUSD === null || amountInUSD === undefined || !Number.isFinite(Number(amountInUSD))) {
      return "—";
    }
    const numUSD = Number(amountInUSD);
    const rate = rates[activeCurrencyCode] || 1.0;
    const converted = numUSD * rate;

    const isZeroDecimal = activeCurrencyCode === "JPY" || activeCurrencyCode === "KRW" || activeCurrencyCode === "VND";
    const maxDigits = digits !== null ? digits : isZeroDecimal ? 0 : converted < 10 && converted > -10 ? 2 : 2;

    try {
      return new Intl.NumberFormat(activeCurrencyMeta.locale || undefined, {
        style: "currency",
        currency: activeCurrencyCode,
        notation: compact ? "compact" : "standard",
        maximumFractionDigits: compact ? 2 : maxDigits,
        minimumFractionDigits: isZeroDecimal ? 0 : compact ? 0 : 2,
      }).format(converted);
    } catch {
      return `${activeCurrencyMeta.symbol} ${converted.toLocaleString(undefined, { maximumFractionDigits: maxDigits })}`;
    }
  }, [activeCurrencyCode, activeCurrencyMeta, rates]);

  const value = {
    currency: activeCurrencyCode,
    currencySymbol: activeCurrencyMeta.symbol,
    currencyName: activeCurrencyMeta.name,
    flag: activeCurrencyMeta.flag,
    locale: activeCurrencyMeta.locale,
    countryCode: geoInfo?.countryCode || "US",
    countryName: geoInfo?.countryName || "United States",
    geoSource: geoInfo?.source || "default",
    isAutoGeo,
    loading,
    rates,
    rateFor: (c) => rates[c] || 1.0,
    currentRate: rates[activeCurrencyCode] || 1.0,
    convert,
    formatPrice,
    setCurrency,
    resetToGeo,
    detectLocation: runDetection,
    supportedCurrencies: SUPPORTED_CURRENCIES,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return ctx;
}
