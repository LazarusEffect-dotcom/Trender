import React, { useRef, useState } from "react";
import { Download, FileSpreadsheet, Image as ImageIcon } from "lucide-react";
import { downloadCsv } from "../lib/csv.js";

export default function ChartCard({ title, subtitle, children, exportRows, filename = "trender-chart" }) {
  const chartRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  async function exportPng() {
    if (!chartRef.current) return;
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(chartRef.current, { pixelRatio: 2, backgroundColor: "#ffffff" });
      const a = document.createElement("a"); a.download = `${filename}.png`; a.href = dataUrl; a.click();
    } catch (err) { console.error(err); alert("Chart export failed. Please try again."); }
    setMenuOpen(false);
  }

  return <section className="panel chart-panel">
    <div className="panel-heading">
      <div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>
      <div className="export-wrap">
        <button className="small-action" onClick={() => setMenuOpen(v => !v)}><Download size={15}/> Export</button>
        {menuOpen && <div className="export-menu">
          <button onClick={exportPng}><ImageIcon size={15}/> Download PNG</button>
          <button onClick={() => { downloadCsv(`${filename}.csv`, exportRows || []); setMenuOpen(false); }}><FileSpreadsheet size={15}/> Download CSV</button>
        </div>}
      </div>
    </div>
    <div ref={chartRef} className="chart-area">{children}</div>
  </section>;
}
