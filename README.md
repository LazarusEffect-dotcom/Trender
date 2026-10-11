# Trender

Trender is a market intelligence workspace for exploring category and regional momentum, reviewing company data locally, and asking **Trender Intelligence** for a research starting point.

## Product features

- Responsive market overview with interactive charts and CSV/PNG export.
- Workspace search with `Ctrl+K` / `⌘K` quick navigation.
- Category, industry, and regional research views.
- Browser-only CSV and Excel preview. Selected files are not uploaded or saved.
- Trender Intelligence: a Gemini-powered assistant on Vercel, with a clearly labeled sample-data preview when developing locally.
- GitHub Actions build check and Vercel project configuration.

**Sample values are illustrative.** They are not verified live market data, and uploaded company files are not sent to the AI assistant.

## Run locally

Requirements: Node.js 20 or newer and npm.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open the local URL printed by Vite. The workspace works without any API credentials. The local assistant uses Preview AI and sample data; the Vercel function is only available in a Vercel deployment.

Create a production build with:

```powershell
npm run build
```

## GitHub, then Vercel

1. Create an empty repository on GitHub.
2. From this project folder, initialize and push the source:

   ```powershell
   git init -b main
   git add .
   git commit -m "Prepare Trender for deployment"
   git remote add origin https://github.com/YOUR-USER/YOUR-REPOSITORY.git
   git push -u origin main
   ```

3. GitHub Actions runs `.github/workflows/build.yml` on pushes to `main` and pull requests. The check installs from the lockfile and builds the production app.
4. In Vercel, choose **Add New → Project**, connect the GitHub account, and import the Trender repository. Keep the project root as `.`. `vercel.json` selects the Vite build and `dist` output.
5. In **Project Settings → Environment Variables**, add `GEMINI_API_KEY` for Preview and Production. Add `GEMINI_MODEL` only if you want to override the default model (`gemini-2.5-flash`).
6. Deploy. Vercel creates preview deployments for branches and pull requests and a production deployment from `main` after the Git integration is connected.

To update the live app, push a commit to GitHub. The GitHub build check runs, and Vercel builds and deploys the connected branch.

## Trender Intelligence setup

The Gemini credential is read only by `api/chat.js` on the server. Do not add it to a `VITE_*` variable, source file, or GitHub commit. Configure it in Vercel's encrypted environment-variable settings, then redeploy so the function can read it.

When the app is hosted, the AI status badge indicates whether the function connected successfully. If the key is missing, the assistant shows a setup error instead of presenting a demo answer as live AI. The Vercel function carries recent conversation turns and the dashboard's illustrative sample data to Gemini so it can answer questions about the workspace. Uploaded company files are never included.

## Data and security

- Dashboard metrics and briefings are illustrative examples.
- Company data uploads are parsed in the browser and are not persisted by this starter.
- Do not upload confidential data until you have added authentication, appropriate access controls, and a reviewed storage workflow.
- The AI endpoint has a small in-memory request limit per serverless instance. It is a useful guardrail, not a shared production rate limiter or user authentication system. Add an authenticated gateway and shared rate limiting before opening a billable AI endpoint to broad public traffic.
- `.env.local` and other `.env` files are excluded from Git.

## Project layout

```text
api/chat.js                  Server-side Gemini endpoint for Vercel
src/components/              Navigation, metric cards, and chart exports
src/pages/                   Workspace and assistant screens
src/data/demoData.js         Clearly labeled illustrative sample data
.github/workflows/build.yml  GitHub build check
vercel.json                  Vercel build and output settings
```
