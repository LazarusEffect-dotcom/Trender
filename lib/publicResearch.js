const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_KEY = "__trenderPublicResearchCache";

function getCache() {
  if (!globalThis[CACHE_KEY]) globalThis[CACHE_KEY] = new Map();
  return globalThis[CACHE_KEY];
}

async function requestJson(url, headers = {}) {
  const response = await fetch(url, {
    headers: { Accept: "application/json", ...headers },
    signal: AbortSignal.timeout(4500),
  });
  if (!response.ok) throw new Error(`Source returned ${response.status}`);
  return response.json();
}

async function searchHackerNews() {
  const params = new URLSearchParams({ tags: "front_page", hitsPerPage: "20" });
  const data = await requestJson(`https://hn.algolia.com/api/v1/search?${params}`);
  return (data.hits || []).map((hit) => ({
    source: "Hacker News front page",
    title: hit.title || hit.story_title || "Hacker News discussion",
    url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
    excerpt: `${hit.points || 0} points · ${hit.num_comments || 0} comments · ${hit.created_at || "date unavailable"}`,
    publishedAt: hit.created_at || null,
  }));
}

async function searchGitHub() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const params = new URLSearchParams({
    q: `created:>=${since} stars:>5`,
    sort: "updated",
    order: "desc",
    per_page: "4",
  });
  const data = await requestJson(`https://api.github.com/search/repositories?${params}`, {
    "User-Agent": "Trender-Market-Research",
    Accept: "application/vnd.github+json",
  });
  return (data.items || []).map((repo) => ({
    source: "GitHub new public repositories",
    title: repo.full_name,
    url: repo.html_url,
    excerpt: `${repo.stargazers_count || 0} stars · ${repo.forks_count || 0} forks · updated ${repo.updated_at || "date unavailable"}${repo.description ? ` · ${repo.description}` : ""}`,
    publishedAt: repo.updated_at || null,
  }));
}

async function searchWebmasters() {
  const params = new URLSearchParams({
    order: "desc",
    sort: "activity",
    site: "webmasters",
    pagesize: "20",
  });
  const data = await requestJson(`https://api.stackexchange.com/2.3/questions?${params}`);
  return (data.items || []).map((item) => ({
    source: "Webmasters Stack Exchange",
    title: item.title,
    url: item.link,
    excerpt: `${item.score || 0} votes · ${item.answer_count || 0} answers · ${item.is_answered ? "answered" : "unanswered"}`,
    publishedAt: item.creation_date ? new Date(item.creation_date * 1000).toISOString() : null,
  }));
}

async function getWikipediaTopPages() {
  const date = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const day = [date.getUTCFullYear(), String(date.getUTCMonth() + 1).padStart(2, "0"), String(date.getUTCDate()).padStart(2, "0")].join("/");
  const data = await requestJson(`https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia.org/all-access/${day}`);
  const pages = data?.items?.[0]?.articles || [];
  return pages.slice(0, 20).map((page) => ({
    source: "Wikimedia English Wikipedia pageviews",
    title: page.article.replaceAll("_", " "),
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.article)}`,
    excerpt: `${Number(page.views || 0).toLocaleString()} pageviews on ${day.replaceAll("/", "-")}`,
    publishedAt: day.replaceAll("/", "-"),
  }));
}

const HOSTING_COMPARISONS = [
  {
    source: "Official HubSpot product page",
    title: "HubSpot — Free web hosting",
    url: "https://www.hubspot.com/products/cms/web-hosting",
    excerpt: "HubSpot describes managed hosting included with its CMS and says the free hosting applies to websites built on HubSpot; verify current eligibility and limits on the official page.",
  },
  {
    source: "Official Wix product page",
    title: "Wix — Free web hosting",
    url: "https://www.wix.com/free/web-hosting",
    excerpt: "Wix offers free managed hosting for Wix sites on a Wix subdomain; custom domains require an upgrade. Verify current limits on the official page.",
  },
  {
    source: "Official WordPress.com product page",
    title: "WordPress.com — Plans and pricing",
    url: "https://wordpress.com/pricing/",
    excerpt: "WordPress.com includes managed hosting on its permanent free plan; the free plan uses a WordPress.com subdomain. Verify current feature limits on the official page.",
  },
  {
    source: "Official Webflow product page",
    title: "Webflow — Plans and pricing",
    url: "https://webflow.com/pricing",
    excerpt: "Webflow offers a free Starter site published to a Webflow subdomain; custom-domain publishing requires a paid site plan. Verify current page and bandwidth limits on the official page.",
  },
];

export async function gatherPublicResearch({ refresh = false } = {}) {
  const cacheKey = "global-public-snapshot";
  const cache = getCache();
  const cached = cache.get(cacheKey);
  if (!refresh && cached && cached.expiresAt > Date.now()) return cached.value;

  const jobs = await Promise.allSettled([
    searchHackerNews(),
    searchGitHub(),
    searchWebmasters(),
    getWikipediaTopPages(),
  ]);
  const sources = jobs.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
  sources.push(...HOSTING_COMPARISONS);

  const value = { query: "Global public trend snapshots; no user prompt is sent to these sources.", sources };
  cache.set(cacheKey, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  if (cache.size > 100) cache.delete(cache.keys().next().value);
  return value;
}
