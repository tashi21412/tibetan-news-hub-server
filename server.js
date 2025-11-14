import express from "express";
import cors from "cors";
import Parser from "rss-parser";
import cron from "node-cron";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// RSS Parser instance
const parser = new Parser();

// In-memory article store
let articles = [];

/* ---------------------------------------------------
   LANGUAGE DETECT (Tibetan vs English)
----------------------------------------------------- */
function detectLanguage(text) {
  if (!text) return "en";
  return /[\u0F00-\u0FFF]/.test(text) ? "bo" : "en";
}

/* ---------------------------------------------------
   IMAGE EXTRACTOR (pull thumbnail from RSS HTML)
----------------------------------------------------- */
function extractImage(html) {
  if (!html) return null;
  const match = html.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
}

/* ---------------------------------------------------
   📰 PHAYUL — RSS SCRAPER
----------------------------------------------------- */
async function scrapePhayul() {
  try {
    const feed = await parser.parseURL("https://www.phayul.com/feed/");
    const items = [];

    feed.items.forEach((item) => {
      items.push({
        id: `phayul-${Buffer.from(item.link).toString("base64")}`,
        title: item.title || "Untitled",
        excerpt: item.contentSnippet || "",
        image_url: extractImage(item.content),
        source: "Phayul",
        source_url: item.link,
        category: "tibet",
        region: "diaspora",
        published_at: item.pubDate || null,
        scraped_at: new Date().toISOString(),
        language: detectLanguage(item.title),
      });
    });

    console.log("Phayul RSS scraped:", items.length);
    return items;
  } catch (err) {
    console.error("Phayul RSS error:", err.message);
    return [];
  }
}

/* ---------------------------------------------------
   📰 RFA Tibetan — RSS SCRAPER
----------------------------------------------------- */
async function scrapeRFA() {
  try {
    const feed = await parser.parseURL("https://www.rfa.org/tibetan/rss");
    const items = [];

    feed.items.forEach((item) => {
      items.push({
        id: `rfa-${Buffer.from(item.link).toString("base64")}`,
        title: item.title,
        excerpt: item.contentSnippet || "",
        image_url: extractImage(item.content),
        source: "RFA Tibetan",
        source_url: item.link,
        category: "tibet",
        region: "global",
        published_at: item.pubDate || null,
        scraped_at: new Date().toISOString(),
        language: detectLanguage(item.title),
      });
    });

    console.log("RFA scraped:", items.length);
    return items;
  } catch (err) {
    console.error("RFA RSS error:", err.message);
    return [];
  }
}

/* ---------------------------------------------------
   📰 VOA Tibetan — RSS SCRAPER
----------------------------------------------------- */
async function scrapeVOA() {
  try {
    const feed = await parser.parseURL("https://www.voatibetan.com/rss?tab=all");
    const items = [];

    feed.items.forEach((item) => {
      items.push({
        id: `voa-${Buffer.from(item.link).toString("base64")}`,
        title: item.title,
        excerpt: item.contentSnippet || "",
        image_url: extractImage(item.content),
        source: "VOA Tibetan",
        source_url: item.link,
        category: "tibet",
        region: "global",
        published_at: item.pubDate || null,
        scraped_at: new Date().toISOString(),
        language: detectLanguage(item.title),
      });
    });

    console.log("VOA scraped:", items.length);
    return items;
  } catch (err) {
    console.error("VOA RSS error:", err.message);
    return [];
  }
}

/* ---------------------------------------------------
   📰 CTA (Tibet.net) — RSS SCRAPER
----------------------------------------------------- */
async function scrapeCTA() {
  try {
    const feed = await parser.parseURL("https://tibet.net/feed/");
    const items = [];

    feed.items.forEach((item) => {
      items.push({
        id: `cta-${Buffer.from(item.link).toString("base64")}`,
        title: item.title,
        excerpt: item.contentSnippet || "",
        image_url: extractImage(item.content),
        source: "CTA",
        source_url: item.link,
        category: "government",
        region: "tibet",
        published_at: item.pubDate || null,
        scraped_at: new Date().toISOString(),
        language: detectLanguage(item.title),
      });
    });

    console.log("CTA scraped:", items.length);
    return items;
  } catch (err) {
    console.error("CTA RSS error:", err.message);
    return [];
  }
}

/* ---------------------------------------------------
   📰 Tibet Sun — RSS SCRAPER
----------------------------------------------------- */
async function scrapeTibetSun() {
  try {
    const feed = await parser.parseURL("https://www.tibetsun.com/feed/");
    const items = [];

    feed.items.forEach((item) => {
      items.push({
        id: `tibetsun-${Buffer.from(item.link).toString("base64")}`,
        title: item.title,
        excerpt: item.contentSnippet || "",
        image_url: extractImage(item.content),
        source: "Tibet Sun",
        source_url: item.link,
        category: "tibet",
        region: "global",
        published_at: item.pubDate || null,
        scraped_at: new Date().toISOString(),
        language: detectLanguage(item.title),
      });
    });

    console.log("Tibet Sun scraped:", items.length);
    return items;
  } catch (err) {
    console.error("Tibet Sun RSS error:", err.message);
    return [];
  }
}

/* ---------------------------------------------------
   MASTER SCRAPER — Combine all sources
----------------------------------------------------- */
async function scrapeAllSources() {
  console.log("Scraping all sources...");

  const results = [];

  const phayul = await scrapePhayul();
  const rfa = await scrapeRFA();
  const voa = await scrapeVOA();
  const cta = await scrapeCTA();
  const tibetsun = await scrapeTibetSun();

  results.push(...phayul, ...rfa, ...voa, ...cta, ...tibetsun);

  // Deduplicate by URL
  const seen = new Set();
  articles = results.filter((a) => {
    if (seen.has(a.source_url)) return false;
    seen.add(a.source_url);
    return true;
  });

  console.log("Total scraped:", articles.length);
}

/* ---------------------------------------------------
   Run now + every 30 minutes
----------------------------------------------------- */
scrapeAllSources();
cron.schedule("*/30 * * * *", scrapeAllSources);

/* ---------------------------------------------------
   API ENDPOINT
----------------------------------------------------- */
app.get("/api/articles", (req, res) => {
  res.json({ articles });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
