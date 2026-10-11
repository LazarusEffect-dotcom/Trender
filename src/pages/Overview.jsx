import React, { useState } from "react";
import { Activity, Globe2, TrendingUp, ShieldAlert, ArrowUpRight, ArrowRight } from "lucide-react";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import MetricCard from "../components/MetricCard.jsx";
import ChartCard from "../components/ChartCard.jsx";
import { marketSeries, categoryData, regionData, newsItems } from "../data/demoData.js";

export default function Overview({ onNavigate }) {
  const [period, setPeriod] = useState("all");
  const visibleSeries = period === "recent" ? marketSeries.slice(-3) : marketSeries;
  return <div className="page-content">
    <div className="page-heading">
      <div><div className="eyebrow"><span className="live-dot"/> MARKET PULSE <span className="demo-label">DEMO DATA</span></div>
        <h1>See where momentum is shifting.</h1><p>A clear view of category, regional, and demand signals.</p></div>
      <div className="heading-actions"><select value={period} onChange={event => setPeriod(event.target.value)} aria-label="Market chart range"><option value="recent">Last 3 sample months</option><option value="all">All 6 sample months</option></select><button className="primary-button" onClick={() => onNavigate("Reports & Exports")}>Create report <ArrowUpRight size={16}/></button></div>
    </div>
    <div className="metric-grid">
      <MetricCard label="Global market momentum" value="72.8" change="+4.2%" note="vs. previous sample" icon={Globe2}/>
      <MetricCard label="Consumer demand" value="68.4" change="+2.8%" note="vs. previous sample" icon={Activity}/>
      <MetricCard label="Emerging opportunities" value="24" change="+6 new" note="this month" icon={TrendingUp}/>
      <MetricCard label="Market volatility" value="Moderate" change="—" note="within normal range" icon={ShieldAlert}/>
    </div>
    <div className="dashboard-grid primary-grid">
      <ChartCard title="Global market performance" subtitle={`${period === "recent" ? "Recent 3 months" : "Six sample months"} · illustrative values`} exportRows={visibleSeries} filename="global-market-performance">
        <div className="chart-legend"><span><i className="legend-blue"/>Global market</span><span><i className="legend-green"/>Consumer demand</span></div>
        <ResponsiveContainer width="100%" height={265}><AreaChart data={visibleSeries} margin={{top:10,right:8,left:-18,bottom:0}}>
          <defs><linearGradient id="globalFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5267e8" stopOpacity={0.18}/><stop offset="100%" stopColor="#5267e8" stopOpacity={0}/></linearGradient></defs>
          <CartesianGrid stroke="#edf0f5" vertical={false}/><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{fill:"#8991a3",fontSize:12}}/><YAxis tickLine={false} axisLine={false} tick={{fill:"#8991a3",fontSize:12}}/><Tooltip/>
          <Area type="monotone" dataKey="global" name="Global market" stroke="#5267e8" strokeWidth={2.5} fill="url(#globalFill)"/><Line type="monotone" dataKey="demand" name="Consumer demand" stroke="#159a72" strokeWidth={2.2} dot={false}/>
        </AreaChart></ResponsiveContainer>
      </ChartCard>
      <section className="panel regional-panel">
        <div className="panel-heading"><div><h3>Regional momentum</h3><p>Growth index by region</p></div><button className="icon-button" title="View details" onClick={() => onNavigate("Geographic Intelligence")}><ArrowRight size={17}/></button></div>
        <div className="region-list">{regionData.map((r, i) => <div className="region-row" key={r.region}><div className="region-meta"><span>{r.region}</span><strong>+{r.momentum}%</strong></div><div className="progress-track"><div style={{width:`${Math.min(r.momentum/13*100,100)}%`,background:["#5267e8","#159a72","#d99a28","#8a68d9","#e17b42"][i]}}/></div></div>)}</div>
        <div className="insight-callout"><div className="callout-icon"><TrendingUp size={17}/></div><div><strong>Momentum leader</strong><p>South Asia shows the strongest illustrative momentum in this sample.</p></div></div>
      </section>
    </div>
    <div className="dashboard-grid secondary-grid">
      <ChartCard title="Consumer category growth" subtitle="Illustrative annual growth rate" exportRows={categoryData} filename="category-growth">
        <ResponsiveContainer width="100%" height={250}><BarChart data={categoryData} layout="vertical" margin={{top:0,right:12,left:12,bottom:0}}>
          <CartesianGrid stroke="#edf0f5" horizontal={false}/><XAxis type="number" tickLine={false} axisLine={false} tick={{fill:"#8991a3",fontSize:11}} unit="%"/><YAxis type="category" dataKey="name" width={105} tickLine={false} axisLine={false} tick={{fill:"#697386",fontSize:11}}/><Tooltip/><Bar dataKey="growth" name="Growth" fill="#5267e8" radius={[0,5,5,0]} barSize={15}/>
        </BarChart></ResponsiveContainer>
      </ChartCard>
      <section className="panel news-panel">
        <div className="panel-heading"><div><h3>Market signals</h3><p>Briefings · illustrative demo content</p></div><button className="text-action" onClick={() => onNavigate("Global Markets")}>View all <ArrowRight size={14}/></button></div>
        <div className="news-list">{newsItems.map(item => <article className="news-item" key={item.title}><div className="news-meta"><span>{item.tag}</span><time>{item.time}</time></div><h4>{item.title}</h4><p>{item.body}</p></article>)}</div>
      </section>
    </div>
    <p className="data-disclaimer">Demo environment · All displayed metrics and market briefings are illustrative and are not verified live market data.</p>
  </div>;
}
