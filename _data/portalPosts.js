// Build-time fetch of blog posts authored in the portal CMS
// (https://portal.simple-it.us). Returns an array of normalized post objects
// consumed by:
//   - .eleventy.js   (merged into the `allBlogPosts` collection)
//   - blog-portal-detail.njk   (paginated into /blog/{slug}/ pages)
//   - feed.njk and sitemap.njk
//
// Slugs that already exist as a local markdown file under /blog/ are dropped
// so the build never emits a duplicate permalink. Local posts win on conflict
// because they have the SEO history; portal authors can rename their slug.

const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const markdownIt = require("markdown-it");

const PORTAL_BASE = process.env.PORTAL_API_BASE || "https://portal.simple-it.us";
const FETCH_LIMIT = 200;
const FETCH_TIMEOUT_MS = 15000;

const md = markdownIt({ html: true, breaks: true, linkify: true });

function getLocalBlogSlugs() {
  try {
    const blogDir = path.join(__dirname, "..", "blog");
    return new Set(
      fs.readdirSync(blogDir)
        .filter(f => f.endsWith(".md"))
        .map(f => f.replace(/\.md$/, ""))
    );
  } catch {
    return new Set();
  }
}

function normalize(post) {
  const author = post.author || {};
  const firstName = author.firstName || "";
  const lastName = author.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || "Simple IT Team";
  const published = post.publishedAt ? new Date(post.publishedAt) : new Date();
  const updated = post.updatedAt ? new Date(post.updatedAt) : published;
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || "",
    bodyHtml: md.render(post.body || ""),
    metaTitle: post.metaTitle || null,
    metaDescription: post.metaDescription || post.excerpt || "",
    ogImageUrl: post.ogImageUrl || null,
    canonicalUrl: post.canonicalUrl || null,
    tags: Array.isArray(post.tags) ? post.tags : [],
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    publishedAtDate: published,
    updatedAtDate: updated,
    author: { firstName, lastName, fullName },
    url: `/blog/${post.slug}/`,
  };
}

module.exports = async function fetchPortalPosts() {
  const url = `${PORTAL_BASE}/api/public/blog?limit=${FETCH_LIMIT}`;
  try {
    const res = await fetch(url, { timeout: FETCH_TIMEOUT_MS });
    if (!res.ok) {
      console.warn(`[portalPosts] ${url} returned HTTP ${res.status}; building with 0 portal posts.`);
      return [];
    }
    const json = await res.json();
    const posts = Array.isArray(json.posts) ? json.posts : [];
    const localSlugs = getLocalBlogSlugs();
    const filtered = posts.filter(p => p && p.slug && !localSlugs.has(p.slug));
    const skipped = posts.length - filtered.length;
    if (skipped > 0) {
      console.log(`[portalPosts] Skipped ${skipped} portal post(s) whose slug collides with a local markdown file.`);
    }
    console.log(`[portalPosts] Fetched ${filtered.length} portal post(s) from ${PORTAL_BASE}.`);
    return filtered.map(normalize);
  } catch (err) {
    console.warn(`[portalPosts] Fetch failed (${err.message}); building with 0 portal posts.`);
    return [];
  }
};
