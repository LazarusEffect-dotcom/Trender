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
  TrendingUp,
  WalletCards,
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

export default function Overview({ onNavigate, onAskAi }) {
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshedAt, setRefreshedAt] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("^GSPC");

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

  const marketNote = useMemo(() => {
    if (!market) return "Waiting for the latest market snapshot.";
    const facts = [];
    if (sp500) facts.push("S&P 500 " + move(sp500.changePercent));
    if (bitcoin) facts.push("Bitcoin " + move(bitcoin.changePercent));
    if (topSector) facts.push(topSector.name + " " + move(topSector.changePercent));
    if (euro?.rate) facts.push("USD/EUR " + Number(euro.rate).toFixed(4));
    return facts.length ? facts.join(" · ") : "No current quotes are available.";
  }, [market, sp500, bitcoin, euro, topSector]);

  const currentAssetObj = useMemo(() => {
    if (selectedAsset === "BTC") return bitcoin;
    return market?.indices?.find(item => item.symbol === selectedAsset);
  }, [selectedAsset, bitcoin, market]);

  const activeChartRows = useMemo(() => (currentAssetObj?.history || []).filter(point => Number.isFinite(Number(point.value))), [currentAssetObj]);
  const cards = [
    {
      label: "S&P 500",
      value: indexPoints(sp500?.price),
      change: move(sp500?.changePercent),
      note: "Index points · latest quote",
      icon: Globe2,
    },
    {
      label: "Nasdaq Composite",
      value: indexPoints(nasdaq?.price),
      change: move(nasdaq?.changePercent),
      note: "Index points · latest quote",
      icon: Activity,
    },
    {
      label: "Bitcoin",
      value: currency(bitcoin?.price, bitcoin?.currency || "USD"),
      change: move(bitcoin?.changePercent),
      note: "Binance spot · USDT quote",
      icon: WalletCards,
    },
    {
      label: "USD / EUR",
      value: euro?.rate ? Number(euro.rate).toFixed(4) : "—",
      change: euro?.date || "ECB reference rate",
      note: "Units per US dollar",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow"><span className="live-dot"/> MARKET OVERVIEW</div>
          <h1>Markets at a glance</h1>
          <p>Indexes, currencies, commodities, and published consumer research.</p>
          <small className="freshness-note">
            {refreshedAt ? `Updated ${new Date(refreshedAt).toLocaleString()}` : "Source and quote time are shown with each dataset."}
          </small>
        </div>
        <div className="heading-actions">
          <button className="small-action" onClick={refresh} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin-icon" : ""} />
            {loading ? "Refreshing…" : "Refresh data"}
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

      <section className="market-note-banner">
        <div><span className="market-note-label">LATEST SNAPSHOT</span><p>{marketNote}</p></div>
        <button className="small-action" onClick={() => onAskAi ? onAskAi("Review the current market snapshot. Separate reported data from interpretation and cite sources where available.") : onNavigate("Research assistant")}>
          <ArrowUpRight size={14}/> Ask research assistant
        </button>
      </section>
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
          <div className="viral-spotlight-badge"><Flame size={15}/> CONSUMER ATTENTION</div>
          <div className="viral-spotlight-details">
            <h3>{topFomo.name}</h3>
            <p>
              Trending on {topFomo.primaryPlatform} ({topFomo.views}) · Resale price
              <strong>{topFomo.resalePrice}</strong> vs <span>{topFomo.retailPrice}</span> retail
            </p>
          </div>
        </div>
        <div className="viral-spotlight-actions">
          <button className="primary-button" onClick={() => onNavigate("Consumer attention")}>
            View consumer trends <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Multi-Asset & Timeframe Interactive Chart */}
      <div className="dashboard-grid primary-grid">
        <ChartCard
          title={`${currentAssetObj?.name || "Market history"} · Recent closes`}
          subtitle={
            currentAssetObj?.asOf
              ? `Latest quote ${new Date(currentAssetObj.asOf).toLocaleString()} · recent daily closes`
              : "Recent daily closing prices from the selected public feed"
          }
          exportRows={activeChartRows}
          filename={`${selectedAsset.toLowerCase()}-recent-closes`}
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


          </div>

          <div className="chart-legend">
            <span>
              <i className="legend-blue" />
              {currentAssetObj?.name || "Selected market"} · daily close
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
                    <stop offset="0%" stopColor="#17654f" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#17654f" stopOpacity={0} />
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
                  name={currentAssetObj?.name || "Selected market"}
                  stroke="#17654f"
                  strokeWidth={2.5}
                  fill="url(#globalFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="live-state">Price history is not available for this selection yet. The latest quote remains available in Global Markets.</div>
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
