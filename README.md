# Trender

Trender is a source-linked market intelligence workspace for comparing public market quotes, macroeconomic indicators, published consumer research, and company files processed in the browser.

## Product features

- **Live Public Market Overview**: International indices, sector proxies, FX rates, and digital asset quotes with provider timestamps.
- **Trender Intelligence (Multi-Provider AI)**:
  - Powered by **Google Gemini** (`gemini-2.0-flash` / `gemini-1.5-flash`), **OpenRouter Free models**, and **OpenAI**.
  - **Zero-Config Grounded Local Analyst Engine**: Deterministic quantitative analysis and research reports running offline or without an API key.
  - In-app **API Key Manager**: Configure custom keys in browser storage with instant connection validation.
  - **AI Market Pulse Briefing**: Real-time executive takeaways rendered directly on the Overview dashboard.
  - **AI Dataset Intelligence**: In-browser schema inspection, metric detection, and comparative benchmark insights on uploaded CSV/Excel files.
  - **AI Web Signal Synthesis**: Automated theme extraction from Hacker News, GitHub, and Stack Exchange trends.
- **Workspace Navigation**: Quick navigation with `Ctrl+K` / `⌘K` across all views.
- **Numerator Consumer Findings**: Published 2025 consumer-spending and generational channel-shift findings with primary source links.
- **World Bank Open Data**: Country GDP growth and CPI inflation indicators with explicit observation years.
- **Open Web Activity Signals**: Curated feeds from Hacker News, GitHub, Webmasters Stack Exchange, and Wikimedia, plus official hosting/CMS platform comparisons.
- **Watchlists, Alerts & Exports**: Persistent local watchlists, threshold evaluations, and single-click CSV exports.
- **Zero-Upload In-Browser File Analytics**: Spreadsheets are parsed locally in browser memory and are never uploaded to remote databases.

## Run locally

Requirements: Node.js 20 or newer and npm.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

`npm run dev` now includes built-in API dev server middleware. Live market data, open web signals, and Trender AI work immediately out of the box in local development!

To test and build for production:

```powershell
npm run build
```

## AI Configuration

Trender Intelligence supports three tiers of AI configuration:

1. **Zero-Configuration (Grounded Local Analyst)**:
   - Works immediately with no API keys.
   - Evaluates the live market snapshot and generates structured research reports with quantitative tables and citations.
2. **Google Gemini (Recommended)**:
   - Add `GEMINI_API_KEY` to `.env.local` or enter it directly in the in-app **Set API Key** modal in the AI Assistant.
   - Uses `gemini-2.0-flash` or `gemini-1.5-flash` with fast, multi-turn reasoning and grounded snapshot context.
3. **OpenRouter**:
   - Add `OPENROUTER_API_KEY` to `.env.local` or the AI Assistant key settings.
   - Routes automatically to free open-source models (`openrouter/free`, `google/gemma-2-9b-it:free`, `meta-llama/llama-3.3-70b-instruct:free`).
4. **OpenAI**:
   - Add `OPENAI_API_KEY` to `.env.local` or the AI Assistant key settings to use `gpt-4o-mini`.

## Data and security

- **Yahoo Finance public chart feed**: Market index and sector ETF quotes; quotes may be delayed.
- **Frankfurter**: Latest published daily reference exchange rates sourced from the European Central Bank.
- **Binance public spot market data**: BTC, ETH, and SOL 24-hour spot tickers quoted against USDT.
- **World Bank Open Data**: Latest available annual GDP growth and inflation by country.
- **Numerator Generations Hub**: Published 2025 consumer-spending findings.
- **Public Web Signals**: Activity feeds from Hacker News, GitHub, Webmasters Stack Exchange, and Wikimedia.
- **Company data files**: Processed entirely in browser client memory without server storage.

## Project layout

```text
api/market.js                Resilient public market-data aggregator with fallback snapshot
api/research.js              Cached open-web activity snapshot for Vercel and local dev
api/chat.js                  Unified multi-provider AI engine (Gemini, OpenRouter, OpenAI, Grounded Analyst)
api/openrouter.js            Aliased endpoint maintaining backwards compatibility
src/components/              Navigation, MetricCard, ChartCard, and MarkdownRenderer
src/pages/Assistant.jsx      Trender Intelligence interface with model switcher & key manager
src/pages/Overview.jsx       Executive dashboard with dynamic AI Market Pulse briefing
src/pages/CompanyData.jsx    Private in-browser spreadsheet analysis with AI file intelligence
src/pages/PublicWebSignals.jsx Open web research feed with AI theme synthesis
src/pages/GenericPage.jsx    Global Markets, Consumer Trends, Industries, Geography, Reports, Settings
vite.config.js               Vite configuration with dev API server middleware
vercel.json                  Vercel serverless functions and routing configuration
```
