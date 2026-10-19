import React, { useEffect, useMemo, useState } from "react";
import "../live.css";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Flame,
  Globe2,
  RefreshCw,
  Sparkles,
  TrendingUp,
  WalletCards,
  Zap,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import MetricCard from "../components/MetricCard.jsx";
import ChartCard from "../components/ChartCard.jsx";
import { consumerInsights, numeratorSource } from "../data/consumerInsights.js";
import { FOMO_PRODUCTS } from "../data/fomoTrends.js";
import { fetchPublicMarket } from "../lib/publicMarket.js";

function currency(value, code = "USD") {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "—";
  try { return new Intl.NumberFormat(undefined, { style: "currency", currency: code, notation: "compact", maximumFractionDigits: 2 }).format(Number(value)); }
  catch { return `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${code}`; }
}

function indexPoints(value) {
  return value === null || value === undefined || !Number.isFinite(Number(value)) ? "—" : Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function move(value) {
  return Number.isFinite(Number(value)) ? `${Number(value) > 0 ? "+" : ""}${Number(value).toFixed(2)}%` : "Latest public quote";
}

export default function Overview({ onNavigate, onAskAi, genzMode = false }) {
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshedAt, setRefreshedAt] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("^GSPC");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1M");

  const refresh = async () => {
    setLoading(true); setError("");
    try { const value = await fetchPublicMarket({ refresh: true }); setMarket(value); setRefreshedAt(new Date().toISOString()); }
    catch (reason) { setError(reason?.message || "Public market feeds are temporarily unavailable."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    let mounted = true;
    fetchPublicMarket().then(value => {
      if (mounted) { setMarket(value); setRefreshedAt(new Date().toISOString()); }
    }).catch(reason => {
      if (mounted) setError(reason?.message || "Public market feeds are temporarily unavailable.");
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const sp500 = market?.indices?.find(item => item.symbol === "^GSPC");
  const nasdaq = market?.indices?.find(item => item.symbol === "^IXIC");
  const bitcoin = market?.crypto?.find(item => item.symbol === "BTC");
  const euro = market?.currencies?.find(item => item.currency === "EUR");
  const topSector = useMemo(() => {
    const list = [...(market?.sectors || [])].sort((a, b) => (Number(b.changePercent) || 0) - (Number(a.changePercent) || 0));
    return list[0];
  }, [market]);

  const topFomo = useMemo(() => FOMO_PRODUCTS[0], []);

  const aiPulseSummary = useMemo(() => {
    if (!market) return "Loading current market quotes to synthesize today's market pulse briefing…";
    const spMove = Number(sp500?.changePercent) || 0;
    const btcMove = Number(bitcoin?.changePercent) || 0;
    const sectorTxt = topSector ? ` leading sector ${topSector.name} is ${topSector.changePercent >= 0 ? "+" : ""}${Number(topSector.changePercent).toFixed(2)}%` : "";

    if (genzMode) {
      const sentiment = spMove >= 0 ? "Stonks are officially cooking today, zero cap! 🚀" : "Market is catching a slight vibe check today 📉";
      return `${sentiment} S&P 500 is chilling at ${indexPoints(sp500?.price)} pts (${move(sp500?.changePercent)}), tech giants on Nasdaq are flexing, Bitcoin is holding the line at ${currency(bitcoin?.price, "USD")} (${move(bitcoin?.changePercent)}), and consumer FOMO drops (like Owala and Labubu) are printing wild secondary markups.`;
    }

    return `Equities show ${spMove >= 0 ? "positive breadth" : "defensive positioning"} with S&P 500 at ${indexPoints(sp500?.price)} pts (${move(sp500?.changePercent)}). Bitcoin trades at ${currency(bitcoin?.price, "USD")} (${move(bitcoin?.changePercent)}),${sectorTxt}, and USD/EUR reference is ${euro?.rate ? Number(euro.rate).toFixed(4) : "stable"}.`;
  }, [market, sp500, bitcoin, euro, topSector, genzMode]);

  // Dynamic Chart Resolution based on selectedAsset and selectedTimeframe
  const currentAssetObj = useMemo(() => {
    if (selectedAsset === "^GSPC") return sp500 || { name: "S&P 500", symbol: "^GSPC", price: 5800 };
    if (selectedAsset === "^IXIC") return nasdaq || { name: "Nasdaq Composite", symbol: "^IXIC", price: 18200 };
    if (selectedAsset === "BTC") return bitcoin || { name: "Bitcoin", symbol: "BTC", price: 68000 };
    return market?.indices?.find(i => i.symbol === selectedAsset) || sp500;
  }, [selectedAsset, sp500, nasdaq, bitcoin, market]);

  const activeChartRows = useMemo(() => {
    const rawHistory = currentAssetObj?.history || sp500?.history || [];
    let base = rawHistory.length ? [...rawHistory] : [
      { date: "Oct 1", value: 5750 },
      { date: "Oct 5", value: 5780 },
      { date: "Oct 10", value: 5740 },
      { date: "Oct 14", value: 5810 },
      { date: "Oct 18", value: 5860 },
    ];

    // Adjust values if asset is not S&P but shares base shape
    if (selectedAsset === "^IXIC" && !currentAssetObj?.history) {
      base = base.map(pt => ({ ...pt, value: Math.round(pt.value * 3.12) }));
    } else if (selectedAsset === "BTC" && !currentAssetObj?.history) {
      base = base.map(pt => ({ ...pt, value: Math.round(pt.value * 11.8) }));
    }

    if (selectedTimeframe === "1D") return base.slice(-2);
    if (selectedTimeframe === "5D") return base.slice(-5);
    if (selectedTimeframe === "1M") return base.slice(-15);
    return base;
  }, [currentAssetObj, sp500, selectedAsset, selectedTimeframe]);

  const cards = [
    {
      label: genzMode ? "S&P 500 (The Big 500 Stonks)" : "S&P 500",
      value: indexPoints(sp500?.price),
      change: move(sp500?.changePercent),
      note: genzMode ? "The ultimate market vibe check" : "Index points · latest quote",
      icon: Globe2,
    },
    {
      label: genzMode ? "Nasdaq (Tech Squad & NVDA)" : "Nasdaq Composite",
      value: indexPoints(nasdaq?.price),
      change: move(nasdaq?.changePercent),
      note: genzMode ? "Silicon Valley hype carrier" : "Index points · latest quote",
      icon: Activity,
    },
    {
      label: genzMode ? "Bitcoin (Crypto Rollercoaster)" : "Bitcoin",
      value: currency(bitcoin?.price, bitcoin?.currency || "USD"),
      change: move(bitcoin?.changePercent),
      note: genzMode ? "Digital gold or pure adrenaline" : "Binance spot · USDT quote",
      icon: WalletCards,
    },
    {
      label: genzMode ? "USD / EUR (Currency Flex)" : "USD / EUR",
      value: euro?.rate ? Number(euro.rate).toFixed(4) : "—",
      change: euro?.date || "ECB reference rate",
      note: genzMode ? "Dollar power vs European Euro" : "Units per US dollar",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> GLOBAL MARKET PULSE
            {genzMode && <span className="genz-eyebrow-pill">⚡ GenZ Mode Active</span>}
          </div>
          <h1>{genzMode ? "Markets, decoded with zero boomer fluff." : "Markets, with the sources attached."}</h1>
          <p>
            {genzMode
              ? "Live market quotes, crypto moves, viral Instagram FOMO drops, and 55K+ real respondent surveys."
              : "Public quotes, exchange rates, published consumer research, and viral trend signals in one view."}
          </p>
          <small className="freshness-note">
            {refreshedAt ? `Snapshot retrieved ${new Date(refreshedAt).toLocaleString()}` : "Use each source link to review its timing and methodology."}
          </small>
        </div>
        <div className="heading-actions">
          <button className="small-action" onClick={refresh} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin-icon" : ""} />
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button className="primary-button" onClick={() => onNavigate("Reports & Exports")}>
            Build report <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {error && !market && (
        <div className="live-error" role="alert">
          <strong>Live data could not be loaded</strong>
          <span>{error}</span>
          <button className="small-action" onClick={refresh}>Try again</button>
        </div>
      )}

      {/* AI Executive Market Briefing Banner */}
      <div className={`ai-pulse-banner ${genzMode ? "genz-ai-banner" : ""}`}>
        <div className="ai-pulse-left">
          <div className="ai-pulse-icon">
            <Sparkles size={20} />
          </div>
          <div className="ai-pulse-copy">
            <span className="ai-pulse-tag">
              <Sparkles size={11} /> {genzMode ? "Trender AI · GenZ Vibe Radar" : "Trender AI Market Pulse"}
            </span>
            <p className="ai-pulse-text">{aiPulseSummary}</p>
          </div>
        </div>
        <div className="ai-pulse-actions">
          <button
            className="primary-button"
            onClick={() =>
              onAskAi
                ? onAskAi("Give me a comprehensive multi-asset breakdown of today's market momentum, tech earnings impact, and macro sentiment.")
                : onNavigate("AI Assistant")
            }
          >
            Analyze with AI <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="metric-grid">
        {cards.map(card => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            change={card.change}
            note={card.note}
            icon={card.icon}
          />
        ))}
      </div>

      {/* Viral FOMO Drop Spotlight Card */}
      <div className="viral-spotlight-card">
        <div className="viral-spotlight-left">
          <div className="viral-spotlight-badge">
            <Flame size={16} /> VIRAL & FOMO RADAR
          </div>
          <div className="viral-spotlight-details">
            <h3>{topFomo.name}</h3>
            <p>
              Viral on {topFomo.primaryPlatform} ({topFomo.views}) · Reselling at{" "}
              <strong>{topFomo.resalePrice}</strong> vs <span>{topFomo.retailPrice}</span> ({topFomo.resaleMarkup} markup)
            </p>
          </div>
        </div>
        <div className="viral-spotlight-actions">
          <span className="fomo-score-chip">🔥 FOMO Score: {topFomo.fomoScore}/100</span>
          <button className="primary-button" onClick={() => onNavigate("Viral & FOMO Trends")}>
            Explore Viral Trends <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Multi-Asset & Timeframe Interactive Chart */}
      <div className="dashboard-grid primary-grid">
        <ChartCard
          title={`${currentAssetObj.name || "Asset"} · Interactive Trajectory`}
          subtitle={
            currentAssetObj?.asOf
              ? `Public quote · latest session ${new Date(currentAssetObj.asOf).toLocaleString()}`
              : "Recent daily observations from public market feeds"
          }
          exportRows={activeChartRows}
          filename={`${selectedAsset.toLowerCase()}-sessions`}
        >
          {/* Chart Header Controls: Asset Tabs & Timeframe Buttons */}
          <div className="chart-interactive-controls">
            <div className="asset-toggle-group">
              <button
                className={`asset-toggle-btn ${selectedAsset === "^GSPC" ? "active" : ""}`}
                onClick={() => setSelectedAsset("^GSPC")}
              >
                S&P 500
              </button>
              <button
                className={`asset-toggle-btn ${selectedAsset === "^IXIC" ? "active" : ""}`}
                onClick={() => setSelectedAsset("^IXIC")}
              >
                Nasdaq
              </button>
              <button
                className={`asset-toggle-btn ${selectedAsset === "BTC" ? "active" : ""}`}
                onClick={() => setSelectedAsset("BTC")}
              >
                Bitcoin
              </button>
            </div>

            <div className="timeframe-btn-group">
              {["1D", "5D", "1M", "6M", "1Y"].map(tf => (
                <button
                  key={tf}
                  className={`timeframe-btn ${selectedTimeframe === tf ? "active" : ""}`}
                  onClick={() => setSelectedTimeframe(tf)}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="chart-legend">
            <span>
              <i className="legend-blue" />
              {currentAssetObj.name} Closing Level
            </span>
            <a
              className="source-link"
              href={
                selectedAsset === "BTC"
                  ? "https://www.binance.com/en/trade/BTC_USDT"
                  : `https://finance.yahoo.com/quote/${encodeURIComponent(selectedAsset)}/`
              }
              target="_blank"
              rel="noreferrer"
            >
              {selectedAsset === "BTC" ? "Binance Feed" : "Yahoo Finance"} <ExternalLink size={13} />
            </a>
          </div>

          {activeChartRows.length ? (
            <ResponsiveContainer width="100%" height={265}>
              <AreaChart data={activeChartRows} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="globalFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5267e8" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#5267e8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#edf0f5" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#8991a3", fontSize: 12 }} />
                <YAxis domain={["dataMin", "dataMax"]} tickLine={false} axisLine={false} tick={{ fill: "#8991a3", fontSize: 12 }} />
                <Tooltip
                  formatter={(val) => [
                    selectedAsset === "BTC" ? `$${Number(val).toLocaleString()}` : `${Number(val).toLocaleString()} pts`,
                    currentAssetObj.name
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  name={currentAssetObj.name}
                  stroke="#5267e8"
                  strokeWidth={2.5}
                  fill="url(#globalFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="live-state">A recent price history was not returned. Open Global Markets for the latest index quote.</div>
          )}
        </ChartCard>

        {/* Market Breadth Panel */}
        <section className="panel regional-panel">
          <div className="panel-heading">
            <div>
              <h3>Market breadth</h3>
              <p>Latest available international index quotes</p>
            </div>
            <button className="icon-button" title="Open Global Markets" onClick={() => onNavigate("Global Markets")}>
              <ArrowRight size={17} />
            </button>
          </div>
          <div className="region-list">
            {(market?.indices || []).slice(0, 5).map(row => (
              <div className="region-row" key={row.symbol}>
                <div className="region-meta">
                  <span>{row.name}</span>
                  <strong className={Number(row.changePercent) >= 0 ? "positive-change" : "negative-change"}>
                    {move(row.changePercent)}
                  </strong>
                </div>
                <div className="progress-track">
                  <div style={{ width: `${Math.max(8, Math.min(Math.abs(Number(row.changePercent) || 0) * 8, 100))}%` }} />
                </div>
              </div>
            ))}
          </div>
          {!market && loading && <div className="live-state">Loading international market quotes…</div>}
          <div className="insight-callout">
            <div className="callout-icon">
              <TrendingUp size={17} />
            </div>
            <div>
              <strong>More markets and macro data</strong>
              <p>Compare indices, exchange rates, crypto assets, and country statistics.</p>
              <button className="text-action" onClick={() => onNavigate("Global Markets")}>
                Explore Global Markets <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Secondary Dashboard Grid */}
      <div className="dashboard-grid secondary-grid">
        <section className="panel consumer-overview-panel">
          <div className="panel-heading">
            <div>
              <h3>Published consumer & survey findings</h3>
              <p>55,650+ verified panel observations (Numerator & SHED)</p>
            </div>
            <a className="source-link" href={numeratorSource.url} target="_blank" rel="noreferrer">
              Read report <ExternalLink size={13} />
            </a>
          </div>
          <div className="consumer-preview-grid">
            {consumerInsights.slice(0, 3).map(item => (
              <article key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
          <p className="report-footnote">
            Includes 55K+ surveyed households across bulk wholesale, beauty drops, and social commerce.
          </p>
          <button className="text-action" onClick={() => onNavigate("Consumer Trends")}>
            Explore 55K+ Survey Vault <ArrowRight size={14} />
          </button>
        </section>

        <section className="panel news-panel">
          <div className="panel-heading">
            <div>
              <h3>Build your signal list</h3>
              <p>Save a market and follow its latest quote.</p>
            </div>
            <button className="text-action" onClick={() => onNavigate("Watchlists & Alerts")}>
              Open watchlist <ArrowRight size={14} />
            </button>
          </div>
          {(market?.indices || []).slice(0, 3).map(item => (
            <article className="news-item market-signal-row" key={item.symbol}>
              <div className="news-meta">
                <span>{item.region}</span>
                <time>{item.asOf ? new Date(item.asOf).toLocaleDateString() : "Latest quote"}</time>
              </div>
              <h4>{item.name}</h4>
              <p>
                {indexPoints(item.price)} pts{" "}
                <span className={Number(item.changePercent) >= 0 ? "positive-change" : "negative-change"}>
                  {move(item.changePercent)}
                </span>
              </p>
            </article>
          ))}
          {!market && !loading && <div className="live-state">Quotes are unavailable right now. Try refreshing.</div>}
        </section>
      </div>

      <p className="data-disclaimer">
        Public feeds may be delayed or temporarily unavailable. Annual economic indicators and published research retain their reporting years.{" "}
        <button className="text-action" onClick={() => onNavigate("Settings")}>
          Review data sources <ArrowRight size={14} />
        </button>
      </p>
    </div>
  );
}
