import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Command, Search, X } from "lucide-react";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";

const Overview = lazy(() => import("./pages/Overview.jsx"));
const GenericPage = lazy(() => import("./pages/GenericPage.jsx"));
const CompanyData = lazy(() => import("./pages/CompanyData.jsx"));
const Assistant = lazy(() => import("./pages/Assistant.jsx"));
const PublicWebSignals = lazy(() => import("./pages/PublicWebSignals.jsx"));
const ViralTrends = lazy(() => import("./pages/ViralTrends.jsx"));

const destinations = [
  { name: "Overview", detail: "Market data, all in one view", terms: "home dashboard pulse" },
  { name: "Global Markets", detail: "Indexes, currencies, sectors, and commodities", terms: "global macro economy fx currencies commodities" },
  { name: "Commodities", detail: "Gold, silver, copper, crude oil, and energy futures", terms: "gold silver copper oil energy natural gas gasoline heating oil futures" },
  { name: "Consumer Trends", detail: "Category growth and published survey findings", terms: "consumer products demand trends survey demographic omnibus" },
  { name: "Consumer attention", detail: "Social attention, product launches, and resale activity", terms: "viral fomo instagram tiktok resale products launches trends" },
  { name: "Industries", detail: "Industry momentum and comparisons", terms: "industry sector technology retail automotive" },
  { name: "Geographic Intelligence", detail: "Compare country-level economic indicators", terms: "geography region country location" },
  { name: "Public Web Signals", detail: "Search activity, developer projects, and web publishing", terms: "public web signals hosting cms hubspot wix wordpress webflow" },
  { name: "Company Data", detail: "Analyze a spreadsheet in your browser", terms: "upload csv excel company private datasets" },
  { name: "Research assistant", detail: "Ask the research assistant", terms: "ai ask assistant research analysis" },
  { name: "Reports & Exports", detail: "Download market and research data", terms: "report csv download export" },
  { name: "Watchlists & Alerts", detail: "Save instruments and set price alerts", terms: "watchlist alerts save monitor" },
  { name: "Settings", detail: "Appearance, refresh interval, and providers", terms: "settings preferences configuration" },
];

export default function App() {
  const [active, setActive] = useState("Overview");
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [assistantQuery, setAssistantQuery] = useState("");
  const searchInput = useRef(null);

  useEffect(() => {
    let settings = {};
    try { settings = JSON.parse(window.localStorage.getItem("trender.settings.v1") || "{}"); } catch { settings = {}; }
    const preference = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const theme = settings.theme === "system" ? (preference.matches ? "dark" : "light") : settings.theme;
      if (theme) document.documentElement.dataset.trenderTheme = theme;
      if (settings.density) document.documentElement.dataset.trenderDensity = settings.density;
    };
    apply();
    if (settings.theme !== "system") return undefined;
    preference.addEventListener("change", apply);
    return () => preference.removeEventListener("change", apply);
  }, []);

  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return destinations;
    return destinations.filter(item => `${item.name} ${item.detail} ${item.terms}`.toLowerCase().includes(normalized));
  }, [query]);

  function navigate(page) {
    setActive(page);
    setSearchOpen(false);
    setQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function askAi(promptText = "") {
    setAssistantQuery(promptText);
    navigate("Research assistant");
  }

  useEffect(() => {
    function handleShortcut(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") setSearchOpen(false);
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    const timeout = window.setTimeout(() => searchInput.current?.focus(), 40);
    return () => window.clearTimeout(timeout);
  }, [searchOpen]);

  return <div className="app-shell">
    <Sidebar active={active} onNavigate={navigate} collapsed={collapsed} onToggle={() => setCollapsed(v => !v)}/>
    <main className="main-shell">
      <Topbar
        active={active}
        onSearch={() => setSearchOpen(true)}
        onHelp={() => askAi("")}
        onNavigate={navigate}
      />
      <Suspense fallback={<div className="page-loading" role="status"><span className="loading-orbit"/>Loading market data…</div>}>
        {active === "Overview" ? <Overview onNavigate={navigate} onAskAi={askAi}/> :
         active === "Company Data" ? <CompanyData onNavigate={navigate} onAskAi={askAi}/> :
         active === "Research assistant" ? <Assistant key={assistantQuery} initialQuery={assistantQuery}/> :
         active === "Public Web Signals" ? <PublicWebSignals onNavigate={navigate} onAskAi={askAi}/> :
         active === "Consumer attention" ? <ViralTrends onNavigate={navigate} onAskAi={askAi}/> :
         <GenericPage active={active} onNavigate={navigate} onAskAi={askAi}/>}
      </Suspense>
    </main>
    {searchOpen && <div className="command-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setSearchOpen(false); }}>
      <section className="command-dialog" role="dialog" aria-modal="true" aria-label="Search market research">
        <div className="command-search-row">
          <Search size={19}/>
          <input ref={searchInput} value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && matches[0]) navigate(matches[0].name); }} placeholder="Search markets, companies, and reports…" aria-label="Search markets, companies, and research"/>
          <kbd>ESC</kbd>
          <button className="icon-button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={18}/></button>
        </div>
        <div className="command-caption">{query ? "MATCHING DESTINATIONS" : "QUICK NAVIGATION"}</div>
        <div className="command-results">{matches.map(item => <button key={item.name} className={`command-result ${active === item.name ? "current" : ""}`} onClick={() => navigate(item.name)}><span className="command-result-icon"><Command size={16}/></span><span className="command-result-copy"><strong>{item.name}</strong><small>{item.detail}</small></span><ArrowUpRight size={16} className="command-result-arrow"/></button>)}
          {matches.length === 0 && <div className="command-empty">No matches. Try a market, company, region, or report.</div>}
        </div>
        <footer className="command-footer"><span><kbd>↵</kbd> Open destination</span><span><kbd>⌘</kbd> <kbd>K</kbd> Open search</span></footer>
      </section>
    </div>}
  </div>;
}
