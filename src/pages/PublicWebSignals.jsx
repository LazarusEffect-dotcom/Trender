import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Radar, RefreshCw, Search, Sparkles, X } from "lucide-react";
import MarkdownRenderer from "../components/MarkdownRenderer.jsx";
import "../live.css";

const FILTERS = [
  { id: "all", label: "All signals" },
  { id: "web", label: "Public web activity" },
  { id: "platforms", label: "Hosting platforms" },
];

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

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return (data?.sources || []).filter(item => {
      const matchesFilter = filter === "all" || categoryOf(item) === filter;
      const matchesQuery = !normalized || `${item.title} ${item.source} ${item.excerpt}`.toLowerCase().includes(normalized);
      return matchesFilter && matchesQuery;
    });
  }, [data, filter, query]);

  async function synthesizeWithAi() {
    if (!data?.sources?.length || aiLoading) return;
    setAiLoading(true);
    try {
      const sample = visible.slice(0, 12).map(s => ({ source: s.source, title: s.title, excerpt: s.excerpt }));
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Analyze these current open web signals, developer discussions, and hosting platforms. Synthesize them into 3 key technology themes and market shifts.",
          context: { webSignals: sample },
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
        <p>Explore current technology discussions and official website platform pages, with every item linked to its source.</p>
        <small className="freshness-note">{data?.fetchedAt ? `Snapshot retrieved ${new Date(data.fetchedAt).toLocaleString()}` : "Community activity is directional and does not measure total market demand."}</small>
      </div>
      <div className="heading-actions">
        <button className="primary-button" onClick={synthesizeWithAi} disabled={aiLoading || !data?.sources?.length}>
          <Sparkles size={15} /> {aiLoading ? "Synthesizing…" : "Synthesize with AI"}
        </button>
        <button className="small-action" onClick={() => load(true)} disabled={loading}>
          <RefreshCw size={15} className={loading ? "spin-icon" : ""}/>{loading ? "Refreshing…" : "Refresh signals"}
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
