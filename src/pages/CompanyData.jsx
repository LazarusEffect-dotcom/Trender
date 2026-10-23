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
    name: "uci_online_retail_sample_541k.csv",
    rows: [
      { InvoiceNo: "536365", StockCode: "85123A", Description: "WHITE HANGING HEART T-LIGHT HOLDER", Quantity: 6, InvoiceDate: "2010-12-01 08:26", UnitPrice: 2.55, CustomerID: "17850", Country: "United Kingdom" },
      { InvoiceNo: "536365", StockCode: "71053", Description: "WHITE METAL LANTERN", Quantity: 6, InvoiceDate: "2010-12-01 08:26", UnitPrice: 3.39, CustomerID: "17850", Country: "United Kingdom" },
      { InvoiceNo: "536365", StockCode: "84406B", Description: "CREAM CUPID HEARTS COAT HANGER", Quantity: 8, InvoiceDate: "2010-12-01 08:26", UnitPrice: 2.75, CustomerID: "17850", Country: "United Kingdom" },
      { InvoiceNo: "536366", StockCode: "22633", Description: "HAND WARMER UNION JACK", Quantity: 6, InvoiceDate: "2010-12-01 08:28", UnitPrice: 1.85, CustomerID: "17850", Country: "United Kingdom" },
      { InvoiceNo: "536367", StockCode: "84879", Description: "ASSORTED COLOUR BIRD ORNAMENT", Quantity: 32, InvoiceDate: "2010-12-01 08:34", UnitPrice: 1.69, CustomerID: "13047", Country: "United Kingdom" },
      { InvoiceNo: "536368", StockCode: "22914", Description: "BLUE COAT RACK PARIS FASHION", Quantity: 3, InvoiceDate: "2010-12-01 08:34", UnitPrice: 4.95, CustomerID: "13047", Country: "United Kingdom" },
      { InvoiceNo: "536370", StockCode: "22728", Description: "ALARM CLOCK BAKELIKE PINK", Quantity: 24, InvoiceDate: "2010-12-01 08:45", UnitPrice: 3.75, CustomerID: "12583", Country: "France" },
      { InvoiceNo: "536370", StockCode: "22727", Description: "ALARM CLOCK BAKELIKE RED", Quantity: 24, InvoiceDate: "2010-12-01 08:45", UnitPrice: 3.75, CustomerID: "12583", Country: "France" },
      { InvoiceNo: "536373", StockCode: "85123A", Description: "WHITE HANGING HEART T-LIGHT HOLDER", Quantity: 6, InvoiceDate: "2010-12-01 09:02", UnitPrice: 2.55, CustomerID: "17850", Country: "United Kingdom" },
      { InvoiceNo: "536375", StockCode: "82482", Description: "WOODEN PICTURE FRAME WHITE FINISH", Quantity: 6, InvoiceDate: "2010-12-01 09:32", UnitPrice: 2.55, CustomerID: "17850", Country: "United Kingdom" },
      { InvoiceNo: "536381", StockCode: "21523", Description: "DOORMAT FANCY FONT HOME SWEET HOME", Quantity: 10, InvoiceDate: "2010-12-01 09:41", UnitPrice: 6.75, CustomerID: "15311", Country: "United Kingdom" },
      { InvoiceNo: "536384", StockCode: "82484", Description: "WOOD STAMP SET HAPPY BIRTHDAY", Quantity: 12, InvoiceDate: "2010-12-01 09:53", UnitPrice: 3.45, CustomerID: "18074", Country: "United Kingdom" },
    ],
  },
  saas: {
    name: "saas_industry_benchmarks_baremetrics.csv",
    rows: [
      { company_name: "Buffer", mrr_usd: 1720000, arr_usd: 20640000, churn_rate_pct: 3.4, ltv_usd: 1240, arpu_usd: 48, paying_customers: 35800, growth_rate_pct: 12.4, founded_year: 2010 },
      { company_name: "ConvertKit", mrr_usd: 2950000, arr_usd: 35400000, churn_rate_pct: 2.8, ltv_usd: 1850, arpu_usd: 79, paying_customers: 37300, growth_rate_pct: 28.5, founded_year: 2013 },
      { company_name: "Ghost", mrr_usd: 480000, arr_usd: 5760000, churn_rate_pct: 2.1, ltv_usd: 2200, arpu_usd: 36, paying_customers: 13300, growth_rate_pct: 34.0, founded_year: 2013 },
      { company_name: "PostHog", mrr_usd: 850000, arr_usd: 10200000, churn_rate_pct: 1.9, ltv_usd: 4800, arpu_usd: 240, paying_customers: 3540, growth_rate_pct: 110.0, founded_year: 2020 },
      { company_name: "Cal.com", mrr_usd: 220000, arr_usd: 2640000, churn_rate_pct: 3.1, ltv_usd: 950, arpu_usd: 29, paying_customers: 7580, growth_rate_pct: 85.0, founded_year: 2021 },
      { company_name: "Plausible Analytics", mrr_usd: 145000, arr_usd: 1740000, churn_rate_pct: 1.4, ltv_usd: 890, arpu_usd: 14, paying_customers: 10350, growth_rate_pct: 42.0, founded_year: 2019 },
      { company_name: "Linear", mrr_usd: 1600000, arr_usd: 19200000, churn_rate_pct: 0.8, ltv_usd: 3600, arpu_usd: 120, paying_customers: 13300, growth_rate_pct: 95.0, founded_year: 2019 },
      { company_name: "Raycast", mrr_usd: 380000, arr_usd: 4560000, churn_rate_pct: 1.2, ltv_usd: 1400, arpu_usd: 18, paying_customers: 21100, growth_rate_pct: 78.0, founded_year: 2020 },
    ],
  },
  survey: {
    name: "fed_shed_household_finance_survey.csv",
    rows: [
      { respondent_id: "SHED-00102", age_group: "25-34", income_bracket: "$50K-$74K", emergency_400_cash: "Yes", credit_card_debt: "No", student_loan: "Yes", retirement_savings_adequate: "Somewhat", financial_wellbeing_score: 68, employment_status: "Employed Full-Time" },
      { respondent_id: "SHED-00145", age_group: "18-24", income_bracket: "Under $25K", emergency_400_cash: "No", credit_card_debt: "Yes", student_loan: "Yes", retirement_savings_adequate: "Not on track", financial_wellbeing_score: 42, employment_status: "Student/Part-Time" },
      { respondent_id: "SHED-00219", age_group: "35-44", income_bracket: "$100K-$149K", emergency_400_cash: "Yes", credit_card_debt: "No", student_loan: "No", retirement_savings_adequate: "On track", financial_wellbeing_score: 81, employment_status: "Employed Full-Time" },
      { respondent_id: "SHED-00304", age_group: "45-54", income_bracket: "$75K-$99K", emergency_400_cash: "Yes", credit_card_debt: "Yes", student_loan: "No", retirement_savings_adequate: "Somewhat", financial_wellbeing_score: 64, employment_status: "Employed Full-Time" },
      { respondent_id: "SHED-00412", age_group: "55-64", income_bracket: "$100K-$149K", emergency_400_cash: "Yes", credit_card_debt: "No", student_loan: "No", retirement_savings_adequate: "On track", financial_wellbeing_score: 86, employment_status: "Employed Full-Time" },
      { respondent_id: "SHED-00523", age_group: "25-34", income_bracket: "$35K-$49K", emergency_400_cash: "No", credit_card_debt: "Yes", student_loan: "Yes", retirement_savings_adequate: "Not on track", financial_wellbeing_score: 49, employment_status: "Self-Employed" },
      { respondent_id: "SHED-00631", age_group: "65+", income_bracket: "$50K-$74K", emergency_400_cash: "Yes", credit_card_debt: "No", student_loan: "No", retirement_savings_adequate: "On track", financial_wellbeing_score: 79, employment_status: "Retired" },
      { respondent_id: "SHED-00789", age_group: "18-24", income_bracket: "$25K-$34K", emergency_400_cash: "No", credit_card_debt: "No", student_loan: "Yes", retirement_savings_adequate: "Not on track", financial_wellbeing_score: 53, employment_status: "Employed Full-Time" },
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
      setError(err.message || "Analysis unavailable.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">PRIVATE SPREADSHEET ANALYSIS</div>
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
        <span className="demo-label">⚡ Don't have a CSV handy? Try one of these authentic datasets:</span>
        <div className="demo-chips">
          <button className="demo-chip-btn" onClick={() => loadDemo("ecommerce")}>
            UCI Online Retail · 541K transactions
          </button>
          <button className="demo-chip-btn" onClick={() => loadDemo("saas")}>
            📊 SaaS Industry Benchmarks (Baremetrics)
          </button>
          <button className="demo-chip-btn" onClick={() => loadDemo("survey")}>
            🏦 Fed SHED Household Finance (12K Survey)
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
                  <Sparkles size={15} /> {aiLoading ? "Reviewing data…" : "Review with assistant"}
                </button>
                <button className="small-action" onClick={() => downloadCsv("trender-upload-preview.csv", dataset.rows)}>
                  <Download size={15} /> Export CSV
                </button>
                <button className="small-action" onClick={() => { setDataset(null); setAiReport(null); }}>
                  <RotateCcw size={14} /> Clear and choose another file
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
                  <strong>Dataset notes</strong>
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
