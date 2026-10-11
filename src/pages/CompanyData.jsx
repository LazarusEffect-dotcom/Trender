import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Download, BarChart3, ExternalLink } from "lucide-react";
import { downloadCsv } from "../lib/csv.js";
import { fetchPublicMarket } from "../lib/publicMarket.js";

export default function CompanyData() {
  const [dataset, setDataset] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [benchmark, setBenchmark] = useState(null);

  useEffect(() => { fetchPublicMarket().then(data => setBenchmark(data.indices?.find(item => item.symbol === "^GSPC") || null)).catch(() => setBenchmark(null)); }, []);

  async function handleFile(file) {
    setError(""); setDataset(null);
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["csv","xlsx","xls"].includes(ext)) { setError("Please upload a CSV or Excel (.xlsx/.xls) file."); return; }
    if (file.size > 15 * 1024 * 1024) { setError("File exceeds the 15 MB starter limit."); return; }
    setBusy(true);
    try {
      let rows = [];
      if (ext === "csv") {
        const parsed = await new Promise((resolve, reject) => Papa.parse(file, { header:true, skipEmptyLines:true, complete:resolve, error:reject }));
        if (parsed.errors?.length && !parsed.data?.length) throw new Error("Could not parse CSV.");
        rows = parsed.data;
      } else {
        const buf = await file.arrayBuffer();
        const workbook = XLSX.read(buf, { type:"array" });
        rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval:"" });
      }
      if (!rows.length) throw new Error("No rows found. Check the file's first sheet or CSV headers.");
      setDataset({ name:file.name, rows, columns:Object.keys(rows[0]) });
    } catch (e) { setError(e.message || "Unable to read file."); }
    finally { setBusy(false); }
  }

  const numericColumns = useMemo(() => dataset?.columns.filter(c => dataset.rows.some(r => r[c] !== "" && Number.isFinite(Number(r[c])))) || [], [dataset]);
  return <div className="page-content">
    <div className="page-heading"><div><div className="eyebrow">PRIVATE ANALYTICS WORKSPACE</div><h1>Company data</h1><p>Review a company file locally and keep market context beside its source and date.</p></div></div>
    <div className="security-note"><CheckCircle2 size={18}/><div><strong>Private in-browser processing</strong><p>Files are read in this browser only. They are not uploaded to a database or saved to a server.</p></div></div>
    <label className={`upload-zone ${dragging ? "dragging" : ""}`} onDragOver={event => { event.preventDefault(); setDragging(true); }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false); }} onDrop={event => { event.preventDefault(); setDragging(false); handleFile(event.dataTransfer.files?.[0]); }}>
      <input type="file" accept=".csv,.xlsx,.xls" onChange={event => { handleFile(event.target.files?.[0]); event.target.value = ""; }} hidden/>
      <div className="upload-icon"><UploadCloud size={25}/></div><h3>{busy ? "Reading your file…" : "Upload a company dataset"}</h3>
      <p>Drop a CSV or Excel file here, or click to browse.</p><span>CSV, XLSX or XLS · Maximum 15 MB</span>
    </label>
    {error && <div className="error-banner"><AlertCircle size={17}/>{error}</div>}
    {dataset && <div className="panel import-result">
      <div className="panel-heading"><div><h3><FileSpreadsheet size={17} className="inline-icon"/> {dataset.name}</h3><p>{dataset.rows.length.toLocaleString()} rows · {dataset.columns.length} columns</p></div><button className="small-action" onClick={() => downloadCsv("trender-upload-preview.csv", dataset.rows)}><Download size={15}/> Export CSV</button></div>
      <div className="column-chips">{dataset.columns.map(c=><span key={c}>{c}{numericColumns.includes(c) && <b> #</b>}</span>)}</div>
      <div className="table-scroll"><table><thead><tr>{dataset.columns.slice(0,8).map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{dataset.rows.slice(0,8).map((row,i)=><tr key={i}>{dataset.columns.slice(0,8).map(c=><td key={c}>{String(row[c] ?? "")}</td>)}</tr>)}</tbody></table></div>
      <p className="preview-note">Showing the first 8 rows. Numeric fields detected: {numericColumns.join(", ") || "none detected"}.</p>
    </div>}
    <div className="section-title-row"><div><h2>Market benchmark context</h2><p>Current public reference point; file metrics are not compared until periods and units match.</p></div></div>
    <div className="comparison-callout"><div className="comparison-icon"><BarChart3 size={22}/></div><div><strong>S&P 500 index</strong><p>{benchmark ? `Latest available quote: ${Number(benchmark.price).toLocaleString(undefined,{maximumFractionDigits:2})} points · ${benchmark.asOf ? new Date(benchmark.asOf).toLocaleString() : "timestamp unavailable"}.` : "The public benchmark is temporarily unavailable. Open Global Markets to refresh its sources."}{" "}<a href="https://finance.yahoo.com/quote/%5EGSPC/" target="_blank" rel="noreferrer">Yahoo Finance source <ExternalLink size={12}/></a></p></div></div>
    <div className="mini-stats"><div><span>Uploaded records</span><strong>{dataset ? dataset.rows.length.toLocaleString() : "—"}</strong><small>{dataset ? "Local file" : "Upload a file to begin"}</small></div><div><span>Numeric fields</span><strong>{dataset ? numericColumns.length : "—"}</strong><small>{dataset ? numericColumns.join(", ") || "None detected" : "Detected from your file"}</small></div><div><span>S&P 500 benchmark</span><strong>{benchmark ? Number(benchmark.price).toLocaleString(undefined,{maximumFractionDigits:2}) : "—"}</strong><small>{benchmark?.asOf ? new Date(benchmark.asOf).toLocaleDateString() : "Latest public quote"}</small></div></div>
    <p className="data-disclaimer">Company files stay in this browser and are not sent to Trender AI. Protect sensitive data on shared or public devices.</p>
  </div>;
}
