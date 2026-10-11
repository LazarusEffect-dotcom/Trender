import React from "react";
import { ArrowRight, Upload, Search, Bot, Globe2, Database, FileBarChart, Bookmark, Settings, Layers3, ShoppingBag } from "lucide-react";
import { categoryData, regionData } from "../data/demoData.js";
import { downloadCsv } from "../lib/csv.js";

const configs = {
  "Global Markets": { icon: Globe2, intro: "Monitor macroeconomic indicators, currencies, commodities, and global market movements.", cards: ["Macroeconomic indicators", "Currency & FX", "Commodities", "Supply chain signals"] },
  "Consumer Trends": { icon: ShoppingBag, intro: "Discover rising product categories, consumer demand shifts, and changing purchase behavior.", cards: ["Emerging products", "Consumer demand", "Category growth", "Sentiment signals"] },
  "Industries": { icon: Layers3, intro: "Compare industry momentum and identify sectors gaining or losing traction.", cards: ["Technology", "Retail & e-commerce", "Automotive", "Food & beverage"] },
  "Geographic Intelligence": { icon: Globe2, intro: "Explore regional indicators and compare market opportunities across geographies.", cards: ["North America", "Europe", "South Asia", "East Asia"] },
  "Reports & Exports": { icon: FileBarChart, intro: "Export the available demo datasets and create a starting point for market reports.", cards: ["Market performance", "Consumer categories", "Regional momentum", "Company comparison"] },
  "Watchlists & Alerts": { icon: Bookmark, intro: "Track important indicators and configure the signals you want your team to monitor.", cards: ["Global momentum", "Consumer tech", "Electric mobility", "Currency volatility"] },
  "Settings": { icon: Settings, intro: "Configure integrations, workspace preferences, and account settings.", cards: ["Data sources", "Workspace", "Security", "Notifications"] }
};

export default function GenericPage({ active }) {
  const config = configs[active] || configs["Global Markets"];
  const Icon = config.icon;
  return <div className="page-content">
    <div className="page-heading"><div><div className="eyebrow">TRENDER WORKSPACE</div><h1>{active}</h1><p>{config.intro}</p></div>
      {active === "Reports & Exports" && <button className="primary-button" onClick={() => downloadCsv("trender-category-demo.csv", categoryData)}>Export sample CSV</button>}
    </div>
    <div className="feature-grid">{config.cards.map((label, i) => <div className="feature-card" key={label}><div className="feature-icon"><Icon size={19}/></div><div className="feature-card-title">{label}</div><p>{["Explore indicators and compare changes over time.","Review historical movement and available benchmarks.","Identify patterns and review the underlying data.","Save useful insights for future analysis."][i%4]}</p><div className="feature-footer"><span className="status-dot"/> Demo view <ArrowRight size={15}/></div></div>)}</div>
    <section className="panel table-panel"><div className="panel-heading"><div><h3>Available sample indicators</h3><p>Illustrative values for interface testing only</p></div><button className="small-action" onClick={() => downloadCsv("trender-region-demo.csv", regionData)}>Export CSV</button></div>
      <div className="table-scroll"><table><thead><tr><th>Region / category</th><th>Metric</th><th>Value</th><th>Status</th></tr></thead><tbody>
        {regionData.map((r,i)=><tr key={r.region}><td>{r.region}</td><td>Momentum index</td><td>{r.momentum.toFixed(1)}%</td><td><span className={`table-status ${i===2?"status-green":"status-blue"}`}>{i===2?"Leading":"Tracking"}</span></td></tr>)}
      </tbody></table></div>
    </section>
  </div>;
}
