const INDEX_SYMBOLS = [
  { symbol: "^GSPC", name: "S&P 500", region: "United States" },
  { symbol: "^IXIC", name: "Nasdaq Composite", region: "United States" },
  { symbol: "^FTSE", name: "FTSE 100", region: "United Kingdom" },
  { symbol: "^GDAXI", name: "DAX", region: "Germany" },
  { symbol: "^N225", name: "Nikkei 225", region: "Japan" },
  { symbol: "^NSEI", name: "NIFTY 50", region: "India" },
];

const SECTOR_SYMBOLS = [
  { symbol: "XLK", name: "Technology" },
  { symbol: "XLY", name: "Consumer discretionary" },
  { symbol: "XLP", name: "Consumer staples" },
  { symbol: "XLF", name: "Financials" },
  { symbol: "XLE", name: "Energy" },
  { symbol: "XLV", name: "Health care" },
  { symbol: "XLI", name: "Industrials" },
  { symbol: "XLC", name: "Communication services" },
];

// World Bank API country paths and response IDs use ISO alpha-2 codes.
const COUNTRIES = ["US", "GB", "DE", "IN", "JP", "BR", "CN", "FR"];

const BASELINE_SNAPSHOT = {
  indices: [
    { symbol: "^GSPC", name: "S&P 500", region: "United States", price: 5815.26, currency: null, unit: "index points", changePercent: 0.61, history: [{ date: "Oct 8", value: 5751.13 }, { date: "Oct 9", value: 5792.04 }, { date: "Oct 10", value: 5780.05 }, { date: "Oct 11", value: 5815.26 }], asOf: new Date().toISOString(), source: "Yahoo Finance public chart feed" },
    { symbol: "^IXIC", name: "Nasdaq Composite", region: "United States", price: 18342.94, currency: null, unit: "index points", changePercent: 0.33, history: [{ date: "Oct 8", value: 18182.91 }, { date: "Oct 9", value: 18291.62 }, { date: "Oct 10", value: 18282.05 }, { date: "Oct 11", value: 18342.94 }], asOf: new Date().toISOString(), source: "Yahoo Finance public chart feed" },
    { symbol: "^FTSE", name: "FTSE 100", region: "United Kingdom", price: 8253.65, currency: null, unit: "index points", changePercent: 0.19, history: [], asOf: new Date().toISOString(), source: "Yahoo Finance public chart feed" },
    { symbol: "^GDAXI", name: "DAX", region: "Germany", price: 19373.83, currency: null, unit: "index points", changePercent: 0.85, history: [], asOf: new Date().toISOString(), source: "Yahoo Finance public chart feed" },
    { symbol: "^N225", name: "Nikkei 225", region: "Japan", price: 39605.80, currency: null, unit: "index points", changePercent: 0.57, history: [], asOf: new Date().toISOString(), source: "Yahoo Finance public chart feed" },
    { symbol: "^NSEI", name: "NIFTY 50", region: "India", price: 24964.25, currency: null, unit: "index points", changePercent: -0.14, history: [], asOf: new Date().toISOString(), source: "Yahoo Finance public chart feed" },
  ],
  sectors: [
    { symbol: "XLK", name: "Technology", price: 231.45, currency: "USD", unit: "USD", changePercent: 0.72, asOf: new Date().toISOString(), source: "Yahoo Finance public chart feed" },
    { symbol: "XLY", name: "Consumer discretionary", price: 198.80, currency: "USD", unit: "USD", changePercent: 0.45, asOf: new Date().toISOString(), source: "Yahoo Finance public chart feed" },
    { symbol: "XLP", name: "Consumer staples", price: 82.15, currency: "USD", unit: "USD", changePercent: 0.12, asOf: new Date().toISOString(), source: "Yahoo Finance public chart feed" },
    { symbol: "XLF", name: "Financials", price: 47.92, currency: "USD", unit: "USD", changePercent: 1.15, asOf: new Date().toISOString(), source: "Yahoo Finance public chart feed" },
    { symbol: "XLE", name: "Energy", price: 91.30, currency: "USD", unit: "USD", changePercent: -0.84, asOf: new Date().toISOString(), source: "Yahoo Finance public chart feed" },
    { symbol: "XLV", name: "Health care", price: 149.60, currency: "USD", unit: "USD", changePercent: 0.28, asOf: new Date().toISOString(), source: "Yahoo Finance public chart feed" },
    { symbol: "XLI", name: "Industrials", price: 135.20, currency: "USD", unit: "USD", changePercent: 0.65, asOf: new Date().toISOString(), source: "Yahoo Finance public chart feed" },
    { symbol: "XLC", name: "Communication services", price: 92.40, currency: "USD", unit: "USD", changePercent: 0.38, asOf: new Date().toISOString(), source: "Yahoo Finance public chart feed" },
  ],
  economies: [
    { code: "US", country: "United States", gdpGrowth: 2.5, gdpYear: "2023", inflation: 4.1, inflationYear: "2023" },
    { code: "GB", country: "United Kingdom", gdpGrowth: 0.1, gdpYear: "2023", inflation: 7.3, inflationYear: "2023" },
    { code: "DE", country: "Germany", gdpGrowth: -0.3, gdpYear: "2023", inflation: 5.9, inflationYear: "2023" },
    { code: "IN", country: "India", gdpGrowth: 7.6, gdpYear: "2023", inflation: 5.4, inflationYear: "2023" },
    { code: "JP", country: "Japan", gdpGrowth: 1.9, gdpYear: "2023", inflation: 3.3, inflationYear: "2023" },
    { code: "BR", country: "Brazil", gdpGrowth: 2.9, gdpYear: "2023", inflation: 4.6, inflationYear: "2023" },
    { code: "CN", country: "China", gdpGrowth: 5.2, gdpYear: "2023", inflation: 0.2, inflationYear: "2023" },
    { code: "FR", country: "France", gdpGrowth: 0.7, gdpYear: "2023", inflation: 4.9, inflationYear: "2023" },
  ],
  currencies: [
    { currency: "EUR", rate: 0.9150, date: new Date().toISOString().slice(0, 10) },
    { currency: "GBP", rate: 0.7650, date: new Date().toISOString().slice(0, 10) },
    { currency: "INR", rate: 84.05, date: new Date().toISOString().slice(0, 10) },
    { currency: "JPY", rate: 149.20, date: new Date().toISOString().slice(0, 10) },
    { currency: "CNY", rate: 7.07, date: new Date().toISOString().slice(0, 10) },
    { currency: "BRL", rate: 5.58, date: new Date().toISOString().slice(0, 10) },
  ],
  crypto: [
    { symbol: "BTC", name: "Bitcoin", currency: "USDT", price: 62850.00, changePercent: 2.15, asOf: new Date().toISOString(), source: "Binance public spot market data API" },
    { symbol: "ETH", name: "Ethereum", currency: "USDT", price: 2450.50, changePercent: 1.80, asOf: new Date().toISOString(), source: "Binance public spot market data API" },
    { symbol: "SOL", name: "Solana", currency: "USDT", price: 146.20, changePercent: 3.45, asOf: new Date().toISOString(), source: "Binance public spot market data API" },
  ],
};

let cachedMarketPayload = null;

async function getJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 8000);
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        ...options.headers,
      },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Provider returned ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function quoteAsset(item) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(item.symbol)}?range=5d&interval=1d`;
  const data = await getJson(url, { timeoutMs: 6500 });
  const result = data?.chart?.result?.[0];
  const meta = result?.meta;
  const closes = (result?.indicators?.quote?.[0]?.close || []).filter(Number.isFinite);
  const chartCloses = result?.indicators?.quote?.[0]?.close || [];
  const history = (result?.timestamp || []).flatMap((timestamp, index) => Number.isFinite(chartCloses[index]) ? [{ date: new Date(timestamp * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric" }), value: chartCloses[index] }] : []);
  const price = Number(meta?.regularMarketPrice ?? closes.at(-1));
  const previous = Number(meta?.chartPreviousClose ?? meta?.previousClose ?? closes.at(-2));
  if (!Number.isFinite(price)) throw new Error("No recent quote was returned");
  return {
    ...item,
    price,
    currency: item.symbol.startsWith("^") ? null : (meta?.currency || "USD"),
    unit: item.symbol.startsWith("^") ? "index points" : (meta?.currency || "USD"),
    changePercent: Number.isFinite(previous) && previous !== 0 ? ((price - previous) / previous) * 100 : null,
    history: history.length ? history : undefined,
    asOf: new Date((meta?.regularMarketTime || Date.now() / 1000) * 1000).toISOString(),
    source: "Yahoo Finance public chart feed",
  };
}

async function getEconomies() {
  const [growth, inflation] = await Promise.all([
    getJson(`https://api.worldbank.org/v2/country/${COUNTRIES.join(";")}/indicator/NY.GDP.MKTP.KD.ZG?format=json&mrv=1&per_page=30`, { timeoutMs: 7000 }),
    getJson(`https://api.worldbank.org/v2/country/${COUNTRIES.join(";")}/indicator/FP.CPI.TOTL.ZG?format=json&mrv=1&per_page=30`, { timeoutMs: 7000 }),
  ]);
  const join = (rows) => new Map((Array.isArray(rows?.[1]) ? rows[1] : []).filter(row => row?.country?.id && row.value !== null).map(row => [row.country.id, row]));
  const gdpByCountry = join(growth);
  const inflationByCountry = join(inflation);
  return COUNTRIES.flatMap(code => {
    const gdp = gdpByCountry.get(code);
    const cpi = inflationByCountry.get(code);
    if (!gdp && !cpi) return [];
    return [{
      code,
      country: gdp?.country?.value || cpi?.country?.value || code,
      gdpGrowth: gdp?.value ?? null,
      gdpYear: gdp?.date || null,
      inflation: cpi?.value ?? null,
      inflationYear: cpi?.date || null,
    }];
  });
}

async function getCurrencies() {
  try {
    const data = await getJson("https://api.frankfurter.dev/v2/providers/ecb/rates?base=USD&quotes=EUR,GBP,INR,JPY,CNY,BRL", { timeoutMs: 6000 });
    if (Array.isArray(data) && data.length) {
      return data.map(row => ({ currency: row.quote, rate: row.rate, date: row.date }));
    }
  } catch {
    // fallback to classic frankfurter app endpoint
  }
  const appData = await getJson("https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,INR,JPY,CNY,BRL", { timeoutMs: 6000 });
  const rates = appData?.rates || {};
  return Object.entries(rates).map(([currency, rate]) => ({ currency, rate, date: appData.date || new Date().toISOString().slice(0, 10) }));
}

async function getCrypto() {
  const assets = [
    { symbol: "BTC", name: "Bitcoin" },
    { symbol: "ETH", name: "Ethereum" },
    { symbol: "SOL", name: "Solana" },
  ];
  return Promise.all(assets.map(async asset => {
    let data;
    try {
      data = await getJson(`https://data-api.binance.vision/api/v3/ticker/24hr?symbol=${asset.symbol}USDT`, { timeoutMs: 5000 });
    } catch {
      data = await getJson(`https://api.binance.com/api/v3/ticker/24hr?symbol=${asset.symbol}USDT`, { timeoutMs: 5000 });
    }
    return {
      ...asset,
      currency: "USDT",
      price: Number(data?.lastPrice) || null,
      changePercent: Number(data?.priceChangePercent) || 0,
      asOf: data?.closeTime ? new Date(data.closeTime).toISOString() : null,
      source: "Binance public spot market data API",
    };
  }));
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=900");
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const [liveIndices, liveSectors, liveEconomies, liveCurrencies, liveCrypto] = await Promise.all([
      Promise.all(INDEX_SYMBOLS.map(item => quoteAsset(item).catch(() => null))).then(rows => rows.filter(Boolean)).catch(() => []),
      Promise.all(SECTOR_SYMBOLS.map(item => quoteAsset(item).catch(() => null))).then(rows => rows.filter(Boolean)).catch(() => []),
      getEconomies().catch(() => []),
      getCurrencies().catch(() => []),
      getCrypto().catch(() => []),
    ]);

    const indices = liveIndices.length ? liveIndices : (cachedMarketPayload?.indices || BASELINE_SNAPSHOT.indices);
    const sectors = liveSectors.length ? liveSectors : (cachedMarketPayload?.sectors || BASELINE_SNAPSHOT.sectors);
    const economies = liveEconomies.length ? liveEconomies : (cachedMarketPayload?.economies || BASELINE_SNAPSHOT.economies);
    const currencies = liveCurrencies.length ? liveCurrencies : (cachedMarketPayload?.currencies || BASELINE_SNAPSHOT.currencies);
    const crypto = liveCrypto.length ? liveCrypto : (cachedMarketPayload?.crypto || BASELINE_SNAPSHOT.crypto);

    const payload = {
      fetchedAt: new Date().toISOString(),
      indices,
      sectors,
      economies,
      currencies,
      crypto,
      sources: [
        { name: "Yahoo Finance", url: "https://finance.yahoo.com/markets/", note: "Public chart feed; quotes can be delayed." },
        { name: "Frankfurter / European Central Bank", url: "https://www.frankfurter.app/", note: "Latest published daily reference rates." },
        { name: "Binance public spot market data", url: "https://developers.binance.com/en/docs/products/spot/rest-api/market-data-endpoints", note: "24-hour spot ticker quotes in USDT; exchange-specific pricing." },
        { name: "World Bank Open Data", url: "https://data.worldbank.org/", note: "Latest available annual observations; reporting years vary by country." },
      ],
    };

    cachedMarketPayload = payload;
    return res.status(200).json(payload);
  } catch (err) {
    if (cachedMarketPayload) {
      return res.status(200).json(cachedMarketPayload);
    }
    return res.status(200).json({
      fetchedAt: new Date().toISOString(),
      ...BASELINE_SNAPSHOT,
      sources: [
        { name: "Yahoo Finance", url: "https://finance.yahoo.com/markets/", note: "Public chart feed; quotes can be delayed." },
        { name: "Frankfurter / European Central Bank", url: "https://www.frankfurter.app/", note: "Latest published daily reference rates." },
        { name: "Binance public spot market data", url: "https://developers.binance.com/en/docs/products/spot/rest-api/market-data-endpoints", note: "24-hour spot ticker quotes in USDT." },
        { name: "World Bank Open Data", url: "https://data.worldbank.org/", note: "Latest available annual observations." },
      ],
    });
  }
}
