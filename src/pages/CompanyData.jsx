import React, { useMemo, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Download, BarChart3 } from "lucide-react";
import { downloadCsv } from "../lib/csv.js";
import { marketSeries } from "../data/demoData.js";

export default function CompanyData() {
  const [dataset, setDataset] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

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
    <div className="page-heading"><div><div className="eyebrow">PRIVATE ANALYTICS WORKSPACE</div><h1>Company data</h1><p>Upload your business data and explore it alongside market benchmarks.</p></div></div>
    <div className="security-note"><CheckCircle2 size={18}/><div><strong>Local preview mode</strong><p>Files are parsed in your browser in this starter. They are not uploaded to a database or saved to a server.</p></div></div>
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
      <p className="preview-note">Previewing first 8 rows. Numeric-looking columns: {numericColumns.join(", ") || "none detected"}.</p>
    </div>}
    <div className="section-title-row"><div><h2>Company vs. market</h2><p>Example comparison using illustrative market data.</p></div></div>
    <div className="comparison-callout"><div className="comparison-icon"><BarChart3 size={22}/></div><div><strong>Comparison workspace</strong><p>{dataset ? "Your file is loaded for a local preview. Map its date, product, region, and performance columns before comparing it with a genuinely comparable market benchmark." : "Upload a dataset to start exploring the comparison workflow. Useful fields include date, product, country, units sold, and revenue."}</p></div></div>
    <div className="mini-stats"><div><span>Sample market index</span><strong>{marketSeries.at(-1).global}</strong><small>Illustrative index</small></div><div><span>Sample company index</span><strong>{marketSeries.at(-1).company}</strong><small>Illustrative index</small></div><div><span>Gap</span><strong>{marketSeries.at(-1).company-marketSeries.at(-1).global}</strong><small>Index points · not revenue</small></div></div>
    <p className="data-disclaimer">Security note: before using confidential data, implement authenticated uploads, server-side validation, organization-level permissions, private storage, and database access policies.</p>
  </div>;
}
