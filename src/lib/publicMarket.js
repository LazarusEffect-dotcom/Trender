let cachedMarket = null;

export async function fetchPublicMarket({ refresh = false } = {}) {
  if (!refresh && cachedMarket && Date.now() - cachedMarket.savedAt < 60_000) return cachedMarket.data;
  const response = await fetch("/api/market", { cache: refresh ? "reload" : "default" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Could not load public market data.");
  cachedMarket = { data: payload, savedAt: Date.now() };
  return payload;
}
