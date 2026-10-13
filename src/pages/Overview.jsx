import React, { useEffect, useMemo, useState } from "react";
import "../live.css";
import { Activity, ArrowRight, ArrowUpRight, ExternalLink, Globe2, RefreshCw, Sparkles, TrendingUp, WalletCards } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import MetricCard from "../components/MetricCard.jsx";
import ChartCard from "../components/ChartCard.jsx";
import { consumerInsights, numeratorSource } from "../data/consumerInsights.js";
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

export default function Overview({ onNavigate }) {
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshedAt, setRefreshedAt] = useState("");

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

  const aiPulseSummary = useMemo(() => {
    if (!market) return "Loading current market quotes to synthesize today's market pulse briefing…";
    const spMove = Number(sp500?.changePercent) || 0;
    const btcMove = Number(bitcoin?.changePercent) || 0;
    const sectorTxt = topSector ? ` leading sector ${topSector.name} is ${topSector.changePercent >= 0 ? "+" : ""}${Number(topSector.changePercent).toFixed(2)}%` : "";
    return `Equities show ${spMove >= 0 ? "positive breadth" : "defensive positioning"} with S&P 500 at ${indexPoints(sp500?.price)} pts (${move(sp500?.changePercent)}). Bitcoin trades at ${currency(bitcoin?.price, "USD")} (${move(bitcoin?.changePercent)}),${sectorTxt}, and USD/EUR reference is ${euro?.rate ? Number(euro.rate).toFixed(4) : "stable"}.`;
  }, [market, sp500, bitcoin, euro, topSector]);

  const chartRows = (sp500?.history || []).map(row => ({ ...row, symbol: "^GSPC", unit: "index points", source: sp500?.source || "Yahoo Finance public chart feed" }));
  const cards = [
    { label: "S&P 500", value: indexPoints(sp500?.price), change: move(sp500?.changePercent), note: "Index points · latest quote", icon: Globe2 },
    { label: "Nasdaq Composite", value: indexPoints(nasdaq?.price), change: move(nasdaq?.changePercent), note: "Index points · latest quote", icon: Activity },
    { label: "Bitcoin", value: currency(bitcoin?.price, bitcoin?.currency || "USD"), change: move(bitcoin?.changePercent), note: "Binance spot · USDT quote", icon: WalletCards },
    { label: "USD / EUR", value: euro?.rate ? Number(euro.rate).toFixed(4) : "—", change: euro?.date || "ECB reference rate", note: "Units per US dollar", icon: TrendingUp },
  ];

  return <div className="page-content">
    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="live-dot"/> GLOBAL MARKET PULSE</div>
        <h1>Markets, with the sources attached.</h1>
        <p>Public quotes, exchange rates, and published consumer research in one view.</p>
        <small className="freshness-note">{refreshedAt ? `Snapshot retrieved ${new Date(refreshedAt).toLocaleString()}` : "Use each source link to review its timing and methodology."}</small>
      </div>
      <div className="heading-actions">
        <button className="small-action" onClick={refresh} disabled={loading}><RefreshCw size={14} className={loading?"spin-icon":""}/>{loading?"Refreshing…":"Refresh"}</button>
        <button className="primary-button" onClick={() => onNavigate("Reports & Exports")}>Build report <ArrowUpRight size={16}/></button>
      </div>
    </div>

    {error && !market && <div className="live-error" role="alert"><strong>Live data could not be loaded</strong><span>{error}</span><button className="small-action" onClick={refresh}>Try again</button></div>}

    {/* AI Executive Market Briefing Banner */}
    <div className="ai-pulse-banner">
      <div className="ai-pulse-left">
        <div className="ai-pulse-icon"><Sparkles size={20}/></div>
        <div className="ai-pulse-copy">
          <span className="ai-pulse-tag"><Sparkles size={11}/> Trender AI Market Pulse</span>
          <p className="ai-pulse-text">{aiPulseSummary}</p>
        </div>
      </div>
      <div className="ai-pulse-actions">
        <button className="primary-button" onClick={() => onNavigate("AI Assistant")}>
          Analyze with AI <ArrowUpRight size={14}/>
        </button>
      </div>
    </div>

    <div className="metric-grid">{cards.map(card=><MetricCard key={card.label} label={card.label} value={card.value} change={card.change} note={card.note} icon={card.icon}/>)}</div>
    
    <div className="dashboard-grid primary-grid">
      <ChartCard title="S&P 500 · recent sessions" subtitle={sp500?.asOf ? `Public index quote · latest session ${new Date(sp500.asOf).toLocaleString()}` : "Recent daily observations returned by Yahoo Finance"} exportRows={chartRows} filename="sp500-recent-sessions">
        <div className="chart-legend"><span><i className="legend-blue"/>S&P 500 closing level</span><a className="source-link" href="https://finance.yahoo.com/quote/%5EGSPC/" target="_blank" rel="noreferrer">Yahoo Finance <ExternalLink size={13}/></a></div>
        {chartRows.length ? <ResponsiveContainer width="100%" height={265}><AreaChart data={chartRows} margin={{top:10,right:8,left:-18,bottom:0}}><defs><linearGradient id="globalFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5267e8" stopOpacity={0.18}/><stop offset="100%" stopColor="#5267e8" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#edf0f5" vertical={false}/><XAxis dataKey="date" tickLine={false} axisLine={false} tick={{fill:"#8991a3",fontSize:12}}/><YAxis domain={["dataMin", "dataMax"]} tickLine={false} axisLine={false} tick={{fill:"#8991a3",fontSize:12}}/><Tooltip/><Area type="monotone" dataKey="value" name="S&P 500" stroke="#5267e8" strokeWidth={2.5} fill="url(#globalFill)"/></AreaChart></ResponsiveContainer> : <div className="live-state">A recent price history was not returned. Open Global Markets for the latest index quote.</div>}
      </ChartCard>
      <section className="panel regional-panel">
        <div className="panel-heading"><div><h3>Market breadth</h3><p>Latest available international index quotes</p></div><button className="icon-button" title="Open Global Markets" onClick={() => onNavigate("Global Markets")}><ArrowRight size={17}/></button></div>
        <div className="region-list">{(market?.indices||[]).slice(0,5).map(row=><div className="region-row" key={row.symbol}><div className="region-meta"><span>{row.name}</span><strong className={Number(row.changePercent)>=0?"positive-change":"negative-change"}>{move(row.changePercent)}</strong></div><div className="progress-track"><div style={{width:`${Math.max(8,Math.min(Math.abs(Number(row.changePercent)||0)*8,100))}%`}}/></div></div>)}</div>
        {!market && loading && <div className="live-state">Loading international market quotes…</div>}
        <div className="insight-callout"><div className="callout-icon"><TrendingUp size={17}/></div><div><strong>More markets and macro data</strong><p>Compare indices, exchange rates, crypto assets, and country statistics.</p><button className="text-action" onClick={() => onNavigate("Global Markets")}>Explore Global Markets <ArrowRight size={14}/></button></div></div>
      </section>
    </div>
    <div className="dashboard-grid secondary-grid">
      <section className="panel consumer-overview-panel"><div className="panel-heading"><div><h3>Published consumer findings</h3><p>Numerator · reported for 2025</p></div><a className="source-link" href={numeratorSource.url} target="_blank" rel="noreferrer">Read report <ExternalLink size={13}/></a></div><div className="consumer-preview-grid">{consumerInsights.slice(0,3).map(item=><article key={item.label}><strong>{item.value}</strong><span>{item.label}</span></article>)}</div><p className="report-footnote">Published findings with their reporting period; not a real-time consumer panel feed.</p><button className="text-action" onClick={() => onNavigate("Consumer Trends")}>Explore consumer trends <ArrowRight size={14}/></button></section>
      <section className="panel news-panel">
        <div className="panel-heading"><div><h3>Build your signal list</h3><p>Save a market and follow its latest quote.</p></div><button className="text-action" onClick={() => onNavigate("Watchlists & Alerts")}>Open watchlist <ArrowRight size={14}/></button></div>
        {(market?.indices||[]).slice(0,3).map(item=><article className="news-item market-signal-row" key={item.symbol}><div className="news-meta"><span>{item.region}</span><time>{item.asOf?new Date(item.asOf).toLocaleDateString():"Latest quote"}</time></div><h4>{item.name}</h4><p>{indexPoints(item.price)} pts <span className={Number(item.changePercent)>=0?"positive-change":"negative-change"}>{move(item.changePercent)}</span></p></article>)}
        {!market && !loading && <div className="live-state">Quotes are unavailable right now. Try refreshing.</div>}
      </section>
    </div>
    <p className="data-disclaimer">Public feeds may be delayed or temporarily unavailable. Annual economic indicators and published research retain their reporting years. <button className="text-action" onClick={() => onNavigate("Settings")}>Review data sources <ArrowRight size={14}/></button></p>
  </div>;
}
