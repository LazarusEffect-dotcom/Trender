# Trender

Trender is a source-linked market intelligence workspace for comparing public market quotes, macroeconomic indicators, published consumer research, and company files processed in the browser.

## Product features

- Live public market overview with international indices, sector proxies, FX rates, and digital asset quotes.
- Workspace search with `Ctrl+K` / `⌘K` quick navigation.
- Numerator consumer-spending findings with the report period and original source link.
- Country GDP and inflation indicators from World Bank Open Data.
- Public web activity from Hacker News, GitHub, Webmasters Stack Exchange, and Wikimedia, plus official hosting/CMS pages.
- Watchlists, price-threshold alerts, data exports, and saved display preferences.
- Browser-only CSV and Excel analysis. Selected files are not uploaded or saved.
- Trender Intelligence powered by free OpenRouter models on Vercel and grounded in the current public-data snapshot.
- GitHub Actions build check and Vercel project configuration.

Market quotes may be delayed. Currency rates use the latest published ECB reference day, macro indicators use the latest available annual observations, and the consumer figures are Numerator findings reported for 2025. The app labels the source and period beside each dataset.

## Run locally

Requirements: Node.js 20 or newer and npm.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

For the full live-data and AI experience locally, use `vercel dev` after adding `OPENROUTER_API_KEY` to `.env.local`. Plain `npm run dev` serves the Vite interface but does not run Vercel serverless functions.

Create a production build with:

```powershell
npm run build
```

## GitHub, then Vercel

The source repository is [LazarusEffect-dotcom/Trender](https://github.com/LazarusEffect-dotcom/Trender). Push updates to its connected production branch to run the GitHub build check and trigger Vercel deployment:

GitHub Actions runs `.github/workflows/build.yml` on pushes to `main` and pull requests. In the connected Vercel project, keep the project root as `.`; `vercel.json` selects the Vite build and `dist` output. Set `OPENROUTER_API_KEY` for Preview and Production in Vercel's encrypted environment-variable settings. `OPENROUTER_MODELS` is optional; the default list contains only free routes. If you set it, use `openrouter/free` or model IDs ending in `:free`, separated by commas and ordered by preference. Add `OPENROUTER_SITE_URL` if you use a custom domain.

To update the live app, push a commit to GitHub. The GitHub build check runs, and Vercel builds and deploys the connected branch.

## OpenRouter model setup

The OpenRouter API key is read only by `api/openrouter.js` on the server. Do not add it to a `VITE_*` variable, source file, or GitHub commit. Configure it in Vercel's encrypted environment-variable settings, then redeploy so the function can read it.

The default fallback order is `openrouter/free`, `nvidia/nemotron-3-ultra-550b-a55b:free`, then `google/gemma-4-26b-a4b-it:free`. The assistant shows which model answered. OpenRouter free models have provider capacity limits.

The assistant sends recent conversation turns and the public snapshot shown in the workspace to OpenRouter. Uploaded company files are never included. If the key is missing or a provider is unavailable, the assistant displays a clear connection error and never substitutes a canned answer.

## Data and security

- Yahoo Finance public chart feed: market index and sector ETF quotes; quotes may be delayed.
- Frankfurter: latest published daily reference exchange rates sourced from the European Central Bank.
- Binance public spot market data: BTC, ETH, and SOL 24-hour tickers quoted against USDT. These are Binance exchange prices, not a consolidated global market price.
- World Bank Open Data: latest available annual GDP growth and inflation by country.
- Numerator Generations Hub: published 2025 consumer-spending and channel-shift findings. Numerator's underlying purchase panel is proprietary; the app only shows findings published on the public page.
- Public Web Signals: activity feeds from Hacker News, GitHub, Webmasters Stack Exchange, and Wikimedia, plus links to official HubSpot, Wix, WordPress.com, and Webflow pages. Community activity is directional and does not measure sales or market size.
- Company data files are parsed in browser memory and are not uploaded or retained after leaving the page.
- Do not upload confidential data until you have added authentication, appropriate access controls, and a reviewed storage workflow.
- The AI endpoint has a small in-memory request limit per serverless instance. It is a useful guardrail, not a shared production rate limiter or user authentication system. Add an authenticated gateway and shared rate limiting before opening a billable AI endpoint to broad public traffic.
- `.env.local` and other `.env` files are excluded from Git.

## Project layout

```text
api/market.js                Public market-data aggregator for Vercel
api/research.js              Cached open-web activity snapshot for Vercel
api/openrouter.js            Free-only OpenRouter endpoint for Vercel
src/pages/PublicWebSignals.jsx Interactive public-web and hosting source browser
src/data/consumerInsights.js Published Numerator findings with reporting periods
src/lib/publicMarket.js      Browser client for the public-data endpoint
src/components/              Navigation, metric cards, and chart exports
src/pages/                   Workspace and assistant screens
.github/workflows/build.yml  GitHub build check
vercel.json                  Vercel build and output settings
```
