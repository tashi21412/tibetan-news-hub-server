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
   IMAGE EXTRACTOR
----------------------------------------------------- */
function extractImage(html) {
  if (!html) return null;
  const match = html.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
}

/* ---------------------------------------------------
   📰 PHAYUL
----------------------------------------------------- */
async function scrapePhayul() {
  try {
    const feed = await parser.parseURL("https://www.phayul.com/feed/");
    const items = feed.items.map(item => ({
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
    }));
    console.log("Phayul RSS scraped:", items.length);
    return items;
  } catch (err) {
    console.error("Phayul RSS error:", err.message);
    return [];
  }
}

/* ---------------------------------------------------
   📰 RFA Tibetan
----------------------------------------------------- */
async function scrapeRFA() {
  try {
    const feed = await parser.parseURL("https://www.rfa.org/tibetan/rss");
    const items = feed.items.map(item => ({
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
    }));
    console.log("RFA scraped:", items.length);
    return items;
  } catch (err) {
    console.error("RFA RSS error:", err.message);
    return [];
  }
}

/* ---------------------------------------------------
   📰 VOA Tibetan
----------------------------------------------------- */
async function scrapeVOA() {
  try {
    const feed = await parser.parseURL("https://www.voatibetan.com/rss?tab=all");
    const items = feed.items.map(item => ({
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
    }));
    console.log("VOA scraped:", items.length);
    return items;
  } catch (err) {
    console.error("VOA RSS error:", err.message);
    return [];
  }
}

/* ---------------------------------------------------
   📰 CTA – Tibet.net
----------------------------------------------------- */
async function scrapeCTA() {
  try {
    const feed = await parser.parseURL("https://tibet.net/feed/");
    const items = feed.items.map(item => ({
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
    }));
    console.log("CTA scraped:", items.length);
    return items;
  } catch (err) {
    console.error("CTA RSS error:", err.message);
    return [];
  }
}

/* ---------------------------------------------------
   📰 Tibet Sun
----------------------------------------------------- */
async function scrapeTibetSun() {
  try {
    const feed = await parser.parseURL("https://www.tibetsun.com/feed/");
    const items = feed.items.map(item => ({
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
    }));
    console.log("Tibet Sun scraped:", items.length);
    return items;
  } catch (err) {
    console.error("Tibet Sun RSS error:", err.message);
    return [];
  }
}

/* ---------------------------------------------------
   🆕 ADDING 5 NEW SOURCES
----------------------------------------------------- */

/* Tibet Post International */
async function scrapeTPI() {
  try {
    const feed = await parser.parseURL(
      "https://www.thetibetpost.com/en?format=feed&type=rss"
    );
    const items = feed.items.map(item => ({
      id: `tpi-${Buffer.from(item.link).toString("base64")}`,
      title: item.title,
      excerpt: item.contentSnippet || "",
      image_url: extractImage(item.content),
      source: "Tibet Post International",
      source_url: item.link,
      category: "tibet",
      region: "global",
      published_at: item.pubDate || null,
      scraped_at: new Date().toISOString(),
      language: detectLanguage(item.title),
    }));
    console.log("TPI scraped:", items.length);
    return items;
  } catch (err) {
    console.error("TPI RSS error:", err.message);
    return [];
  }
}

/* Tibetan Review */
async function scrapeTibetanReview() {
  try {
    const feed = await parser.parseURL("https://www.tibetanreview.net/feed/");
    const items = feed.items.map(item => ({
      id: `tibrev-${Buffer.from(item.link).toString("base64")}`,
      title: item.title,
      excerpt: item.contentSnippet || "",
      image_url: extractImage(item.content),
      source: "Tibetan Review",
      source_url: item.link,
      category: "analysis",
      region: "global",
      published_at: item.pubDate || null,
      scraped_at: new Date().toISOString(),
      language: detectLanguage(item.title),
    }));
    console.log("Tibetan Review scraped:", items.length);
    return items;
  } catch (err) {
    console.error("Tibetan Review RSS error:", err.message);
    return [];
  }
}

/* Dalai Lama Office */
async function scrapeDalaiLama() {
  try {
    const feed = await parser.parseURL("https://www.dalailama.com/news/rss");
    const items = feed.items.map(item => ({
      id: `dl-${Buffer.from(item.link).toString("base64")}`,
      title: item.title,
      excerpt: item.contentSnippet || "",
      image_url: extractImage(item.content),
      source: "Dalai Lama Office",
      source_url: item.link,
      category: "spiritual",
      region: "tibet",
      published_at: item.pubDate || null,
      scraped_at: new Date().toISOString(),
      language: detectLanguage(item.title),
    }));
    console.log("Dalai Lama scraped:", items.length);
    return items;
  } catch (err) {
    console.error("Dalai Lama RSS error:", err.message);
    return [];
  }
}

/* High Peaks Pure Earth */
async function scrapeHighPeaks() {
  try {
    const feed = await parser.parseURL("https://highpeakspureearth.com/feed/");
    const items = feed.items.map(item => ({
      id: `hppe-${Buffer.from(item.link).toString("base64")}`,
      title: item.title,
      excerpt: item.contentSnippet || "",
      image_url: extractImage(item["content:encoded"]),
      source: "High Peaks Pure Earth",
      source_url: item.link,
      category: "analysis",
      region: "global",
      published_at: item.pubDate || null,
      scraped_at: new Date().toISOString(),
      language: detectLanguage(item.title),
    }));
    console.log("High Peaks scraped:", items.length);
    return items;
  } catch (err) {
    console.error("High Peaks RSS error:", err.message);
    return [];
  }
}

/* Tibet Express */
async function scrapeTibetExpress() {
  try {
    const feed = await parser.parseURL("https://tibetexpress.net/feed/");
    const items = feed.items.map(item => ({
      id: `texpress-${Buffer.from(item.link).toString("base64")}`,
      title: item.title,
      excerpt: item.contentSnippet || "",
      image_url: extractImage(item.content),
      source: "Tibet Express",
      source_url: item.link,
      category: "tibet",
      region: "diaspora",
      published_at: item.pubDate || null,
      scraped_at: new Date().toISOString(),
      language: detectLanguage(item.title),
    }));
    console.log("Tibet Express scraped:", items.length);
    return items;
  } catch (err) {
    console.error("Tibet Express RSS error:", err.message);
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

  const tpi = await scrapeTPI();
  const tibrev = await scrapeTibetanReview();
  const dalai = await scrapeDalaiLama();
  const highpeaks = await scrapeHighPeaks();
  const tibetexpress = await scrapeTibetExpress();

  results.push(
    ...phayul,
    ...rfa,
    ...voa,
    ...cta,
    ...tibetsun,
    ...tpi,
    ...tibrev,
    ...dalai,
    ...highpeaks,
    ...tibetexpress
  );

  // Deduplicate by URL
  const seen = new Set();
  articles = results.filter(a => {
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
