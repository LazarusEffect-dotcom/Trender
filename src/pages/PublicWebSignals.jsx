import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Radar, RefreshCw, Search, Sparkles, TrendingUp, X } from "lucide-react";
import MarkdownRenderer from "../components/MarkdownRenderer.jsx";
import { TREND_REGIONS } from "../data/trendRegions.js";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import "../live.css";

const FILTERS = [
  { id: "all", label: "All signals" },
  { id: "web", label: "Public web activity" },
  { id: "platforms", label: "Hosting platforms" },
];

function compactNumber(value) {
  return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(Number(value));
}

function categoryOf(item) {
  return item.source?.startsWith("Official ") ? "platforms" : "web";
}

export default function PublicWebSignals() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [aiSynthesis, setAiSynthesis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [trendRegion, setTrendRegion] = useState("US");
  const [trendData, setTrendData] = useState(null);
  const [trendError, setTrendError] = useState("");
  const [trendLoading, setTrendLoading] = useState(false);

  const loadTrends = useCallback(async (region = "US", refresh = false) => {
    setTrendLoading(true);
    setTrendError("");
    try {
      const suffix = refresh ? "&refresh=1" : "";
      const response = await fetch("/api/trends?geo=" + encodeURIComponent(region) + suffix, { cache: refresh ? "no-store" : "default" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not load Google Trends.");
      setTrendData(result);
    } catch (reason) {
      setTrendError(reason?.message || "Google Trends is temporarily unavailable.");
    } finally {
      setTrendLoading(false);
    }
  }, []);

  const load = useCallback(async (refresh = false) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/research${refresh ? "?refresh=1" : ""}`, { cache: refresh ? "no-store" : "default" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not load public web signals.");
      setData(result);
    } catch (reason) {
      setError(reason?.message || "Public web sources are temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadTrends(trendRegion); }, [loadTrends, trendRegion]);

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return (data?.sources || []).filter(item => {
      const matchesFilter = filter === "all" || categoryOf(item) === filter;
      const matchesQuery = !normalized || `${item.title} ${item.source} ${item.excerpt}`.toLowerCase().includes(normalized);
      return matchesFilter && matchesQuery;
    });
  }, [data, filter, query]);

  const currentTrends = trendData?.region?.code === trendRegion ? trendData : null;
  const trendChartData = useMemo(() => (currentTrends?.items || [])
    .filter(item => Number.isFinite(item.approximateTrafficValue))
    .sort((a, b) => b.approximateTrafficValue - a.approximateTrafficValue)
    .slice(0, 8), [currentTrends]);

  async function synthesizeWithAi() {
    if ((!visible.length && !currentTrends?.items?.length) || aiLoading) return;
    setAiLoading(true);
    try {
      const sample = visible.slice(0, 12).map(s => ({ source: s.source, title: s.title, excerpt: s.excerpt }));
      const trendSample = (currentTrends?.items || []).slice(0, 12).map(item => ({ title: item.title, approximateTraffic: item.approximateTraffic, publishedAt: item.publishedAt }));
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Analyze these current open-web signals and Google Search trend topics. Synthesize 3 themes, distinguish search attention from verified market demand, and state the data sources and freshness.",
          context: { webSignals: sample, googleTrends: { region: currentTrends?.region, retrievedAt: currentTrends?.retrievedAt, items: trendSample } },
        }),
      });
      const res = await response.json().catch(() => ({}));
      if (res.text) {
        setAiSynthesis(res.text);
      } else {
        throw new Error(res.error || "Synthesis could not be completed.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAiLoading(false);
    }
  }

  return <div className="page-content live-page">
    <div className="page-heading live-page-heading">
      <div><div className="eyebrow"><span className="live-dot"/> OPEN WEB RESEARCH</div><h1>Public Web Signals</h1>
        <p>Explore live regional Google search trends, current technology discussions, and official hosting platform pages with links to each source.</p>
        <small className="freshness-note">{data?.fetchedAt ? `Snapshot retrieved ${new Date(data.fetchedAt).toLocaleString()}` : "Community activity is directional and does not measure total market demand."}</small>
      </div>
      <div className="heading-actions">
        <button className="primary-button" onClick={synthesizeWithAi} disabled={aiLoading || (!visible.length && !currentTrends?.items?.length)}>
          <Sparkles size={15} /> {aiLoading ? "Synthesizing…" : "Synthesize with AI"}
        </button>
        <button className="small-action" onClick={() => { load(true); loadTrends(trendRegion, true); }} disabled={loading || trendLoading}>
          <RefreshCw size={15} className={loading || trendLoading ? "spin-icon" : ""}/>{loading || trendLoading ? "Refreshing…" : "Refresh signals"}
        </button>
      </div>
    </div>

    {/* AI Synthesis Box */}
    {aiSynthesis && (
      <div className="panel ai-dataset-panel" style={{ marginBottom: 18 }}>
        <div className="ai-dataset-header">
          <div className="ai-dataset-title">
            <Sparkles size={18} />
            <strong>AI Web Signal Synthesis</strong>
          </div>
          <button className="icon-button" onClick={() => setAiSynthesis("")} aria-label="Close AI synthesis">
            <X size={16} />
          </button>
        </div>
        <div className="ai-insights-box">
          <MarkdownRenderer content={aiSynthesis} />
        </div>
      </div>
    )}

    <section className="web-signal-intro">
      <div className="web-signal-icon"><Radar size={20}/></div>
      <div><strong>Public signals, with context</strong><p>Hacker News activity, new GitHub repositories, Webmasters questions, and Wikipedia pageviews are free-to-access indicators. They show activity on those services only; they are not sales, market-share, or consumer-panel data.</p></div>
    </section>

    <section className="panel live-trends-panel" aria-labelledby="google-trends-title">
      <div className="live-trends-heading">
        <div className="live-trends-title"><span className="trend-icon"><TrendingUp size={17}/></span><div><h2 id="google-trends-title">Trending searches</h2><p>Live Google Search activity · {TREND_REGIONS.find(region => region.code === trendRegion)?.name || trendRegion}</p></div></div>
        <div className="live-trends-actions">
          <label htmlFor="trend-region">Region</label>
          <select id="trend-region" value={trendRegion} onChange={event => setTrendRegion(event.target.value)} aria-label="Google Trends region">
            {TREND_REGIONS.map(region => <option key={region.code} value={region.code}>{region.name}</option>)}
          </select>
          <a className="source-link" href={currentTrends?.sourceUrl || "https://trends.google.com/trending/"} target="_blank" rel="noreferrer">Google Trends <ExternalLink size={13}/></a>
        </div>
      </div>
      {trendError && <div className="live-error" role="alert"><strong>Could not load Google Trends</strong><span>{trendError}</span><button className="small-action" onClick={() => loadTrends(trendRegion, true)}>Try again</button></div>}
      {trendLoading && !currentTrends && <div className="live-state" role="status">Loading current search trends…</div>}
      {currentTrends && <><div className="trend-status-line"><span className={currentTrends.status === "live" ? "live-dot" : "trend-muted-dot"}/><span>{currentTrends.status === "live" ? currentTrends.items.length + " current topics" : currentTrends.message}</span><time>Retrieved {new Date(currentTrends.retrievedAt).toLocaleString()}</time></div>
        {trendChartData.length > 0 && <div className="trend-chart-card"><div className="trend-chart-heading"><strong>Topics with the largest traffic buckets</strong><span>Approximate lower bounds · Google Trends RSS</span></div><ResponsiveContainer width="100%" height={Math.max(225, trendChartData.length * 32 + 52)}><BarChart data={trendChartData} layout="vertical" margin={{ top: 4, right: 20, bottom: 4, left: 0 }}><CartesianGrid stroke="#edf0f5" horizontal={false}/><XAxis type="number" tickFormatter={compactNumber} tick={{ fill: "#8991a3", fontSize: 10 }} axisLine={false} tickLine={false}/><YAxis type="category" dataKey="title" width={148} tickFormatter={title => title.length > 20 ? title.slice(0, 18) + "…" : title} tick={{ fill: "#68758b", fontSize: 10 }} axisLine={false} tickLine={false}/><Tooltip formatter={value => [compactNumber(value) + "+ approx.", "Traffic bucket floor"]}/><Bar dataKey="approximateTrafficValue" name="Approximate search traffic" fill="#5267e8" radius={[0, 5, 5, 0]} maxBarSize={19}/></BarChart></ResponsiveContainer></div>}
        {currentTrends.status === "live" ? <ol className="google-trend-list">{currentTrends.items.map((item, index) => <li className="google-trend-row" key={item.title + index}><span className="google-trend-order">{String(index + 1).padStart(2, "0")}</span><a href={item.url} target="_blank" rel="noreferrer"><strong>{item.title}</strong><ExternalLink size={13}/></a><span className="google-trend-traffic">{item.approximateTraffic}<small>approx. search traffic</small></span><time>{item.publishedAt ? new Date(item.publishedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</time></li>)}</ol> : <div className="live-state">Google Trends returned no live items. You can still open the official page for this region.</div>}
        <p className="report-footnote">Google supplies approximate traffic buckets and refreshes its Trending Now data periodically. Search spikes indicate attention, not sales, market size, or purchase intent. <a href={currentTrends.sourceUrl} target="_blank" rel="noreferrer">View Google Trends source</a>.</p>
      </>}
    </section>

    <div className="web-signal-controls">
      <div className="filter-tabs" role="tablist" aria-label="Filter public web signals">{FILTERS.map(item => <button key={item.id} className={filter === item.id ? "selected" : ""} onClick={() => setFilter(item.id)} role="tab" aria-selected={filter === item.id}>{item.label}</button>)}</div>
      <label className="web-signal-search"><Search size={15}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search titles and sources…" aria-label="Search public web signals"/></label>
    </div>

    {error && <div className="live-error" role="alert"><strong>Could not load the public web snapshot</strong><span>{error}</span><button className="small-action" onClick={() => load(true)}>Try again</button></div>}
    {loading && !data && <div className="live-state" role="status">Loading public web sources…</div>}
    {data && <>
      <div className="web-signal-count">{visible.length} source-linked items</div>
      <div className="web-signal-grid">{visible.map((item, index) => <article className={`web-signal-card ${categoryOf(item) === "platforms" ? "platform-card" : ""}`} key={`${item.source}-${item.title}-${index}`}>
        <div className="web-signal-card-top"><span className="signal-source-tag">{item.source}</span>{item.publishedAt && <time>{new Date(item.publishedAt).toLocaleString()}</time>}</div>
        <h3>{item.title}</h3><p>{item.excerpt}</p>
        <a href={item.url} target="_blank" rel="noreferrer">{categoryOf(item) === "platforms" ? "Open official platform page" : "Open original item"}<ExternalLink size={14}/></a>
      </article>)}</div>
      {visible.length === 0 && <div className="live-state">No items match this filter. Try another search or source group.</div>}
    </>}
  </div>;
}
