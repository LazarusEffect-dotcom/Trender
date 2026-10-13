import { TREND_REGIONS } from "../src/data/trendRegions.js";

const CACHE_TTL = 5 * 60 * 1000;
const cache = new Map();
const TREND_BASE = "https://trends.google.com/trending";

function decodeXml(value = "") {
  return value
    .replace(/^\s*<!\[CDATA\[/, "").replace(/\]\]>\s*$/, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .trim();
}

function readTag(block, tag) {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = block.match(new RegExp("<" + escaped + "(?:\\s[^>]*)?>([\\s\\S]*?)<\\/" + escaped + ">", "i"));
  return match ? decodeXml(match[1].replace(/<[^>]+>/g, "")) : "";
}

function approximateTrafficValue(value = "") {
  const match = String(value).replace(/,/g, "").trim().match(/^([\d.]+)\s*([KMB])?\+?$/i);
  if (!match) return null;
  const scale = { K: 1_000, M: 1_000_000, B: 1_000_000_000 }[String(match[2] || "").toUpperCase()] || 1;
  const parsed = Number(match[1]) * scale;
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

function safeTrendUrl(value, geo, title) {
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && url.hostname === "trends.google.com" && url.pathname === "/trending" && url.searchParams.has("q")) return url.toString();
  } catch { /* Use the official Trends landing page when RSS omits a usable item URL. */ }
  return TREND_BASE + "?geo=" + encodeURIComponent(geo) + "&q=" + encodeURIComponent(title);
}

function parseFeed(xml, geo) {
  const items = [];
  const itemRegex = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) && items.length < 20) {
    const block = match[1];
    const title = readTag(block, "title");
    if (!title) continue;
    const publishedAt = readTag(block, "pubDate");
    const parsedDate = publishedAt ? new Date(publishedAt) : null;
    items.push({
      title,
      approximateTraffic: readTag(block, "ht:approx_traffic") || "Not provided",
      approximateTrafficValue: approximateTrafficValue(readTag(block, "ht:approx_traffic")),
      publishedAt: parsedDate && Number.isFinite(parsedDate.getTime()) ? parsedDate.toISOString() : null,
      url: safeTrendUrl(readTag(block, "link"), geo, title),
    });
  }
  return items;
}

async function fetchRegionTrends(geo, regionName) {
  const sourceUrl = "https://trends.google.com/trending/rss?geo=" + encodeURIComponent(geo);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(sourceUrl, {
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        "User-Agent": "TrenderMarketIntelligence/1.0 (public Google Trends RSS consumer)",
      },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("Google Trends returned HTTP " + response.status + ".");
    const items = parseFeed(await response.text(), geo);
    if (!items.length) throw new Error("Google Trends returned no readable RSS items.");
    return {
      status: "live",
      provider: "Google Trends Trending Now RSS",
      region: { code: geo, name: regionName },
      retrievedAt: new Date().toISOString(),
      items,
      sourceUrl: TREND_BASE + "?geo=" + encodeURIComponent(geo),
    };
  } catch (error) {
    return {
      status: "unavailable",
      provider: "Google Trends Trending Now RSS",
      region: { code: geo, name: regionName },
      retrievedAt: new Date().toISOString(),
      items: [],
      sourceUrl: TREND_BASE + "?geo=" + encodeURIComponent(geo),
      message: error.name === "AbortError" ? "Google Trends took too long to respond. Try again shortly." : "Google Trends is temporarily unavailable. Open the source page or refresh later.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(req, res) {
  const forceRefresh = String(req.query?.refresh || "") === "1";
  res.setHeader("Cache-Control", forceRefresh ? "no-store" : "s-maxage=300, stale-while-revalidate=600");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const requestedGeo = String(req.query?.geo || "US").trim().toUpperCase();
  const region = TREND_REGIONS.find(item => item.code === requestedGeo);
  if (!region) return res.status(400).json({ error: "Choose a supported trend region.", regions: TREND_REGIONS });

  const cached = cache.get(region.code);
  if (!forceRefresh && cached && Date.now() - cached.savedAt < CACHE_TTL) return res.status(200).json(cached.data);

  const data = await fetchRegionTrends(region.code, region.name);
  cache.set(region.code, { data, savedAt: Date.now() });
  return res.status(200).json(data);
}
