import React, { useState, useMemo } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bookmark,
  Check,
  Compass,
  DollarSign,
  ExternalLink,
  Eye,
  Filter,
  Flame,
  Layers,
  PieChart as PieIcon,
  Plus,
  RefreshCw,
  Search,
  Share2,
  Sparkles,
  Tag,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import MarkdownRenderer from "../components/MarkdownRenderer.jsx";
import {
  FOMO_PRODUCTS,
  INSTAGRAM_AESTHETICS,
  PLATFORM_SHARE,
  HYPE_LIFECYCLE_STAGES,
} from "../data/fomoTrends.js";
import { useCurrency } from "../context/CurrencyContext.jsx";
import "../live.css";

const CATEGORIES = [
  "All Categories",
  "Hydration & Lifestyle",
  "Collectibles & Streetwear",
  "Beauty & Skincare",
  "Food & Beverage",
  "Tech & Wearables",
];

const STAGES = [
  "All Stages",
  "Peak FOMO",
  "Stockout Craze",
  "Emerging Surge",
  "Mainstream Adoption",
];

const QUICK_PRESETS = [
  "Owala FreeSip Water Bottle",
  "Labubu Vinyl Face Plush",
  "Ceremonial Grade Matcha",
  "Rhode Lip Case",
  "Dubai Pistachio Chocolate",
  "Oura Ring Gen 4",
];

export default function ViralTrends({ onNavigate, onAskAi, genzMode }) {
  const { currency, currencySymbol, formatPrice, convert } = useCurrency();
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStage, setSelectedStage] = useState("All Stages");
  const [search, setSearch] = useState("");
  const [activeProductChart, setActiveProductChart] = useState(FOMO_PRODUCTS[0].id);
  const [chartView, setChartView] = useState("trajectory"); // trajectory | markup | aesthetics | platforms
  const [customTrendInput, setCustomTrendInput] = useState("");
  const [evaluatingAi, setEvaluatingAi] = useState(false);
  const [aiEvaluationReport, setAiEvaluationReport] = useState("");
  const [savedTrends, setSavedTrends] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("trender.watchlist.v1") || "[]");
    } catch {
      return [];
    }
  });

  const selectedProduct = useMemo(
    () => FOMO_PRODUCTS.find(p => p.id === activeProductChart) || FOMO_PRODUCTS[0],
    [activeProductChart]
  );

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FOMO_PRODUCTS.filter(item => {
      const matchCat =
        selectedCategory === "All Categories" || item.category === selectedCategory;
      const matchStage =
        selectedStage === "All Stages" || item.stage === selectedStage;
      const matchQ =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.viralTrigger.toLowerCase().includes(q);
      return matchCat && matchStage && matchQ;
    });
  }, [selectedCategory, selectedStage, search]);

  const markupChartData = useMemo(() => {
    return FOMO_PRODUCTS.slice(0, 8).map(p => ({
      name: p.name.split(" ")[0] + " " + (p.name.split(" ")[1] || ""),
      Retail: convert(p.retailPrice),
      Resale: convert(p.resalePrice),
      MarkupPct: p.resaleMarkup,
    }));
  }, [convert]);

  function toggleSaveTrend(product) {
    setSavedTrends(prev => {
      const exists = prev.some(item => item.id === product.id);
      let updated;
      if (exists) {
        updated = prev.filter(item => item.id !== product.id);
      } else {
        updated = [
          ...prev,
          {
            id: product.id,
            name: product.name,
            symbol: `FOMO:${product.id}`,
            price: formatPrice(product.resalePrice),
            category: product.category,
            fomoScore: product.fomoScore,
            createdAt: new Date().toISOString(),
          },
        ];
      }
      try {
        localStorage.setItem("trender.watchlist.v1", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }

  async function evaluateHypeWithAi(trendName = customTrendInput) {
    const term = trendName.trim();
    if (!term || evaluatingAi) return;
    setEvaluatingAi(true);
    setAiEvaluationReport("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Perform an in-depth Viral FOMO Trend & Hype Analysis on "${term}".
Include:
1. Estimated FOMO Index (0 - 100) and current Hype Lifecycle Stage (Emerging Surge, Peak FOMO, Stockout Craze, Mainstream, or Cooling Off).
2. Primary Social Viral Drivers (Instagram Reels, TikTok hashtags, Creator endorsements).
3. Pricing & Resale Premium Analysis (Retail vs Secondary Market dynamics).
4. Longevity & Obsolescence Risk: Will this become an evergreen staple or suffer rapid algorithm fatigue?
5. Strategic Advice for Brand Marketers & E-Commerce Sellers.
${genzMode ? "Use crisp, witty GenZ analogies alongside hard quantitative reasoning." : ""}`,
          context: {
            fomoProducts: FOMO_PRODUCTS,
            instagramAesthetics: INSTAGRAM_AESTHETICS,
          },
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (data.text) {
        setAiEvaluationReport(data.text);
      } else {
        throw new Error(data.error || "Could not evaluate trend.");
      }
    } catch (err) {
      setAiEvaluationReport(`⚠️ Could not complete AI evaluation: ${err.message}`);
    } finally {
      setEvaluatingAi(false);
    }
  }

  return (
    <div className="page-content live-page viral-trends-page">
      {/* Page Header */}
      <div className="page-heading live-page-heading">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> VIRAL COMMERCE & SOCIAL HYPE INTELLIGENCE
          </div>
          <h1>
            Instagram Trends & FOMO Products
            {genzMode && <span className="genz-pill-badge">NO CAP 🚀</span>}
          </h1>
          <p>
            {genzMode
              ? "Tracking what's living rent-free on Instagram, which drops are completely sold out, and the scalper resale markup math."
              : "Quantitative tracking of viral product velocity, social media drop culture, and secondary resale premiums."}
          </p>
          <small className="freshness-note">
            Multi-platform verification: Instagram Reels engagement, TikTok sound volume, and secondary resale indexes.
          </small>
        </div>

        <div className="heading-actions">
          {onAskAi && (
            <button
              className="primary-button"
              onClick={() =>
                onAskAi(
                  "Analyze the current top FOMO products (Stanley, Labubu, Owala, Rhode, Dubai Chocolate) and evaluate which trend has the longest staying power."
                )
              }
            >
              <Sparkles size={15} /> Ask AI about Viral Drops
            </button>
          )}
        </div>
      </div>

      {/* Live Hype Ticker Banner */}
      <div className="viral-ticker-banner">
        <div className="ticker-label">
          <Flame size={15} className="flame-icon" />
          <span>VIRAL TICKER</span>
        </div>
        <div className="ticker-content">
          <span className="ticker-item">
            🔥 <strong>Labubu 'The Monsters':</strong> 471% Resale Markup · Worldwide Stockout
          </span>
          <span className="ticker-sep">•</span>
          <span className="ticker-item">
            🍫 <strong>Dubai Pistachio Chocolate:</strong> 5.6B Views · +410% MoM Velocity
          </span>
          <span className="ticker-sep">•</span>
          <span className="ticker-item">
            🥤 <strong>Owala FreeSip:</strong> +245% MoM · Peak FOMO Stage
          </span>
          <span className="ticker-sep">•</span>
          <span className="ticker-item">
            🍵 <strong>Ceremonial Matcha:</strong> +210% MoM · Japan Supply Cap
          </span>
        </div>
      </div>

      {/* Interactive Charts Hub */}
      <section className="panel live-panel viral-chart-panel">
        <div className="panel-heading">
          <div>
            <h3>Interactive Trend & Resale Visualizer</h3>
            <p>
              {chartView === "trajectory" && `6-Month Hype Velocity Curve: ${selectedProduct.name}`}
              {chartView === "markup" && `Retail Price (${currencySymbol}) vs Secondary Market Resale (${currencySymbol})`}
              {chartView === "aesthetics" && "Instagram Aesthetic Movements (Millions of Reels)"}
              {chartView === "platforms" && "Where Viral Hype Originates (Platform Attribution Share)"}
            </p>
          </div>

          <div className="chart-view-tabs">
            <button
              className={`view-tab-btn ${chartView === "trajectory" ? "active" : ""}`}
              onClick={() => setChartView("trajectory")}
            >
              <TrendingUp size={13} /> Hype Trajectory
            </button>
            <button
              className={`view-tab-btn ${chartView === "markup" ? "active" : ""}`}
              onClick={() => setChartView("markup")}
            >
              <DollarSign size={13} /> Resale Markup
            </button>
            <button
              className={`view-tab-btn ${chartView === "aesthetics" ? "active" : ""}`}
              onClick={() => setChartView("aesthetics")}
            >
              <BarChart3 size={13} /> IG Aesthetics
            </button>
            <button
              className={`view-tab-btn ${chartView === "platforms" ? "active" : ""}`}
              onClick={() => setChartView("platforms")}
            >
              <PieIcon size={13} /> Platform Share
            </button>
          </div>
        </div>

        {/* Product selector when in Trajectory view */}
        {chartView === "trajectory" && (
          <div className="product-chip-selector">
            <span className="selector-title">Select Hero Product:</span>
            {FOMO_PRODUCTS.map(p => (
              <button
                key={p.id}
                className={`product-pill ${activeProductChart === p.id ? "active" : ""}`}
                onClick={() => setActiveProductChart(p.id)}
              >
                {p.name.split(" ")[0]} {p.name.split(" ")[1] || ""}
              </button>
            ))}
          </div>
        )}

        {/* Chart 1: Hype Trajectory Curve */}
        {chartView === "trajectory" && (
          <div className="chart-container">
            <div className="chart-meta-summary">
              <div className="chart-stat">
                <span>Peak FOMO Score</span>
                <strong>{selectedProduct.fomoScore}/100</strong>
              </div>
              <div className="chart-stat">
                <span>Hype Velocity</span>
                <strong className="positive-change">{selectedProduct.velocity}</strong>
              </div>
              <div className="chart-stat">
                <span>Current Stage</span>
                <span className="stage-tag">{selectedProduct.stage}</span>
              </div>
              <div className="chart-stat">
                <span>Social Reach</span>
                <strong>{selectedProduct.mentions}</strong>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={290}>
              <AreaChart data={selectedProduct.history} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="hypeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e11d48" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#e11d48" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="searchGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5267e8" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#5267e8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#edf0f5" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#8991a3", fontSize: 12 }} />
                <YAxis yAxisId="left" domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: "#8991a3", fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fill: "#8991a3", fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => [
                    name === "hype" ? `${value} pts (FOMO Index)` : `${value}K searches`,
                    name === "hype" ? "FOMO Index" : "Search Velocity Index",
                  ]}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="hype"
                  name="FOMO Index (0-100)"
                  stroke="#e11d48"
                  strokeWidth={3}
                  fill="url(#hypeGradient)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="searchVolume"
                  name="Search Index (K/mo)"
                  stroke="#5267e8"
                  strokeWidth={2}
                  fill="url(#searchGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Chart 2: Retail vs Resale Markup Comparison */}
        {chartView === "markup" && (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={markupChartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#edf0f5" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#8991a3", fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#8991a3", fontSize: 12 }} unit={currencySymbol} />
                <Tooltip formatter={(value, name) => [`${currencySymbol}${Number(value).toLocaleString()}`, name]} />
                <Legend />
                <Bar dataKey="Retail" name={`Official Retail Price (${currencySymbol})`} fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Resale" name={`Secondary Resale Price (${currencySymbol})`} fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Chart 3: Instagram Aesthetics Volume */}
        {chartView === "aesthetics" && (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={290}>
              <BarChart
                layout="vertical"
                data={INSTAGRAM_AESTHETICS}
                margin={{ top: 10, right: 30, left: 70, bottom: 0 }}
              >
                <CartesianGrid stroke="#edf0f5" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#8991a3", fontSize: 12 }} unit="M" />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#475569", fontSize: 11 }}
                  width={140}
                />
                <Tooltip formatter={(val) => [`${val} Million Reels`, "Reels Created"]} />
                <Bar dataKey="reelsCount" name="Total Reels Created (M)" radius={[0, 6, 6, 0]}>
                  {INSTAGRAM_AESTHETICS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.colorHex || "#5267e8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Chart 4: Platform Share Donut */}
        {chartView === "platforms" && (
          <div className="chart-container platforms-layout">
            <div className="donut-chart-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={PLATFORM_SHARE}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {PLATFORM_SHARE.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val}%`, "Attribution Share"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="platform-legend-list">
              <h4>Viral Trend Discovery Origin</h4>
              <p>Percentage of viral product spikes traced to first algorithmic catalyst.</p>
              {PLATFORM_SHARE.map(item => (
                <div className="platform-legend-row" key={item.name}>
                  <span className="legend-bullet" style={{ background: item.color }} />
                  <span className="platform-name">{item.name}</span>
                  <strong className="platform-val">{item.value}%</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Interactive AI FOMO Predictor Tool */}
      <section className="panel live-panel ai-predictor-panel">
        <div className="ai-predictor-header">
          <div className="ai-predictor-title">
            <div className="sparkle-circle-small">
              <Zap size={18} />
            </div>
            <div>
              <h3>AI FOMO Predictor & Hype Evaluator</h3>
              <p>
                Enter any product, aesthetic or brand to generate an instant AI Hype Score, Lifecycle Stage, and Obsolescence Risk analysis.
              </p>
            </div>
          </div>
        </div>

        <div className="ai-predictor-form">
          <div className="predictor-input-wrapper">
            <Search size={16} />
            <input
              type="text"
              placeholder="Enter product or viral trend (e.g. Owala Water Bottle, Dubai Chocolate, Salomon XT-6)..."
              value={customTrendInput}
              onChange={e => setCustomTrendInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") evaluateHypeWithAi();
              }}
            />
            <button
              className="primary-button"
              onClick={() => evaluateHypeWithAi()}
              disabled={evaluatingAi || !customTrendInput.trim()}
            >
              <Sparkles size={14} />
              {evaluatingAi ? "Evaluating Hype…" : "Evaluate Hype"}
            </button>
          </div>

          <div className="preset-chips-row">
            <span>Or try popular drops:</span>
            {QUICK_PRESETS.map(preset => (
              <button
                key={preset}
                className="preset-chip"
                onClick={() => {
                  setCustomTrendInput(preset);
                  evaluateHypeWithAi(preset);
                }}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {aiEvaluationReport && (
          <div className="ai-prediction-result-box">
            <div className="prediction-box-header">
              <span className="prediction-tag">
                <Sparkles size={12} /> Trender AI Trend Intelligence Report
              </span>
              <button
                className="small-action"
                onClick={() => evaluateHypeWithAi()}
                disabled={evaluatingAi}
              >
                <RefreshCw size={12} /> Re-evaluate
              </button>
            </div>
            <MarkdownRenderer content={aiEvaluationReport} />
          </div>
        )}
      </section>

      {/* FOMO Products Radar Controls */}
      <div className="viral-controls-row">
        <div className="filter-tabs" role="tablist">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={selectedCategory === cat ? "selected" : ""}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="viral-search-filter">
          <select
            value={selectedStage}
            onChange={e => setSelectedStage(e.target.value)}
            className="stage-filter-select"
          >
            {STAGES.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="web-signal-search">
            <Search size={14} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products, brands, viral hashtags…"
            />
          </div>
        </div>
      </div>

      {/* FOMO Products Grid */}
      <div className="fomo-product-grid">
        {filteredProducts.map(product => {
          const isSaved = savedTrends.some(s => s.id === product.id);
          return (
            <article className="fomo-product-card" key={product.id}>
              <div className="fomo-card-header">
                <div>
                  <span className="product-brand">{product.brand}</span>
                  <h3>{product.name}</h3>
                </div>
                <button
                  className={`watch-button ${isSaved ? "saved" : ""}`}
                  onClick={() => toggleSaveTrend(product)}
                  title={isSaved ? "Remove from watchlist" : "Add to watchlist"}
                >
                  {isSaved ? <Check size={14} /> : <Plus size={14} />}
                  {isSaved ? "Saved" : "Watch"}
                </button>
              </div>

              <div className="fomo-score-bar-wrapper">
                <div className="score-top-labels">
                  <span className="score-label">FOMO HYPE INDEX</span>
                  <strong className="score-number">{product.fomoScore} / 100</strong>
                </div>
                <div className="progress-track fomo-progress">
                  <div
                    className="progress-fill fomo-fill"
                    style={{
                      width: `${product.fomoScore}%`,
                      background:
                        product.fomoScore >= 95
                          ? "linear-gradient(90deg, #f43f5e, #e11d48)"
                          : product.fomoScore >= 90
                          ? "linear-gradient(90deg, #f59e0b, #ea580c)"
                          : "linear-gradient(90deg, #3b82f6, #6366f1)",
                    }}
                  />
                </div>
              </div>

              <div className="pricing-spread-box">
                <div className="price-item">
                  <small>Retail Price</small>
                  <strong>{formatPrice(product.retailPrice)}</strong>
                </div>
                <div className="price-arrow">→</div>
                <div className="price-item">
                  <small>Resale Market</small>
                  <strong className="resale-price">{formatPrice(product.resalePrice)}</strong>
                </div>
                <div className="resale-markup-badge">
                  +{product.resaleMarkup}% Premium
                </div>
              </div>

              <div className="product-meta-tags">
                <span className="stage-pill">{product.stage}</span>
                <span className="stockout-pill">{product.stockoutRisk}</span>
                <span className="platform-pill">{product.platform}</span>
              </div>

              <div className="viral-trigger-box">
                <span className="trigger-label">Viral Trigger:</span>
                <p>{product.viralTrigger}</p>
              </div>

              <div className="fomo-card-footer">
                <span className="reach-counter">
                  <Eye size={13} /> {product.mentions}
                </span>
                {onAskAi && (
                  <button
                    className="text-action fomo-ai-action"
                    onClick={() =>
                      onAskAi(
                        `Break down the hype cycle for "${product.name}" (${product.brand}). Retail price is $${product.retailPrice} vs resale $${product.resalePrice} (+${product.resaleMarkup}% markup). Why did it go viral and how long will the demand last?`
                      )
                    }
                  >
                    Analyze Hype <ArrowUpRight size={13} />
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="live-state" style={{ textAlign: "center", padding: "40px 10px" }}>
          No FOMO products matched your search or category filter. Try selecting 'All Categories'.
        </div>
      )}

      {/* Instagram Viral Aesthetics Section */}
      <section className="panel live-panel aesthetics-panel">
        <div className="panel-heading">
          <div>
            <h3>Trending Instagram Aesthetics & Movements</h3>
            <p>
              {genzMode
                ? "The vibe shifts dictating creator feeds, shopping carts, and algorithmic recommendations."
                : "Top cultural aesthetic movements categorized by Reels creation volume, YoY engagement growth, and associated consumer products."}
            </p>
          </div>
        </div>

        <div className="aesthetics-grid">
          {INSTAGRAM_AESTHETICS.map(item => (
            <article className="aesthetic-card" key={item.name}>
              <div className="aesthetic-card-top">
                <span className="aesthetic-volume">{item.reelsVolume}</span>
                <span className="aesthetic-growth positive-change">{item.growth}</span>
              </div>
              <h4>{item.name}</h4>
              <p className="aesthetic-demographic">
                Audience: <strong>{item.dominantDemographic}</strong>
              </p>

              <div className="aesthetic-hashtags">
                {item.hashtags.map(tag => (
                  <span className="hashtag-chip" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className="hero-products-box">
                <span className="hero-label">Hero Products:</span>
                <div className="hero-product-tags">
                  {item.heroProducts.map(p => (
                    <span className="hero-tag" key={p}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Hype Lifecycle Educational Drawer */}
      <section className="panel live-panel stages-guide-panel">
        <div className="panel-heading">
          <div>
            <h3>The Anatomy of a Viral Product Drop (Hype Lifecycle)</h3>
            <p>
              {genzMode
                ? "How a random product goes from underground TikTok find to sold-out frenzy and eventual TJ Maxx clearance."
                : "Standard multi-stage lifecycle of algorithmically driven consumer products."}
            </p>
          </div>
        </div>

        <div className="stages-flow-grid">
          {HYPE_LIFECYCLE_STAGES.map((st, i) => (
            <div className="stage-step-card" key={st.stage}>
              <div className="step-num">0{i + 1}</div>
              <strong>{st.stage}</strong>
              <small className="step-duration">{st.avgDays}</small>
              <p>{st.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
