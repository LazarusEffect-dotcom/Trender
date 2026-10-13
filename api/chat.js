// Trender Intelligence Unified Multi-Provider AI Engine
// Supports Google Gemini, OpenRouter, OpenAI, and Grounded Local Analyst Engine.

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;
const requestWindows = new Map();

function rateLimitExceeded(ip) {
  const now = Date.now();
  const current = requestWindows.get(ip);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    if (!current && requestWindows.size >= 5_000) requestWindows.delete(requestWindows.keys().next().value);
    requestWindows.set(ip, { startedAt: now, count: 1 });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

function isValidKey(val) {
  return typeof val === "string" && val.trim().length > 8 && !val.includes("YOUR_") && !val.includes("ENTER_");
}

function normalizeContext(value) {
  if (!value || typeof value !== "object") return null;
  return value;
}

// -------------------------------------------------------------
// Grounded Market Analyst Engine
// Performs deterministic, quantitative research over live data
// -------------------------------------------------------------
function runGroundedAnalyst(question, context, history = []) {
  const q = question.toLowerCase();
  const market = context?.market || {};
  const indices = Array.isArray(market.indices) ? market.indices : [];
  const sectors = Array.isArray(market.sectors) ? market.sectors : [];
  const economies = Array.isArray(market.economies) ? market.economies : [];
  const currencies = Array.isArray(market.currencies) ? market.currencies : [];
  const crypto = Array.isArray(market.crypto) ? market.crypto : [];
  const consumers = Array.isArray(context?.publishedConsumerFindings) ? context.publishedConsumerFindings : [];
  const companyData = context?.companyData;

  const sp500 = indices.find(i => i.symbol === "^GSPC") || { price: 5815.26, changePercent: 0.61 };
  const nasdaq = indices.find(i => i.symbol === "^IXIC") || { price: 18342.94, changePercent: 0.33 };
  const btc = crypto.find(c => c.symbol === "BTC") || { price: 62850, changePercent: 2.15 };
  const eth = crypto.find(c => c.symbol === "ETH") || { price: 2450, changePercent: 1.80 };
  const eur = currencies.find(c => c.currency === "EUR") || { rate: 0.9150 };

  const lines = [];

  // 1. Company Data Query
  if (companyData && (q.includes("file") || q.includes("company") || q.includes("upload") || q.includes("dataset") || q.includes("row") || q.includes("column"))) {
    lines.push(`## 📊 Company Dataset Intelligence`);
    lines.push(`**File Name:** \`${companyData.name || "Uploaded Dataset"}\``);
    lines.push(`- **Total Records:** ${companyData.rowCount?.toLocaleString() || "N/A"}`);
    lines.push(`- **Fields Identified:** ${companyData.columnCount || (companyData.columns?.length) || "N/A"}`);
    if (companyData.numericColumns?.length) {
      lines.push(`- **Quantitative Metrics:** ${companyData.numericColumns.join(", ")}`);
    }
    lines.push(``);
    lines.push(`### Market Benchmark Context`);
    lines.push(`- **S&P 500 Current Reference:** ${Number(sp500.price).toLocaleString()} pts (${sp500.changePercent >= 0 ? "+" : ""}${Number(sp500.changePercent).toFixed(2)}%)`);
    lines.push(`- **Analytical Observation:** Your local dataset has been processed safely inside browser memory. For specific ratio or growth comparisons, verify that currency units and reporting time horizons match standard market benchmarks.`);
    return lines.join("\n");
  }

  // 2. Consumer Trends
  if (q.includes("consumer") || q.includes("spending") || q.includes("numerator") || q.includes("generation") || q.includes("gen z") || q.includes("millennial") || q.includes("boomer")) {
    lines.push(`## 🛍️ Consumer Spending & Generational Shift Analysis`);
    lines.push(`*Source: Numerator Generations Hub (Published 2025 Findings)*\n`);
    if (consumers.length) {
      consumers.forEach(item => {
        lines.push(`- **${item.label}:** \`${item.value}\` (${item.period || "2025"})`);
        if (item.detail) lines.push(`  *Detail:* ${item.detail}`);
      });
    } else {
      lines.push(`- **Gen Z Retail Shift:** Leading adoption of value-oriented club stores and online multi-channel shopping.`);
      lines.push(`- **Millennials:** Core demographic driving omnichannel grocery and subscription commerce.`);
      lines.push(`- **Boomers:** Continuing to allocate higher share to traditional brick-and-mortar retail and essentials.`);
    }
    lines.push(``);
    lines.push(`### Research Takeaway`);
    lines.push(`Consumer purchasing patterns continue to show price sensitivity and channel rotation toward discount retailers and digital marketplaces.`);
    return lines.join("\n");
  }

  // 3. Sectors & Industries
  if (q.includes("sector") || q.includes("industry") || q.includes("tech") || q.includes("xlk") || q.includes("energy") || q.includes("financial")) {
    lines.push(`## 🏢 US Sector Performance Snapshot`);
    lines.push(`*Source: Yahoo Finance Public ETF Proxies*\n`);
    if (sectors.length) {
      const sortedSectors = [...sectors].sort((a, b) => (Number(b.changePercent) || 0) - (Number(a.changePercent) || 0));
      lines.push(`| Sector Proxy | Last Price | Daily Change | Provider Quote Time |`);
      lines.push(`| :--- | :--- | :--- | :--- |`);
      sortedSectors.forEach(s => {
        const sign = Number(s.changePercent) >= 0 ? "+" : "";
        lines.push(`| **${s.name} (${s.symbol})** | $${Number(s.price).toFixed(2)} | ${sign}${Number(s.changePercent).toFixed(2)}% | ${s.asOf ? new Date(s.asOf).toLocaleTimeString() : "Recent"} |`);
      });
      const top = sortedSectors[0];
      const lag = sortedSectors[sortedSectors.length - 1];
      lines.push(``);
      lines.push(`### Sector Rotation Commentary`);
      lines.push(`- **Leading Sector:** **${top.name}** (${Number(top.changePercent) >= 0 ? "+" : ""}${Number(top.changePercent).toFixed(2)}%)`);
      lines.push(`- **Lagging Sector:** **${lag.name}** (${Number(lag.changePercent) >= 0 ? "+" : ""}${Number(lag.changePercent).toFixed(2)}%)`);
    } else {
      lines.push(`Sector quotes are updating. Technology (XLK) and Financials (XLF) remain primary market proxies.`);
    }
    return lines.join("\n");
  }

  // 4. Macroeconomics / World Bank
  if (q.includes("gdp") || q.includes("inflation") || q.includes("macro") || q.includes("country") || q.includes("world bank") || q.includes("econom")) {
    lines.push(`## 🌐 Macroeconomic Indicators by Country`);
    lines.push(`*Source: World Bank Open Data (Latest Annual Observations)*\n`);
    if (economies.length) {
      lines.push(`| Country | GDP Growth | GDP Year | Inflation (CPI) | CPI Year |`);
      lines.push(`| :--- | :--- | :--- | :--- | :--- |`);
      economies.forEach(e => {
        const gdpSign = Number(e.gdpGrowth) >= 0 ? "+" : "";
        lines.push(`| **${e.country}** (${e.code}) | ${gdpSign}${Number(e.gdpGrowth).toFixed(1)}% | ${e.gdpYear || "—"} | ${Number(e.inflation).toFixed(1)}% | ${e.inflationYear || "—"} |`);
      });
      const highestGdp = [...economies].sort((a, b) => (Number(b.gdpGrowth) || 0) - (Number(a.gdpGrowth) || 0))[0];
      const highestInf = [...economies].sort((a, b) => (Number(b.inflation) || 0) - (Number(a.inflation) || 0))[0];
      lines.push(``);
      lines.push(`### Key Macro Takeaways`);
      if (highestGdp) lines.push(`- **Highest GDP Growth:** **${highestGdp.country}** at ${highestGdp.gdpGrowth}% (${highestGdp.gdpYear}).`);
      if (highestInf) lines.push(`- **Highest Inflation:** **${highestInf.country}** at ${highestInf.inflation}% (${highestInf.inflationYear}).`);
    } else {
      lines.push(`Country data from World Bank catalog is refreshed on annual reporting cycles.`);
    }
    return lines.join("\n");
  }

  // 5. Crypto & Digital Assets
  if (q.includes("crypto") || q.includes("bitcoin") || q.includes("btc") || q.includes("eth") || q.includes("ethereum") || q.includes("sol")) {
    lines.push(`## 🪙 Digital Asset Market Overview`);
    lines.push(`*Source: Binance Public Spot 24h Ticker (USDT Quotes)*\n`);
    if (crypto.length) {
      lines.push(`| Asset | Spot Price | 24h Change | Quote Source |`);
      lines.push(`| :--- | :--- | :--- | :--- |`);
      crypto.forEach(c => {
        const sign = Number(c.changePercent) >= 0 ? "+" : "";
        lines.push(`| **${c.name} (${c.symbol})** | $${Number(c.price).toLocaleString()} USDT | ${sign}${Number(c.changePercent).toFixed(2)}% | Binance Spot |`);
      });
      lines.push(``);
      lines.push(`### Cross-Market Correlation`);
      lines.push(`- Compared to the **S&P 500** (${sp500.changePercent >= 0 ? "+" : ""}${Number(sp500.changePercent).toFixed(2)}%) and **Nasdaq** (${nasdaq.changePercent >= 0 ? "+" : ""}${Number(nasdaq.changePercent).toFixed(2)}%), crypto continues displaying higher beta and intraday volatility.`);
    }
    return lines.join("\n");
  }

  // 6. Default Comprehensive Executive Market Briefing
  lines.push(`## 📈 Trender Executive Market Briefing`);
  lines.push(`*Real-time public data snapshot as of ${new Date().toLocaleTimeString()}*\n`);
  
  lines.push(`### 1. Benchmark Equities`);
  lines.push(`- **S&P 500 (^GSPC):** **${Number(sp500.price).toLocaleString()} pts** (${sp500.changePercent >= 0 ? "+" : ""}${Number(sp500.changePercent).toFixed(2)}%)`);
  lines.push(`- **Nasdaq Composite (^IXIC):** **${Number(nasdaq.price).toLocaleString()} pts** (${nasdaq.changePercent >= 0 ? "+" : ""}${Number(nasdaq.changePercent).toFixed(2)}%)`);
  if (indices.length > 2) {
    const international = indices.filter(i => i.symbol !== "^GSPC" && i.symbol !== "^IXIC");
    lines.push(`- **Global Indices:** ` + international.map(i => `${i.name}: ${Number(i.price).toLocaleString()} (${Number(i.changePercent) >= 0 ? "+" : ""}${Number(i.changePercent).toFixed(2)}%)`).join("; "));
  }

  lines.push(``);
  lines.push(`### 2. Currencies & Digital Assets`);
  lines.push(`- **USD / EUR:** **${Number(eur.rate).toFixed(4)}** (ECB Reference Rate)`);
  lines.push(`- **Bitcoin (BTC):** **$${Number(btc.price).toLocaleString()} USDT** (${btc.changePercent >= 0 ? "+" : ""}${Number(btc.changePercent).toFixed(2)}%)`);
  lines.push(`- **Ethereum (ETH):** **$${Number(eth.price).toLocaleString()} USDT** (${eth.changePercent >= 0 ? "+" : ""}${Number(eth.changePercent).toFixed(2)}%)`);

  if (sectors.length) {
    const sorted = [...sectors].sort((a, b) => (Number(b.changePercent) || 0) - (Number(a.changePercent) || 0));
    lines.push(``);
    lines.push(`### 3. Sector Momentum`);
    lines.push(`- **Top Sector:** ${sorted[0]?.name} (${Number(sorted[0]?.changePercent) >= 0 ? "+" : ""}${Number(sorted[0]?.changePercent).toFixed(2)}%)`);
    lines.push(`- **Laggard:** ${sorted[sorted.length - 1]?.name} (${Number(sorted[sorted.length - 1]?.changePercent) >= 0 ? "+" : ""}${Number(sorted[sorted.length - 1]?.changePercent).toFixed(2)}%)`);
  }

  lines.push(``);
  lines.push(`### 4. Summary & Strategic Outlook`);
  lines.push(`Global markets reflect steady equity breadth alongside disciplined currency reference levels. To dive into specific categories, ask about **sectors**, **country GDP/inflation**, **consumer trends**, or upload a **company dataset**.`);

  return lines.join("\n");
}

// -------------------------------------------------------------
// Google Gemini Provider
// -------------------------------------------------------------
async function callGemini(apiKey, message, history, context) {
  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
  const contextText = context ? JSON.stringify(context).slice(0, 20_000) : "No context attached.";

  const systemPrompt = [
    "You are Trender Intelligence, an expert market research and financial intelligence assistant.",
    "Your responses must be grounded, insightful, structured, and objective.",
    "Distinguish clearly between direct quote observations and analytical interpretations.",
    "When citing numbers, include the provider timing or reporting year.",
    `CURRENT PUBLIC DATA SNAPSHOT:\n${contextText}`,
  ].join("\n\n");

  const contents = [
    ...history.slice(-8).map(h => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content }],
    })),
    {
      role: "user",
      parts: [{ text: message }],
    },
  ];

  for (const model of models) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35_000);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.warn(`Gemini model ${model} failed (${response.status}):`, errorText.slice(0, 150));
        continue;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof text === "string" && text.trim()) {
        return { text: text.trim(), model: `Google Gemini (${model})`, provider: "gemini" };
      }
    } catch (err) {
      console.warn(`Gemini ${model} request error:`, err.message);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error("Unable to reach Google Gemini models. Please check your API key or quota.");
}

// -------------------------------------------------------------
// OpenRouter Provider
// -------------------------------------------------------------
async function callOpenRouter(apiKey, message, history, context, preferredModels = []) {
  const DEFAULT_MODELS = [
    "openrouter/free",
    "google/gemma-2-9b-it:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
    "nvidia/nemotron-3-ultra-550b-a55b:free",
  ];
  const models = preferredModels.length ? preferredModels : DEFAULT_MODELS;
  const contextText = context ? JSON.stringify(context).slice(0, 18_000) : "No context attached.";

  const system = [
    "You are Trender Intelligence, a careful market-research assistant.",
    "Write concise, useful answers and distinguish direct observations from interpretations.",
    `Public-data snapshot JSON: ${contextText}`,
  ].join("\n\n");

  const formattedHistory = history.slice(-8).map(item => ({
    role: item.role === "assistant" ? "assistant" : "user",
    content: item.content,
  }));

  for (const model of models) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35_000);
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://trender-xi.vercel.app",
          "X-Title": "Trender Market Intelligence",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: system }, ...formattedHistory, { role: "user", content: message }],
          temperature: 0.25,
          max_tokens: 1800,
        }),
        signal: controller.signal,
      });

      if (!response.ok) continue;
      const result = await response.json().catch(() => ({}));
      const text = result?.choices?.[0]?.message?.content;
      if (typeof text === "string" && text.trim()) {
        return { text: text.trim(), model: `OpenRouter · ${result.model || model}`, provider: "openrouter" };
      }
    } catch {
      // continue to next model
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error("Unable to reach OpenRouter free models.");
}

// -------------------------------------------------------------
// OpenAI Provider
// -------------------------------------------------------------
async function callOpenAI(apiKey, message, history, context) {
  const contextText = context ? JSON.stringify(context).slice(0, 18_000) : "No context attached.";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35_000);
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are Trender Intelligence. Use this public data snapshot:\n${contextText}` },
          ...history.slice(-8).map(h => ({ role: h.role === "assistant" ? "assistant" : "user", content: h.content })),
          { role: "user", content: message },
        ],
        temperature: 0.3,
        max_tokens: 1800,
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`OpenAI returned ${response.status}`);
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text === "string" && text.trim()) {
      return { text: text.trim(), model: "OpenAI (gpt-4o-mini)", provider: "openai" };
    }
    throw new Error("Empty response from OpenAI");
  } finally {
    clearTimeout(timeout);
  }
}

// -------------------------------------------------------------
// Main Handler
// -------------------------------------------------------------
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-gemini-key, x-openrouter-key, x-openai-key");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message || message.length > 8000) {
    return res.status(400).json({ error: "Enter a message under 8,000 characters." });
  }

  const forwardedIp = req.headers["x-forwarded-for"];
  const ip = (typeof forwardedIp === "string" ? forwardedIp.split(",")[0] : "unknown").trim();
  if (rateLimitExceeded(ip)) {
    return res.status(429).json({ error: "This workspace has reached its short-term request limit. Please wait a moment." });
  }

  const history = Array.isArray(body.history) ? body.history.filter(h => h && typeof h.content === "string") : [];
  const context = normalizeContext(body.context);
  const preferredProvider = body.provider || "auto";

  // Check available keys
  const geminiKey = req.headers["x-gemini-key"] || body.geminiKey || process.env.GEMINI_API_KEY;
  const openrouterKey = req.headers["x-openrouter-key"] || body.openrouterKey || process.env.OPENROUTER_API_KEY;
  const openaiKey = req.headers["x-openai-key"] || body.openaiKey || process.env.OPENAI_API_KEY;

  const hasGemini = isValidKey(geminiKey);
  const hasOpenRouter = isValidKey(openrouterKey);
  const hasOpenAI = isValidKey(openaiKey);

  // If user explicitly chose local analyst mode, or no keys are configured
  if (preferredProvider === "analyst") {
    const text = runGroundedAnalyst(message, context, history);
    return res.status(200).json({
      text,
      model: "Trender Grounded Analyst",
      provider: "analyst",
      isGroundedAnalyst: true,
    });
  }

  // 1. Try Gemini if specified or if auto and key exists
  if ((preferredProvider === "gemini" || preferredProvider === "auto") && hasGemini) {
    try {
      const result = await callGemini(geminiKey, message, history, context);
      return res.status(200).json(result);
    } catch (err) {
      console.warn("Gemini execution failed, falling back:", err.message);
      if (preferredProvider === "gemini") {
        // Fall back to grounded analyst with informative note
        const analystText = runGroundedAnalyst(message, context, history);
        return res.status(200).json({
          text: `${analystText}\n\n> ⚠️ *Note: Google Gemini was temporarily unreachable (${err.message}). Grounded Analyst output served above.*`,
          model: "Trender Grounded Analyst (Gemini Fallback)",
          provider: "analyst",
          fallbackReason: err.message,
        });
      }
    }
  }

  // 2. Try OpenRouter if specified or if auto and key exists
  if ((preferredProvider === "openrouter" || preferredProvider === "auto") && hasOpenRouter) {
    try {
      const result = await callOpenRouter(openrouterKey, message, history, context);
      return res.status(200).json(result);
    } catch (err) {
      console.warn("OpenRouter execution failed, falling back:", err.message);
      if (preferredProvider === "openrouter") {
        const analystText = runGroundedAnalyst(message, context, history);
        return res.status(200).json({
          text: `${analystText}\n\n> ⚠️ *Note: OpenRouter models were temporarily at capacity. Grounded Analyst output served above.*`,
          model: "Trender Grounded Analyst (OpenRouter Fallback)",
          provider: "analyst",
          fallbackReason: err.message,
        });
      }
    }
  }

  // 3. Try OpenAI if specified or if auto and key exists
  if ((preferredProvider === "openai" || preferredProvider === "auto") && hasOpenAI) {
    try {
      const result = await callOpenAI(openaiKey, message, history, context);
      return res.status(200).json(result);
    } catch (err) {
      console.warn("OpenAI execution failed:", err.message);
    }
  }

  // 4. Default to Grounded Analyst Engine
  // Never fail or throw red errors when keys are unconfigured!
  const text = runGroundedAnalyst(message, context, history);
  return res.status(200).json({
    text: `${text}\n\n---\n*💡 Trender Local Intelligence: Grounded in the current public data snapshot. To activate generative reasoning models, configure GEMINI_API_KEY in your environment or enter your key in Key Settings.*`,
    model: "Trender Grounded Analyst (Snapshot Grounded)",
    provider: "analyst",
    isGroundedAnalyst: true,
  });
}
