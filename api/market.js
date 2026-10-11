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

async function getJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "Trender-Market-Workspace/1.0" },
    signal: AbortSignal.timeout(9000),
  });
  if (!response.ok) throw new Error(`Provider returned ${response.status}`);
  return response.json();
}

async function quoteAsset(item) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(item.symbol)}?range=5d&interval=1d`;
  const data = await getJson(url);
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
    history,
    asOf: new Date((meta?.regularMarketTime || Date.now() / 1000) * 1000).toISOString(),
    source: "Yahoo Finance public chart feed",
  };
}

async function getEconomies() {
  const [growth, inflation] = await Promise.all([
    getJson(`https://api.worldbank.org/v2/country/${COUNTRIES.join(";")}/indicator/NY.GDP.MKTP.KD.ZG?format=json&mrv=1&per_page=30`),
    getJson(`https://api.worldbank.org/v2/country/${COUNTRIES.join(";")}/indicator/FP.CPI.TOTL.ZG?format=json&mrv=1&per_page=30`),
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
  const data = await getJson("https://api.frankfurter.dev/v2/providers/ecb/rates?base=USD&quotes=EUR,GBP,INR,JPY,CNY,BRL");
  return (Array.isArray(data) ? data : []).map(row => ({ currency: row.quote, rate: row.rate, date: row.date }));
}

async function getCrypto() {
  const assets = [
    { symbol: "BTC", name: "Bitcoin" },
    { symbol: "ETH", name: "Ethereum" },
    { symbol: "SOL", name: "Solana" },
  ];
  return Promise.all(assets.map(async asset => {
    const data = await getJson(`https://data-api.binance.vision/api/v3/ticker/24hr?symbol=${asset.symbol}USDT`);
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

  const [indices, sectors, economies, currencies, crypto] = await Promise.all([
    Promise.all(INDEX_SYMBOLS.map(item => quoteAsset(item).catch(() => null))).then(rows => rows.filter(Boolean)),
    Promise.all(SECTOR_SYMBOLS.map(item => quoteAsset(item).catch(() => null))).then(rows => rows.filter(Boolean)),
    getEconomies().catch(() => []),
    getCurrencies().catch(() => []),
    getCrypto().catch(() => []),
  ]);
  const available = indices.length + sectors.length + economies.length + currencies.length + crypto.length;
  if (!available) return res.status(503).json({ error: "Public data providers are temporarily unavailable. Refresh in a moment." });

  return res.status(200).json({
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
  });
}
