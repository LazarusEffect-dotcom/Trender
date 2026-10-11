import { gatherPublicResearch } from "../lib/publicResearch.js";

export default async function handler(req, res) {
  const refresh = req.query?.refresh === "1";
  res.setHeader("Cache-Control", refresh ? "no-store" : "s-maxage=600, stale-while-revalidate=1800");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const data = await gatherPublicResearch({ refresh });
    return res.status(200).json({ ...data, fetchedAt: new Date().toISOString() });
  } catch {
    return res.status(502).json({ error: "Public web sources are temporarily unavailable. Try again shortly." });
  }
}
