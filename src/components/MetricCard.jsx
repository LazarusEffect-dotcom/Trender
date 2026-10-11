import React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export default function MetricCard({ label, value, change, note, icon: Icon, negative = false }) {
  const isFlat = change === "—";
  return <div className="metric-card">
    <div className="metric-top"><span>{label}</span><span className="metric-icon">{Icon && <Icon size={17}/>}</span></div>
    <div className="metric-value">{value}</div>
    <div className="metric-bottom">
      <span className={`change ${negative ? "negative" : isFlat ? "flat" : "positive"}`}>
        {isFlat ? <Minus size={13}/> : negative ? <ArrowDownRight size={14}/> : <ArrowUpRight size={14}/>}
        {change}
      </span>
      <span className="metric-note">{note}</span>
    </div>
  </div>;
}
