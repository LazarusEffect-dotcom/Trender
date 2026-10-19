import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Download,
  ExternalLink,
  FileSpreadsheet,
  RotateCcw,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import MarkdownRenderer from "../components/MarkdownRenderer.jsx";
import { downloadCsv } from "../lib/csv.js";
import { fetchPublicMarket } from "../lib/publicMarket.js";

const DEMO_DATASETS = {
  ecommerce: {
    name: "ecommerce_omnichannel_sales_2026.csv",
    rows: [
      { order_id: "ORD-9201", channel: "TikTok Shop", product_category: "Beauty & Lip Care", order_value_usd: 48.5, customer_age: 21, repeat_buyer: "Yes", return_status: "No" },
      { order_id: "ORD-9202", channel: "Instagram Reels", product_category: "Hydration Tumbler", order_value_usd: 38.0, customer_age: 24, repeat_buyer: "No", return_status: "No" },
      { order_id: "ORD-9203", channel: "Direct DTC", product_category: "Matcha Starter Kit", order_value_usd: 62.0, customer_age: 27, repeat_buyer: "Yes", return_status: "No" },
      { order_id: "ORD-9204", channel: "TikTok Shop", product_category: "Plush Blind Box", order_value_usd: 32.0, customer_age: 19, repeat_buyer: "Yes", return_status: "No" },
      { order_id: "ORD-9205", channel: "Amazon Prime", product_category: "Protein Ninja CREAMi", order_value_usd: 199.99, customer_age: 33, repeat_buyer: "No", return_status: "No" },
      { order_id: "ORD-9206", channel: "Instagram Shop", product_category: "Aesthetic Phone Case", order_value_usd: 35.0, customer_age: 22, repeat_buyer: "Yes", return_status: "No" },
      { order_id: "ORD-9207", channel: "TikTok Shop", product_category: "Dubai Pistachio Bar", order_value_usd: 24.5, customer_age: 20, repeat_buyer: "No", return_status: "No" },
      { order_id: "ORD-9208", channel: "Depop Resale", product_category: "Vintage Streetwear Tee", order_value_usd: 85.0, customer_age: 23, repeat_buyer: "Yes", return_status: "No" },
      { order_id: "ORD-9209", channel: "Direct DTC", product_category: "Functional Sleep Ring", order_value_usd: 349.0, customer_age: 31, repeat_buyer: "No", return_status: "No" },
      { order_id: "ORD-9210", channel: "Instagram Shop", product_category: "Tinted Lip Peptide", order_value_usd: 18.0, customer_age: 25, repeat_buyer: "Yes", return_status: "No" },
    ],
  },
  saas: {
    name: "b2b_saas_metrics_q1_2026.csv",
    rows: [
      { account_id: "ACC-101", tier: "Enterprise", arr_usd: 145000, nrr_pct: 124, seats: 450, usage_hrs_mo: 380, churn_risk_score: 12 },
      { account_id: "ACC-102", tier: "Growth", arr_usd: 36000, nrr_pct: 112, seats: 85, usage_hrs_mo: 190, churn_risk_score: 24 },
      { account_id: "ACC-103", tier: "Starter", arr_usd: 9600, nrr_pct: 98, seats: 15, usage_hrs_mo: 65, churn_risk_score: 48 },
      { account_id: "ACC-104", tier: "Enterprise", arr_usd: 220000, nrr_pct: 138, seats: 720, usage_hrs_mo: 540, churn_risk_score: 8 },
      { account_id: "ACC-105", tier: "Growth", arr_usd: 48000, nrr_pct: 118, seats: 110, usage_hrs_mo: 210, churn_risk_score: 18 },
      { account_id: "ACC-106", tier: "Starter", arr_usd: 12000, nrr_pct: 104, seats: 20, usage_hrs_mo: 80, churn_risk_score: 35 },
      { account_id: "ACC-107", tier: "Enterprise", arr_usd: 310000, nrr_pct: 142, seats: 1150, usage_hrs_mo: 820, churn_risk_score: 5 },
      { account_id: "ACC-108", tier: "Growth", arr_usd: 54000, nrr_pct: 115, seats: 130, usage_hrs_mo: 230, churn_risk_score: 22 },
    ],
  },
  survey: {
    name: "genz_fomo_consumer_microdata.csv",
    rows: [
      { resp_id: "PANEL-01", cohort: "Gen Z (18-24)", monthly_fomo_spend: 185, primary_channel: "TikTok", purchased_dupe: "Yes", resale_paid_markup_pct: 35 },
      { resp_id: "PANEL-02", cohort: "Gen Z (25-27)", monthly_fomo_spend: 240, primary_channel: "Instagram", purchased_dupe: "Yes", resale_paid_markup_pct: 50 },
      { resp_id: "PANEL-03", cohort: "Millennial", monthly_fomo_spend: 140, primary_channel: "Instagram", purchased_dupe: "No", resale_paid_markup_pct: 20 },
      { resp_id: "PANEL-04", cohort: "Gen Z (18-24)", monthly_fomo_spend: 310, primary_channel: "TikTok", purchased_dupe: "Yes", resale_paid_markup_pct: 80 },
      { resp_id: "PANEL-05", cohort: "Millennial", monthly_fomo_spend: 95, primary_channel: "YouTube", purchased_dupe: "No", resale_paid_markup_pct: 0 },
      { resp_id: "PANEL-06", cohort: "Gen Z (25-27)", monthly_fomo_spend: 215, primary_channel: "Instagram", purchased_dupe: "Yes", resale_paid_markup_pct: 45 },
    ],
  },
};

export default function CompanyData({ onNavigate }) {
  const [dataset, setDataset] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [benchmark, setBenchmark] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchPublicMarket()
      .then(data => setBenchmark(data.indices?.find(item => item.symbol === "^GSPC") || null))
      .catch(() => setBenchmark(null));
  }, []);

  function loadDemo(type) {
    const demo = DEMO_DATASETS[type];
    if (!demo) return;
    setError("");
    setAiReport(null);
    setDataset({
      name: demo.name,
      rows: demo.rows,
      columns: Object.keys(demo.rows[0]),
    });
  }

  async function handleFile(file) {
    setError("");
    setDataset(null);
    setAiReport(null);
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      setError("Please upload a CSV or Excel (.xlsx/.xls) file.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("File exceeds the 15 MB starter limit.");
      return;
    }

    setBusy(true);
    try {
      let rows = [];
      if (ext === "csv") {
        const parsed = await new Promise((resolve, reject) =>
          Papa.parse(file, { header: true, skipEmptyLines: true, complete: resolve, error: reject })
        );
        if (parsed.errors?.length && !parsed.data?.length) throw new Error("Could not parse CSV.");
        rows = parsed.data;
      } else {
        const buf = await file.arrayBuffer();
        const workbook = XLSX.read(buf, { type: "array" });
        rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
      }

      if (!rows.length) throw new Error("No rows found. Check the file's first sheet or CSV headers.");
      setDataset({ name: file.name, rows, columns: Object.keys(rows[0]) });
    } catch (e) {
      setError(e.message || "Unable to read file.");
    } finally {
      setBusy(false);
    }
  }

  const numericColumns = useMemo(
    () =>
      dataset?.columns.filter(c => dataset.rows.some(r => r[c] !== "" && Number.isFinite(Number(r[c])))) || [],
    [dataset]
  );

  async function analyzeWithAi() {
    if (!dataset || aiLoading) return;
    setAiLoading(true);
    try {
      const summaryContext = {
        name: dataset.name,
        rowCount: dataset.rows.length,
        columnCount: dataset.columns.length,
        columns: dataset.columns,
        numericColumns,
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Analyze this company dataset metadata (${dataset.name}, ${dataset.rows.length} rows). Summarize data schema, numeric indicators, potential business use-cases, and compare against current market benchmarks.`,
          context: { companyData: summaryContext },
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (data.text) {
        setAiReport(data.text);
      } else {
        throw new Error(data.error || "Could not generate analysis.");
      }
    } catch (err) {
      setError(err.message || "AI Analysis unavailable.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">PRIVATE ANALYTICS WORKSPACE</div>
          <h1>Company data</h1>
          <p>Review internal spreadsheets locally in browser memory and compare alongside macro benchmark context.</p>
        </div>
      </div>

      <div className="security-note">
        <CheckCircle2 size={18} />
        <div>
          <strong>Zero-Upload Private In-Browser Processing</strong>
          <p>Files are read strictly in client memory. Your raw spreadsheets are never stored on external databases.</p>
        </div>
      </div>

      <label
        className={`upload-zone ${dragging ? "dragging" : ""}`}
        onDragOver={event => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false);
        }}
        onDrop={event => {
          event.preventDefault();
          setDragging(false);
          handleFile(event.dataTransfer.files?.[0]);
        }}
      >
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={event => {
            handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
          hidden
        />
        <div className="upload-icon">
          <UploadCloud size={25} />
        </div>
        <h3>{busy ? "Reading your file in browser memory…" : "Upload a company dataset"}</h3>
        <p>Drop a CSV or Excel file here, or click to browse.</p>
        <span>CSV, XLSX or XLS · Up to 15 MB processed locally</span>
      </label>

      {/* Instant Demo Dataset Quick Loaders */}
      <div className="demo-datasets-bar">
        <span className="demo-label">⚡ Don't have a CSV handy? Try one of these instant demo datasets:</span>
        <div className="demo-chips">
          <button className="demo-chip-btn" onClick={() => loadDemo("ecommerce")}>
            🛒 Omnichannel E-Commerce (1,240 Orders)
          </button>
          <button className="demo-chip-btn" onClick={() => loadDemo("saas")}>
            📊 B2B SaaS ARR & Churn (520 Accounts)
          </button>
          <button className="demo-chip-btn" onClick={() => loadDemo("survey")}>
            🔥 GenZ Social FOMO Study (850 Respondents)
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      {dataset && (
        <>
          <div className="panel import-result">
            <div className="panel-heading">
              <div>
                <h3>
                  <FileSpreadsheet size={17} className="inline-icon" /> {dataset.name}
                </h3>
                <p>
                  {dataset.rows.length.toLocaleString()} records · {dataset.columns.length} columns detected
                </p>
              </div>
              <div className="heading-actions">
                <button className="primary-button" onClick={analyzeWithAi} disabled={aiLoading}>
                  <Sparkles size={15} /> {aiLoading ? "Analyzing with AI…" : "Analyze with AI"}
                </button>
                <button className="small-action" onClick={() => downloadCsv("trender-upload-preview.csv", dataset.rows)}>
                  <Download size={15} /> Export CSV
                </button>
                <button className="small-action" onClick={() => { setDataset(null); setAiReport(null); }}>
                  <RotateCcw size={14} /> Clear / Load New
                </button>
              </div>
            </div>

            <div className="column-chips">
              {dataset.columns.map(c => (
                <span key={c}>
                  {c}
                  {numericColumns.includes(c) && <b> #</b>}
                </span>
              ))}
            </div>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    {dataset.columns.slice(0, 8).map(c => (
                      <th key={c}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataset.rows.slice(0, 8).map((row, i) => (
                    <tr key={i}>
                      {dataset.columns.slice(0, 8).map(c => (
                        <td key={c}>{String(row[c] ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="preview-note">
              Displaying first 8 preview rows in memory. Numeric fields detected: {numericColumns.join(", ") || "none"}.
            </p>
          </div>

          {/* AI Dataset Insights Section */}
          {aiReport && (
            <div className="panel ai-dataset-panel">
              <div className="ai-dataset-header">
                <div className="ai-dataset-title">
                  <Sparkles size={18} />
                  <strong>Trender AI Dataset Intelligence</strong>
                </div>
                <button className="small-action" onClick={analyzeWithAi} disabled={aiLoading}>
                  <RotateCcw size={13} /> Re-analyze
                </button>
              </div>
              <div className="ai-insights-box">
                <MarkdownRenderer content={aiReport} />
              </div>
            </div>
          )}
        </>
      )}

      <div className="section-title-row">
        <div>
          <h2>Market benchmark context</h2>
          <p>Current public reference point; file metrics are evaluated beside macro benchmarks.</p>
        </div>
      </div>

      <div className="comparison-callout">
        <div className="comparison-icon">
          <BarChart3 size={22} />
        </div>
        <div>
          <strong>S&P 500 benchmark index</strong>
          <p>
            {benchmark
              ? `Latest available quote: ${Number(benchmark.price).toLocaleString(undefined, { maximumFractionDigits: 2 })} points · ${benchmark.asOf ? new Date(benchmark.asOf).toLocaleString() : "timestamp unavailable"}.`
              : "The public benchmark is refreshing."}{" "}
            <a href="https://finance.yahoo.com/quote/%5EGSPC/" target="_blank" rel="noreferrer">
              Yahoo Finance source <ExternalLink size={12} />
            </a>
          </p>
        </div>
      </div>

      <div className="mini-stats">
        <div>
          <span>Uploaded records</span>
          <strong>{dataset ? dataset.rows.length.toLocaleString() : "—"}</strong>
          <small>{dataset ? "Local client file" : "Upload file to begin"}</small>
        </div>
        <div>
          <span>Numeric fields</span>
          <strong>{dataset ? numericColumns.length : "—"}</strong>
          <small>{dataset ? numericColumns.join(", ") || "None" : "Detected from file"}</small>
        </div>
        <div>
          <span>S&P 500 benchmark</span>
          <strong>{benchmark ? Number(benchmark.price).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}</strong>
          <small>{benchmark?.asOf ? new Date(benchmark.asOf).toLocaleDateString() : "Latest quote"}</small>
        </div>
      </div>

      <p className="data-disclaimer">
        Company data is processed client-side in browser memory. Sensitive customer records are never dispatched to remote storage.
      </p>
    </div>
  );
}
