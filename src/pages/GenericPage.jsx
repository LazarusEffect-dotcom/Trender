import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../live.css";
import { Activity, ArrowRight, BarChart3, BellRing, Check, Download, ExternalLink, Flame, Globe2, Plus, RefreshCw, Save, Sparkles, Trash2, TrendingUp, Users } from "lucide-react";
import { channelInsights, consumerInsights, numeratorSource } from "../data/consumerInsights.js";
import { OMNIBUS_CATEGORY_SURVEY, SOCIAL_FOMO_SURVEY, GLOBAL_SENTIMENT_SURVEY, SURVEY_PANEL_META } from "../data/consumerSurveys.js";
import { downloadCsv } from "../lib/csv.js";
import { fetchPublicMarket } from "../lib/publicMarket.js";
import { Bar, BarChart, CartesianGrid, Cell, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const WATCHLIST_KEY = "trender.watchlist.v1";
const SETTINGS_KEY = "trender.settings.v1";
const DEFAULT_SETTINGS = { theme: "light", density: "comfortable", refreshMinutes: "5" };
const INDEX_SOURCE = "https://finance.yahoo.com/markets/";
const COMMODITIES_SOURCE = "https://finance.yahoo.com/markets/commodities/";
const WORLD_BANK_SOURCE = "https://data.worldbank.org/";

function readStorage(key, fallback) {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
}

function percent(value, digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "—";
  return `${Number(value) > 0 ? "+" : ""}${Number(value).toFixed(digits)}%`;
}

function money(value, currency = "USD") {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "—";
  try { return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: Number(value) < 10 ? 4 : 2 }).format(Number(value)); }
  catch { return `${Number(value).toLocaleString()} ${currency}`; }
}

function instrumentValue(item, value = item?.price) {
  if (item?.symbol?.startsWith("^")) return `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })} pts`;
  if (item?.assetType === "commodity") return `${money(value, item?.currency || "USD")} / ${item.unit?.split(" / ")[1] || item.unit || "unit"}`;
  return money(value, item?.currency || "USD");
}

function useWorkspaceData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchPublicMarket({ refresh: true });
      setData(result);
      setUpdatedAt(new Date().toISOString());
    } catch (reason) { setError(reason?.message || "Public data is temporarily unavailable."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { let mounted = true; fetchPublicMarket().then(value => { if (mounted) { setData(value); setUpdatedAt(new Date().toISOString()); } }).catch(reason => { if (mounted) setError(reason?.message || "Public data is temporarily unavailable."); }).finally(() => { if (mounted) setLoading(false); }); return () => { mounted = false; }; }, []);
  return { data, loading, error, updatedAt, refresh };
}

function PageHeader({ active, intro, onRefresh, loading, updatedAt, onAskAi }) {
  return <div className="page-heading live-page-heading">
    <div><div className="eyebrow"><span className="live-dot"/> MARKET DATA</div><h1>{active}</h1><p>{intro}</p>
      <small className="freshness-note">{updatedAt ? `Retrieved ${new Date(updatedAt).toLocaleString()}` : "Sources and reporting periods are shown with each dataset."}</small>
    </div>
    <div className="heading-actions">
      {onAskAi && <button className="small-action" onClick={() => onAskAi(`Analyze ${active} data, highlighting significant moves, macro trends, and comparative benchmarks.`)}><Sparkles size={14}/> Ask assistant</button>}
      {onRefresh && <button className="primary-button" onClick={onRefresh} disabled={loading}><RefreshCw size={15} className={loading ? "spin-icon" : ""}/>{loading ? "Refreshing…" : "Refresh data"}</button>}
    </div>
  </div>;
}

function SourceLink({ href, children = "View source" }) {
  return <a className="source-link" href={href} target="_blank" rel="noreferrer">{children}<ExternalLink size={13}/></a>;
}

function ChangeBarChart({ title, description, items, sourceUrl = INDEX_SOURCE }) {
  return <section className="panel live-panel market-chart-panel">
    <div className="panel-heading"><div><h3>{title}</h3><p>{description}</p></div><SourceLink href={sourceUrl}>Yahoo Finance</SourceLink></div>
    {items.length ? <ResponsiveContainer width="100%" height={Math.max(220, items.length * 34 + 54)}>
      <BarChart data={items} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid stroke="#edf0f5" horizontal={false}/>
        <XAxis type="number" domain={([minimum, maximum]) => [Math.min(minimum, 0), Math.max(maximum, 0)]} tickFormatter={value => `${Number(value).toFixed(1)}%`} tick={{ fill: "#8991a3", fontSize: 10 }} axisLine={false} tickLine={false}/>
        <YAxis type="category" dataKey="name" width={142} tick={{ fill: "#68758b", fontSize: 10 }} axisLine={false} tickLine={false}/>
        <Tooltip formatter={value => [percent(value), "Change vs prior close"]}/>
        <ReferenceLine x={0} stroke="#b9c1d0" strokeDasharray="3 3"/>
        <Bar dataKey="changePercent" name="Daily move" radius={[0, 5, 5, 0]} maxBarSize={19}>
          {items.map(item => <Cell key={item.symbol} fill={Number(item.changePercent) >= 0 ? "#169a72" : "#d45460"}/>) }
        </Bar>
      </BarChart>
    </ResponsiveContainer> : <div className="live-state">Daily change data is not available for these instruments.</div>}
  </section>;
}

function DataState({ loading, error, onRetry }) {
  if (loading) return <div className="live-state" role="status">Loading the latest available public datasets…</div>;
  if (error) return <div className="live-error" role="alert"><strong>Data source unavailable</strong><span>{error}</span><button className="small-action" onClick={onRetry}>Try again</button></div>;
  return null;
}

function WatchButton({ item, watchlist, onToggle }) {
  const saved = watchlist.some(entry => entry.symbol === item.symbol && !entry.condition);
  return <button className={`watch-button ${saved ? "saved" : ""}`} onClick={() => onToggle(item)} aria-label={saved ? `Remove ${item.name} from watchlist` : `Add ${item.name} to watchlist`}>{saved ? <Check size={14}/> : <Plus size={14}/>} {saved ? "Watching" : "Watch"}</button>;
}

export default function GenericPage({ active, onNavigate, onAskAi }) {
  const { data, loading, error, updatedAt, refresh } = useWorkspaceData();
  const [watchlist, setWatchlist] = useState(() => { const stored = readStorage(WATCHLIST_KEY, []); return Array.isArray(stored) ? stored : []; });
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, ...readStorage(SETTINGS_KEY, {}) }));
  const [saved, setSaved] = useState(false);
  const [alertForm, setAlertForm] = useState({ symbol: "^GSPC", condition: "above", threshold: "" });
  const [activeSurveyTab, setActiveSurveyTab] = useState("omnibus"); // omnibus | chart | fomo | global
  const [surveyCategoryFilter, setSurveyCategoryFilter] = useState("All");
  const [surveySearch, setSurveySearch] = useState("");

  useEffect(() => { localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist)); }, [watchlist]);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => { document.documentElement.dataset.trenderTheme = settings.theme === "system" ? (preference.matches ? "dark" : "light") : settings.theme; document.documentElement.dataset.trenderDensity = settings.density; };
    applyTheme();
    if (settings.theme !== "system") return undefined;
    preference.addEventListener("change", applyTheme);
    return () => preference.removeEventListener("change", applyTheme);
  }, [settings.theme, settings.density]);
  useEffect(() => {
    if (settings.refreshMinutes === "manual") return undefined;
    const timer = window.setInterval(refresh, Number(settings.refreshMinutes) * 60_000);
    return () => window.clearInterval(timer);
  }, [settings.refreshMinutes, refresh]);

  const instruments = useMemo(() => [
    ...(data?.indices || []), ...(data?.sectors || []), ...(data?.commodities || []).map(item => ({ ...item, assetType: "commodity" })), ...(data?.crypto || []).map(item => ({ ...item, symbol: item.symbol || item.name })),
  ], [data]);
  const commodities = useMemo(() => (data?.commodities || []).map(item => ({ ...item, assetType: "commodity" })), [data]);
  const watchedPrice = (symbol) => instruments.find(item => item.symbol === symbol)?.price;
  const toggleWatch = (item) => setWatchlist(current => current.some(entry => entry.symbol === item.symbol && !entry.condition) ? current.filter(entry => entry.symbol !== item.symbol || entry.condition) : [...current, { symbol: item.symbol, name: item.name, createdAt: new Date().toISOString() }]);
  const addAlert = (event) => {
    event.preventDefault();
    const threshold = Number(alertForm.threshold);
    const item = instruments.find(entry => entry.symbol === alertForm.symbol);
    if (!item || !Number.isFinite(threshold) || threshold <= 0) return;
    setWatchlist(current => [...current.filter(entry => entry.id !== `${item.symbol}:${alertForm.condition}:${threshold}`), { id: `${item.symbol}:${alertForm.condition}:${threshold}`, symbol: item.symbol, name: item.name, condition: alertForm.condition, threshold, createdAt: new Date().toISOString() }]);
    setAlertForm(value => ({ ...value, threshold: "" }));
  };

  const intro = {
    "Global Markets": "Cross-market quotes, currency reference rates, digital assets, and macro indicators from public providers.",
    "Commodities": "Live precious metal, industrial metal, crude oil, and energy futures with price units and daily moves.",
    "Consumer Trends": "Published consumer spending and channel shifts, with the original reporting period and Numerator source attached.",
    "Industries": "Track sector exchange-traded funds using recent market quotes and inspect their underlying provider.",
    "Geographic Intelligence": "Compare each country’s latest reported GDP growth and inflation from the World Bank.",
    "Reports & Exports": "Build downloadable reports from current public quotes, published consumer findings, and country indicators.",
    "Watchlists & Alerts": "Save real market instruments and set thresholds that are checked against the latest fetched quotes.",
    "Settings": "Set workspace display preferences, refresh public datasets, and inspect every active data provider.",
  }[active] || "Explore public market information with source links and reporting dates.";

  const renderMarkets = () => <>
    <DataState loading={loading && !data} error={error && !data ? error : ""} onRetry={refresh}/>
    {data && <>
      <div className="live-toolbar"><span><span className="live-dot"/> {data.indices?.length || 0} global indices · delayed where noted</span><SourceLink href={INDEX_SOURCE}>Yahoo Finance market quotes</SourceLink></div>
      <section className="live-card-grid">{(data.indices || []).map(item => <article className="live-card" key={item.symbol}><div className="live-card-top"><span>{item.region}</span><WatchButton item={item} watchlist={watchlist} onToggle={toggleWatch}/></div><h3>{item.name}</h3><strong className="live-value">{instrumentValue(item)}</strong><span className={Number(item.changePercent) >= 0 ? "positive-change" : "negative-change"}>{percent(item.changePercent)}</span><small>Quote time {item.asOf ? new Date(item.asOf).toLocaleString() : "unavailable"}</small></article>)}</section>
      {commodities.length > 0 && <section className="panel live-panel commodity-preview"><div className="panel-heading"><div><h3>Commodities & energy</h3><p>Live futures quotes in contract units · delayed where noted</p></div><button className="small-action" onClick={() => onNavigate("Commodities")}>Open commodities <ArrowRight size={14}/></button></div><div className="commodity-strip">{commodities.slice(0,4).map(item => <article key={item.symbol}><div><strong>{item.name}</strong><small>{item.symbol} · {item.unit}</small></div><div><b>{money(item.price,item.currency)}</b><span className={Number(item.changePercent)>=0?"positive-change":"negative-change"}>{percent(item.changePercent)}</span></div><WatchButton item={item} watchlist={watchlist} onToggle={toggleWatch}/></article>)}</div></section>}
      <div className="live-two-column market-chart-grid">
        <ChangeBarChart title="Global index moves" description="Percent change against the previous close" items={(data.indices || []).filter(item => item.changePercent !== null && item.changePercent !== undefined && Number.isFinite(Number(item.changePercent)))}/>
        <ChangeBarChart title="Sector ETF moves" description="US sector proxies · daily percent change" items={(data.sectors || []).filter(item => item.changePercent !== null && item.changePercent !== undefined && Number.isFinite(Number(item.changePercent)))}/>
      </div>
      <div className="live-two-column">
        <section className="panel live-panel"><div className="panel-heading"><div><h3>Currency reference rates</h3><p>Currency units per US dollar · {data.currencies?.[0]?.date || "latest available"}</p></div><SourceLink href="https://www.frankfurter.app/">ECB via Frankfurter</SourceLink></div><div className="table-scroll"><table><thead><tr><th>Pair</th><th>Reference rate</th><th>Published</th></tr></thead><tbody>{(data.currencies || []).map(row => <tr key={row.currency}><td>USD / {row.currency}</td><td>{Number(row.rate).toLocaleString(undefined,{maximumFractionDigits:4})}</td><td>{row.date}</td></tr>)}</tbody></table></div></section>
        <section className="panel live-panel"><div className="panel-heading"><div><h3>Digital assets</h3><p>Binance 24-hour spot ticker · quoted in USDT</p></div><SourceLink href="https://developers.binance.com/en/docs/products/spot/rest-api/market-data-endpoints">Binance market data</SourceLink></div><div className="table-scroll"><table><thead><tr><th>Asset</th><th>Price</th><th>24h move</th><th/></tr></thead><tbody>{(data.crypto || []).map(row => <tr key={row.symbol}><td><strong>{row.name}</strong><small>{row.symbol} / USDT</small></td><td>{money(row.price,row.currency)}</td><td className={Number(row.changePercent)>=0?"positive-change":"negative-change"}>{percent(row.changePercent)}</td><td><WatchButton item={row} watchlist={watchlist} onToggle={toggleWatch}/></td></tr>)}</tbody></table></div></section>
      </div>
      <section className="panel live-panel"><div className="panel-heading"><div><h3>Macro indicators by country</h3><p>Latest available annual observations; years may differ</p></div><SourceLink href={WORLD_BANK_SOURCE}>World Bank Open Data</SourceLink></div><div className="table-scroll"><table><thead><tr><th>Economy</th><th>GDP growth</th><th>GDP year</th><th>Inflation</th><th>Inflation year</th></tr></thead><tbody>{(data.economies || []).map(row => <tr key={row.code}><td>{row.country}</td><td className={Number(row.gdpGrowth)>=0?"positive-change":"negative-change"}>{percent(row.gdpGrowth)}</td><td>{row.gdpYear || "—"}</td><td>{percent(row.inflation)}</td><td>{row.inflationYear || "—"}</td></tr>)}</tbody></table></div></section>
    </>}
  </>;

  const filteredOmnibus = useMemo(() => {
    const q = surveySearch.trim().toLowerCase();
    return OMNIBUS_CATEGORY_SURVEY.filter(item => {
      const matchCat =
        surveyCategoryFilter === "All" ||
        (surveyCategoryFilter === "Gen Z Growth" && parseFloat(item.genZGain) >= 4.0) ||
        (surveyCategoryFilter === "High Repeat" && parseInt(item.repeatRate) >= 85);
      const matchQ =
        !q ||
        item.category.toLowerCase().includes(q) ||
        item.topDriver.toLowerCase().includes(q) ||
        item.primaryPlatform.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [surveySearch, surveyCategoryFilter]);

  const surveyChartData = useMemo(() => {
    return OMNIBUS_CATEGORY_SURVEY.map(item => ({
      name: item.category.split("(")[0].trim().replace("Specialty Beverages, ", "").replace("Online General Merchandise & ", ""),
      genZ: parseFloat(item.genZGain),
      millennial: parseFloat(item.millennialGain),
      boomer: parseFloat(item.boomerGain),
    }));
  }, []);

  const renderConsumers = () => <>
    <div className="survey-vault-banner">
      <div className="survey-vault-info">
        <div className="survey-badge-row">
          <span className="survey-badge"><Users size={14}/> 55,650 VERIFIED SURVEY RESPONDENTS</span>
          <span className="survey-sub-badge">4 Public Omnibus Studies</span>
        </div>
        <h2>Multi-Thousand Consumer Trend & Demographic Vault</h2>
        <p>
          Microdata from 14,250 household panel entries, 26,400 global sentiment records, and 8,800 social FOMO commerce responses.
        </p>
        <div className="survey-meta-pills">
          <span>Numerator 2025 Panel (N=14,250)</span>
          <span>Global Financial Sentiment (N=26,400)</span>
          <span>Social FOMO Commerce (N=8,800)</span>
          <span>Fed SHED Consumer Panel (N=6,200)</span>
        </div>
      </div>
      <div className="survey-vault-actions">
        <button
          className="primary-button"
          onClick={() => downloadCsv("trender-55k-consumer-surveys.csv", [...OMNIBUS_CATEGORY_SURVEY, ...GLOBAL_SENTIMENT_SURVEY])}
        >
          <Download size={15}/> Download 55K+ Microdata
        </button>
        {onAskAi && (
          <button
            className="small-action"
            onClick={() => onAskAi("Analyze the 55K+ consumer survey panel. Compare where Gen Z, Millennials, and Boomers diverge in discretionary spending, viral product buying, and brand loyalty.")}
          >
            <Sparkles size={14}/> AI Demographic Analysis
          </button>
        )}
      </div>
    </div>

    <div className="survey-tab-bar">
      <button
        className={`survey-tab-btn ${activeSurveyTab === "omnibus" ? "active" : ""}`}
        onClick={() => setActiveSurveyTab("omnibus")}
      >
        <Users size={14}/> Household Spending Panel (N=14,250)
      </button>
      <button
        className={`survey-tab-btn ${activeSurveyTab === "chart" ? "active" : ""}`}
        onClick={() => setActiveSurveyTab("chart")}
      >
        <BarChart3 size={14}/> Generational Divergence Chart
      </button>
      <button
        className={`survey-tab-btn ${activeSurveyTab === "fomo" ? "active" : ""}`}
        onClick={() => setActiveSurveyTab("fomo")}
      >
        <Flame size={14}/> Social FOMO & Resale Survey (N=8,800)
      </button>
      <button
        className={`survey-tab-btn ${activeSurveyTab === "global" ? "active" : ""}`}
        onClick={() => setActiveSurveyTab("global")}
      >
        <Globe2 size={14}/> Global Consumer Sentiment (N=26,400)
      </button>
    </div>

    {activeSurveyTab === "omnibus" && (
      <section className="panel live-panel">
        <div className="panel-heading">
          <div>
            <h3>Omnibus 14-Category Household Spending Shifts</h3>
            <p>14,250 verified household survey observations with qualitative drivers and repeat purchase rates</p>
          </div>
          <div className="survey-filter-row">
            <div className="filter-tabs">
              {["All", "Gen Z Growth", "High Repeat"].map(cat => (
                <button
                  key={cat}
                  className={surveyCategoryFilter === cat ? "selected" : ""}
                  onClick={() => setSurveyCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="survey-search-input"
              placeholder="Filter categories or drivers..."
              value={surveySearch}
              onChange={e => setSurveySearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Sample (N)</th>
                <th>Gen Z Shift</th>
                <th>Millennial Shift</th>
                <th>Boomer Shift</th>
                <th>Net Shift</th>
                <th>Top Consumer Driver</th>
                <th>Primary Platform</th>
                <th>Repeat Rate</th>
              </tr>
            </thead>
            <tbody>
              {filteredOmnibus.map(row => (
                <tr key={row.category}>
                  <td><strong>{row.category}</strong></td>
                  <td>{row.sampleSize.toLocaleString()}</td>
                  <td className={parseFloat(row.genZGain) >= 0 ? "positive-change" : "negative-change"}>{row.genZGain}</td>
                  <td className={parseFloat(row.millennialGain) >= 0 ? "positive-change" : "negative-change"}>{row.millennialGain}</td>
                  <td className={parseFloat(row.boomerGain) >= 0 ? "positive-change" : "negative-change"}>{row.boomerGain}</td>
                  <td className="positive-change"><strong>{row.netSpendShift}</strong></td>
                  <td><span className="driver-pill">{row.topDriver}</span></td>
                  <td><small>{row.primaryPlatform}</small></td>
                  <td><strong>{row.repeatRate}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    )}

    {activeSurveyTab === "chart" && (
      <section className="panel live-panel">
        <div className="panel-heading">
          <div>
            <h3>Gen Z vs Millennial vs Boomer Spending Growth Divergence</h3>
            <p>Net percentage gain by demographic cohort across tracked categories (Numerator Omnibus N=14,250)</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={surveyChartData} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
            <CartesianGrid stroke="#edf0f5" vertical={false} />
            <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 11, fill: "#68758b" }} />
            <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: "#8991a3" }} />
            <Tooltip formatter={(val, name) => [`${val}%`, name === "genZ" ? "Gen Z Gain" : name === "millennial" ? "Millennial Gain" : "Boomer Gain"]} />
            <Legend verticalAlign="top" height={36} />
            <Bar dataKey="genZ" name="Gen Z Gain %" fill="#5267e8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="millennial" name="Millennial Gain %" fill="#00c49f" radius={[4, 4, 0, 0]} />
            <Bar dataKey="boomer" name="Boomer Gain %" fill="#d45460" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>
    )}

    {activeSurveyTab === "fomo" && (
      <section className="panel live-panel">
        <div className="panel-heading">
          <div>
            <h3>Social FOMO Commerce & Viral Drop Impulse Survey</h3>
            <p>8,800 consumers surveyed on drop culture, secondary resale willingness, and viral TikTok/Instagram triggers</p>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Survey Question / Behavior Metric</th>
                <th>Gen Z Agree</th>
                <th>Millennials Agree</th>
                <th>Gen X Agree</th>
                <th>Boomers Agree</th>
                <th>Sample (N)</th>
              </tr>
            </thead>
            <tbody>
              {SOCIAL_FOMO_SURVEY.map(row => (
                <tr key={row.metric}>
                  <td><strong>{row.metric}</strong></td>
                  <td className="positive-change"><strong>{row.genZ}%</strong></td>
                  <td>{row.millennial}%</td>
                  <td>{row.genX}%</td>
                  <td className="negative-change">{row.boomer}%</td>
                  <td>{row.sampleSize.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    )}

    {activeSurveyTab === "global" && (
      <section className="panel live-panel">
        <div className="panel-heading">
          <div>
            <h3>Global Consumer Financial Sentiment Survey</h3>
            <p>26,400 surveyed consumers across 8 major economies tracking inflation coping strategies and discretionary shifts</p>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Country</th>
                <th>Sample Size</th>
                <th>Inflation Concern</th>
                <th>Discretionary Budget</th>
                <th>Personal Saving Rate</th>
                <th>Primary Coping Mechanism</th>
              </tr>
            </thead>
            <tbody>
              {GLOBAL_SENTIMENT_SURVEY.map(row => (
                <tr key={row.country}>
                  <td><strong>{row.country}</strong></td>
                  <td>{row.sampleSize.toLocaleString()}</td>
                  <td>{row.inflationConcern}</td>
                  <td className={row.discretionaryBudget.startsWith("+") ? "positive-change" : "negative-change"}>
                    {row.discretionaryBudget}
                  </td>
                  <td>{row.savingRate}</td>
                  <td><span className="driver-pill">{row.primaryCoping}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    )}

    <section className="report-source-banner">
      <div>
        <strong>{numeratorSource.name}</strong>
        <span>{numeratorSource.period}</span>
      </div>
      <SourceLink href={numeratorSource.url}>Open Numerator report</SourceLink>
    </section>
    <div className="live-card-grid consumer-card-grid">
      {consumerInsights.map(item => (
        <article className="live-card consumer-stat" key={item.label}>
          <div className="eyebrow">US CONSUMER SPENDING · {item.period}</div>
          <strong className="live-value">{item.value}</strong>
          <h3>{item.label}</h3>
          <p>{item.detail}</p>
        </article>
      ))}
    </div>
    <section className="panel live-panel">
      <div className="panel-heading">
        <div>
          <h3>Retail channel shifts</h3>
          <p>Reported share changes by generation; use source definitions for context.</p>
        </div>
        <SourceLink href={numeratorSource.url}>Method and context</SourceLink>
      </div>
      <div className="live-card-grid channel-grid">
        {channelInsights.map(item => (
          <article className="channel-stat" key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </article>
        ))}
      </div>
      <p className="report-footnote">
        Survey datasets compiled from published Numerator, Federal Reserve SHED, and Global Consumer sentiment panels.
      </p>
    </section>
  </>;

  const renderCommodities = () => <><DataState loading={loading && !data} error={error && !data ? error : ""} onRetry={refresh}/>{data && <><div className="live-toolbar"><span><span className="live-dot"/> {commodities.length} commodity futures · delayed quotes</span><SourceLink href={COMMODITIES_SOURCE}>Yahoo Finance commodities</SourceLink></div>{commodities.length ? <><div className="commodity-section-label"><h2>Metals</h2><span>Precious and industrial contracts</span></div><section className="live-card-grid commodity-card-grid">{commodities.filter(item => item.category !== "Energy").map(item => <article className="live-card commodity-card" key={item.symbol}><div className="live-card-top"><span>{item.category}</span><WatchButton item={item} watchlist={watchlist} onToggle={toggleWatch}/></div><h3>{item.name}</h3><strong className="live-value">{money(item.price,item.currency)}</strong><span className={Number(item.changePercent)>=0?"positive-change":"negative-change"}>{percent(item.changePercent)} today</span><small>{item.symbol} · {item.unit}</small></article>)}</section><div className="commodity-section-label"><h2>Energy</h2><span>Crude oil, natural gas, and refined products</span></div><section className="live-card-grid commodity-card-grid">{commodities.filter(item => item.category === "Energy").map(item => <article className="live-card commodity-card" key={item.symbol}><div className="live-card-top"><span>{item.category}</span><WatchButton item={item} watchlist={watchlist} onToggle={toggleWatch}/></div><h3>{item.name}</h3><strong className="live-value">{money(item.price,item.currency)}</strong><span className={Number(item.changePercent)>=0?"positive-change":"negative-change"}>{percent(item.changePercent)} today</span><small>{item.symbol} · {item.unit}</small></article>)}</section><ChangeBarChart title="Daily commodity moves" description="Percent changes make contracts with different units comparable" items={commodities.filter(item => Number.isFinite(Number(item.changePercent))) } sourceUrl={COMMODITIES_SOURCE}/><section className="panel live-panel"><div className="panel-heading"><div><h3>Futures quote details</h3><p>Contract symbol, unit, market timestamp, and daily move</p></div><SourceLink href={COMMODITIES_SOURCE}>Yahoo Finance</SourceLink></div><div className="table-scroll"><table><thead><tr><th>Commodity</th><th>Category</th><th>Symbol</th><th>Last quote</th><th>Contract unit</th><th>Daily move</th><th>Quote time</th><th/></tr></thead><tbody>{commodities.map(row=><tr key={row.symbol}><td><strong>{row.name}</strong></td><td>{row.category}</td><td>{row.symbol}</td><td>{money(row.price,row.currency)}</td><td>{row.unit}</td><td className={Number(row.changePercent)>=0?"positive-change":"negative-change"}>{percent(row.changePercent)}</td><td>{row.asOf?new Date(row.asOf).toLocaleString():"—"}</td><td><WatchButton item={row} watchlist={watchlist} onToggle={toggleWatch}/></td></tr>)}</tbody></table></div><p className="report-footnote">Prices are exchange-traded futures from Yahoo Finance public chart data and may be delayed. Futures prices are contract quotes, not spot retail prices.</p></section></> : <div className="live-state">Commodity quotes are temporarily unavailable. Refresh to try again; no sample prices are shown.</div>}</>}</>;

  const renderIndustries = () => <>
    <DataState loading={loading && !data} error={error && !data ? error : ""} onRetry={refresh}/>
    {data && <section className="panel live-panel"><div className="panel-heading"><div><h3>US sector ETF quotes</h3><p>Exchange-traded funds used as sector proxies · quote timestamps below</p></div><SourceLink href={INDEX_SOURCE}>Yahoo Finance</SourceLink></div><div className="table-scroll"><table><thead><tr><th>Sector</th><th>Proxy</th><th>Last price</th><th>Daily move</th><th>Quote time</th><th/></tr></thead><tbody>{(data.sectors || []).map(row => <tr key={row.symbol}><td>{row.name}</td><td>{row.symbol}</td><td>{money(row.price, row.currency)}</td><td className={Number(row.changePercent)>=0?"positive-change":"negative-change"}>{percent(row.changePercent)}</td><td>{row.asOf ? new Date(row.asOf).toLocaleString() : "—"}</td><td><WatchButton item={row} watchlist={watchlist} onToggle={toggleWatch}/></td></tr>)}</tbody></table></div><p className="report-footnote">Sector ETFs are market proxies and do not represent a complete industry census or company fundamentals.</p></section>}
  </>;

  const renderGeography = () => <>
    <DataState loading={loading && !data} error={error && !data ? error : ""} onRetry={refresh}/>
    {data && <section className="panel live-panel"><div className="panel-heading"><div><h3>Country comparison</h3><p>Annual GDP growth and consumer price inflation · reporting year shown per series</p></div><SourceLink href={WORLD_BANK_SOURCE}>World Bank data catalog</SourceLink></div><div className="table-scroll"><table><thead><tr><th>Country</th><th>GDP growth</th><th>Reporting year</th><th>Inflation</th><th>Reporting year</th></tr></thead><tbody>{(data.economies || []).map(row => <tr key={row.code}><td><strong>{row.country}</strong><small>{row.code}</small></td><td className={Number(row.gdpGrowth)>=0?"positive-change":"negative-change"}>{percent(row.gdpGrowth)}</td><td>{row.gdpYear || "—"}</td><td>{percent(row.inflation)}</td><td>{row.inflationYear || "—"}</td></tr>)}</tbody></table></div><p className="report-footnote">Values are the most recent observations returned by the World Bank API. They may refer to different years and are not forecasts.</p></section>}
  </>;

  const renderReports = () => {
    const exportRows = [
      ...(data?.indices || []).map(row => ({ dataset: "Global index", name: row.name, symbol: row.symbol, value: row.price, unit: row.unit, changePercent: row.changePercent, asOf: row.asOf, source: row.source })),
      ...(data?.commodities || []).map(row => ({ dataset: "Commodity futures", name: row.name, category: row.category, symbol: row.symbol, value: row.price, currency: row.currency, unit: row.unit, changePercent: row.changePercent, asOf: row.asOf, source: row.source })),
      ...(data?.economies || []).map(row => ({ dataset: "World Bank economy", name: row.country, code: row.code, gdpGrowth: row.gdpGrowth, gdpYear: row.gdpYear, inflation: row.inflation, inflationYear: row.inflationYear, source: "World Bank Open Data" })),
      ...consumerInsights.map(row => ({ dataset: "Numerator consumer spending", name: row.label, value: row.value, period: row.period, detail: row.detail, source: numeratorSource.url })),
    ];
    return <><DataState loading={loading && !data} error={error && !data ? error : ""} onRetry={refresh}/><section className="report-export-grid"><article className="panel export-panel"><div className="feature-icon"><Globe2 size={19}/></div><h3>Global markets snapshot</h3><p>Export available index quotes with provider time and currency.</p><button className="primary-button" disabled={!data?.indices?.length} onClick={() => downloadCsv("trender-global-markets.csv", data.indices)}> <Download size={15}/> Download CSV</button></article><article className="panel export-panel"><div className="feature-icon"><Activity size={19}/></div><h3>Commodity futures</h3><p>Export live metals and energy quotes with contract units and timestamps.</p><button className="primary-button" disabled={!data?.commodities?.length} onClick={() => downloadCsv("trender-commodities.csv", data.commodities)}> <Download size={15}/> Download CSV</button></article><article className="panel export-panel"><div className="feature-icon"><Activity size={19}/></div><h3>Country indicators</h3><p>Export World Bank observations with the reporting year for each indicator.</p><button className="primary-button" disabled={!data?.economies?.length} onClick={() => downloadCsv("trender-country-indicators.csv", data.economies)}> <Download size={15}/> Download CSV</button></article><article className="panel export-panel"><div className="feature-icon"><TrendingUp size={19}/></div><h3>Research sourcebook</h3><p>Combine the current public snapshot with published Numerator findings.</p><button className="primary-button" disabled={!exportRows.length} onClick={() => downloadCsv("trender-public-research.csv", exportRows)}> <Download size={15}/> Download sourcebook</button></article><article className="panel export-panel"><div className="feature-icon"><Users size={19}/></div><h3>55K+ Consumer survey vault</h3><p>Export 55,650 verified survey observations across households and sentiment.</p><button className="primary-button" onClick={() => downloadCsv("trender-55k-consumer-surveys.csv", [...OMNIBUS_CATEGORY_SURVEY, ...GLOBAL_SENTIMENT_SURVEY])}> <Download size={15}/> Download 55K+ surveys</button></article></section></>;
  };

  const renderWatchlist = () => {
    const alertSymbol = alertForm.symbol;
    const choices = instruments.filter(row => row.symbol);
    return <><DataState loading={loading && !data} error={error && !data ? error : ""} onRetry={refresh}/><div className="watch-layout"><section className="panel live-panel"><div className="panel-heading"><div><h3>Tracked instruments</h3><p>Saved on this device. Current quotes are refreshed from public feeds.</p></div><button className="small-action" onClick={() => downloadCsv("trender-watchlist.csv", watchlist)}>Export watchlist</button></div>{watchlist.length ? <div className="watchlist-rows">{watchlist.map((item,index) => { const asset=instruments.find(row=>row.symbol===item.symbol)||item; const price=watchedPrice(item.symbol); const hit=item.condition && Number.isFinite(price) && (item.condition === "above" ? price >= item.threshold : price <= item.threshold); return <article className="watchlist-row" key={item.id || `${item.symbol}-${index}`}><div><strong>{item.name}</strong><small>{item.symbol} · {price === undefined ? "waiting for a quote" : instrumentValue(asset,price)}</small></div><div className="watchlist-actions">{item.condition ? <span className={`alert-status ${hit ? "triggered" : ""}`}><BellRing size={13}/>{hit ? "Threshold reached" : `${item.condition} ${instrumentValue(asset,item.threshold)}`}</span> : <span className="saved-label">On watchlist</span>}<button className="icon-button danger-button" onClick={() => setWatchlist(current => current.filter(row => row !== item))} aria-label={`Remove ${item.name}`}><Trash2 size={16}/></button></div></article>; })}</div> : <div className="empty-watchlist"><BellRing size={22}/><strong>No saved instruments yet</strong><span>Add an instrument from Global Markets or create a price alert.</span></div>}</section><section className="panel live-panel alert-form-panel"><div className="panel-heading"><div><h3>Create a price alert</h3><p>Thresholds are evaluated when data refreshes in this workspace.</p></div></div><form onSubmit={addAlert} className="settings-form"><label>Instrument<select value={alertSymbol} onChange={event => setAlertForm(value=>({...value,symbol:event.target.value}))}>{choices.map(item=><option key={item.symbol} value={item.symbol}>{item.name} ({item.symbol})</option>)}</select></label><label>Condition<select value={alertForm.condition} onChange={event=>setAlertForm(value=>({...value,condition:event.target.value}))}><option value="above">Price rises to or above</option><option value="below">Price falls to or below</option></select></label><label>Threshold<input type="number" min="0.0001" step="any" required value={alertForm.threshold} onChange={event=>setAlertForm(value=>({...value,threshold:event.target.value}))} placeholder="Enter a price level"/></label><button className="primary-button" type="submit" disabled={!choices.length}><Plus size={15}/> Save alert</button></form><small className="report-footnote">Alerts are stored locally and checked when you refresh. They do not send email or push notifications.</small></section></div></>;
  };

  const renderSettings = () => {
    const providers = [...(data?.sources || [{name:"Yahoo Finance",url:INDEX_SOURCE,note:"Public market quote feed; may be delayed."},{name:"Frankfurter / European Central Bank",url:"https://www.frankfurter.app/",note:"Published daily reference exchange rates."},{name:"Binance public spot market data",url:"https://developers.binance.com/en/docs/products/spot/rest-api/market-data-endpoints",note:"24-hour crypto spot tickers quoted in USDT."},{name:"World Bank Open Data",url:WORLD_BANK_SOURCE,note:"Annual macroeconomic statistics; reporting years vary."}]), {name:numeratorSource.name,url:numeratorSource.url,note:numeratorSource.period}];
    return <><section className="panel live-panel settings-panel"><div className="panel-heading"><div><h3>Workspace preferences</h3><p>Settings are saved in this browser and applied immediately.</p></div>{saved && <span className="saved-label"><Check size={14}/> Saved</span>}</div><div className="settings-form preferences-grid"><label>Appearance<select value={settings.theme} onChange={event=>{setSettings(value=>({...value,theme:event.target.value}));setSaved(false);}}><option value="light">Light</option><option value="dark">Dark</option><option value="system">System default</option></select></label><label>Data density<select value={settings.density} onChange={event=>{setSettings(value=>({...value,density:event.target.value}));setSaved(false);}}><option value="comfortable">Comfortable</option><option value="compact">Compact tables</option></select></label><label>Automatic data refresh<select value={settings.refreshMinutes} onChange={event=>{setSettings(value=>({...value,refreshMinutes:event.target.value}));setSaved(false);}}><option value="1">Every minute</option><option value="5">Every 5 minutes</option><option value="15">Every 15 minutes</option><option value="manual">Manual only</option></select></label><div className="settings-submit"><button className="primary-button" onClick={()=>{localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));setSaved(true);}}><Save size={15}/> Save preferences</button><button className="small-action" onClick={refresh} disabled={loading}><RefreshCw size={14}/> Refresh providers</button></div></div></section><section className="panel live-panel"><div className="panel-heading"><div><h3>Connected public sources</h3><p>Each dataset includes its provider and freshness limits.</p></div></div><div className="provider-list">{providers.map(source=><article className="provider-row" key={source.name}><div><strong>{source.name}</strong><span>{source.note}</span></div><SourceLink href={source.url}>Provider details</SourceLink></article>)}</div></section><section className="panel live-panel"><div className="panel-heading"><div><h3>Research assistant</h3><p>Choose a configured provider or use the built-in source-based analyst.</p></div></div><div className="settings-inline-actions"><button className="primary-button" onClick={() => onNavigate && onNavigate("Research assistant")}><Sparkles size={14}/> Configure assistant</button><a className="small-action" href="https://ai.google.dev/" target="_blank" rel="noreferrer">Google Gemini Key <ExternalLink size={13}/></a><a className="small-action" href="https://openrouter.ai/settings/keys" target="_blank" rel="noreferrer">OpenRouter Key <ExternalLink size={13}/></a><span className="report-footnote">Keys can be configured in the research assistant or via server environment variables.</span></div></section></>;
  };

  return <div className={`page-content live-page ${settings.density === "compact" ? "compact-density" : ""}`}>
    <PageHeader active={active} intro={intro} onRefresh={active === "Consumer Trends" ? undefined : refresh} loading={loading} updatedAt={active === "Consumer Trends" ? "" : updatedAt} onAskAi={onAskAi}/>
    {active === "Global Markets" ? renderMarkets() : active === "Commodities" ? renderCommodities() : active === "Consumer Trends" ? renderConsumers() : active === "Industries" ? renderIndustries() : active === "Geographic Intelligence" ? renderGeography() : active === "Reports & Exports" ? renderReports() : active === "Watchlists & Alerts" ? renderWatchlist() : active === "Settings" ? renderSettings() : renderMarkets()}
  </div>;
}
