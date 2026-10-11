# Trender public research sources

The Public Web Signals page shows a cached snapshot of open-web activity and links to official website platform pages. None of these feeds receives the user's questions or uploaded files.

## Public data feeds

- [Hacker News front page](https://hn.algolia.com/api): recent technology discussions, scores, and comment counts.
- [GitHub REST API](https://docs.github.com/en/rest/search/search#search-repositories): recently created public repositories and their current stars and update dates. Unauthenticated requests are rate-limited, so Trender caches the feed for ten minutes.
- [Webmasters Stack Exchange API](https://api.stackexchange.com/docs/questions): recently active questions about websites, hosting, and web operations.
- [Wikimedia pageviews API](https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/reference/page-views.html): the previous day's most-viewed English Wikipedia articles.

These are directional signals from different communities and audiences. HN activity, repository stars, answer votes, and Wikipedia pageviews do not measure total market size, revenue, or customer demand.

## Hosting and CMS comparison pages

These official pages are included as starting points for a HubSpot-style hosting comparison. Plan features can change, so check each provider's current page before making a decision.

- [HubSpot free web hosting](https://www.hubspot.com/products/cms/web-hosting)
- [Wix free web hosting](https://www.wix.com/free/web-hosting)
- [WordPress.com plans and pricing](https://wordpress.com/pricing/)
- [Webflow plans and pricing](https://webflow.com/pricing)

## OpenRouter setup

Set `OPENROUTER_API_KEY` as a server-side environment variable in Vercel and redeploy. The configured model order uses `openrouter/free`, then free Gemma and Nemotron endpoints. No OpenRouter key belongs in a `VITE_` variable or browser code.
