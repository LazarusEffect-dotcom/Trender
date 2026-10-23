import React from "react";
import {
  Activity, Globe2, ShoppingBag, Flame, Layers3, MapPinned, Database, Radar, Gem,
  MessageSquareText, FileBarChart, Bookmark, Settings, PanelLeftClose
} from "lucide-react";

const items = [
  ["Overview", Activity],
  ["Global Markets", Globe2],
  ["Commodities", Gem],
  ["Consumer Trends", ShoppingBag],
  ["Consumer attention", Flame],
  ["Industries", Layers3],
  ["Geographic Intelligence", MapPinned],
  ["Company Data", Database],
  ["Public Web Signals", Radar],
  ["Research assistant", MessageSquareText],
  ["Reports & Exports", FileBarChart],
  ["Watchlists & Alerts", Bookmark],
  ["Settings", Settings]
];

export default function Sidebar({ active, onNavigate, collapsed, onToggle }) {
  return <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
    <div className="brand-row">
      <div className="brand-mark">T</div>
      {!collapsed && <div className="brand-name">trender<span>.</span><small>MARKET RESEARCH</small></div>}
      <button className="icon-button sidebar-toggle" title="Toggle sidebar" onClick={onToggle}><PanelLeftClose size={17}/></button>
    </div>
    <div className="workspace-label">{!collapsed && "WORKSPACE"}</div>
    <nav>
      {items.map(([label, Icon]) => <button key={label} onClick={() => onNavigate(label)}
        className={`nav-item ${active === label ? "active" : ""}`} title={collapsed ? label : undefined}>
        <Icon size={18}/>{!collapsed && <span>{label}</span>}
      </button>)}
    </nav>
    {!collapsed && <div className="sidebar-bottom">
      <div className="plan-card"><div className="plan-dot"/> <div><strong>Public market data</strong><small>Markets · sectors · research</small></div></div>
      <p>Trender · Research desk</p>
    </div>}
  </aside>;
}
