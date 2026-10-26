export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 1. Inspect Vercel Edge / Cloudflare / Proxy headers
  const countryCode =
    req.headers["x-vercel-ip-country"] ||
    req.headers["cf-ipcountry"] ||
    req.headers["x-country-code"] ||
    null;

  const city = req.headers["x-vercel-ip-city"] || null;
  const region = req.headers["x-vercel-ip-country-region"] || null;
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || null;

  return res.status(200).json({
    countryCode: countryCode && countryCode !== "XX" ? countryCode.toUpperCase() : null,
    city: city ? decodeURIComponent(city) : null,
    region: region ? decodeURIComponent(region) : null,
    ip: ip && !ip.startsWith("127.") && ip !== "::1" ? ip : null,
  });
}
