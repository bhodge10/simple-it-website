const markdownIt = require("markdown-it");
const fetchPortalPosts = require("./_data/portalPosts.js");

module.exports = function(eleventyConfig) {
  // --- Passthrough Copy: copy ALL existing site files as-is ---
  // HTML pages
  eleventyConfig.addPassthroughCopy("*.html");
  // CSS
  eleventyConfig.addPassthroughCopy("*.css");
  // JS (root level)
  eleventyConfig.addPassthroughCopy("*.js");
  // Images (root level)
  eleventyConfig.addPassthroughCopy("*.jpg");
  eleventyConfig.addPassthroughCopy("*.png");
  eleventyConfig.addPassthroughCopy("*.ico");
  eleventyConfig.addPassthroughCopy("*.svg");
  eleventyConfig.addPassthroughCopy("*.webp");
  // Directories
  eleventyConfig.addPassthroughCopy("fonts");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("downloads");
  eleventyConfig.addPassthroughCopy("netlify");
  eleventyConfig.addPassthroughCopy("emails");
  eleventyConfig.addPassthroughCopy("admin");
  // Config and data files
  eleventyConfig.addPassthroughCopy("_headers");
  eleventyConfig.addPassthroughCopy("netlify.toml");
  eleventyConfig.addPassthroughCopy("package.json");
  eleventyConfig.addPassthroughCopy("package-lock.json");
  eleventyConfig.addPassthroughCopy("reviews-data.json");
  eleventyConfig.addPassthroughCopy("robots.txt");
  // Backup files
  eleventyConfig.addPassthroughCopy("*.BACKUP");
  // Other assets
  eleventyConfig.addPassthroughCopy("*.zip");
  eleventyConfig.addPassthroughCopy("*.pdf");
  eleventyConfig.addPassthroughCopy("*.txt");

  // --- Markdown configuration ---
  const md = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  });
  eleventyConfig.setLibrary("md", md);

  // --- Filters ---

  // Format date as "February 11, 2026"
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    const date = new Date(dateObj);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  });

  // Format date as ISO string for schema markup
  eleventyConfig.addFilter("isoDate", (dateObj) => {
    return new Date(dateObj).toISOString();
  });

  // Format date as YYYY-MM-DD for datetime attributes
  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    const date = new Date(dateObj);
    return date.toISOString().split("T")[0];
  });

  // Estimated reading time
  eleventyConfig.addFilter("readingTime", (content) => {
    if (!content) return "1 min read";
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    return `${minutes} min read`;
  });

  // Generate excerpt from content (first 160 characters)
  eleventyConfig.addFilter("excerpt", (content) => {
    if (!content) return "";
    const stripped = content.replace(/<[^>]*>/g, "").replace(/\n+/g, " ").trim();
    return stripped.length > 160 ? stripped.substring(0, 157) + "..." : stripped;
  });

  // Slug filter for URLs
  eleventyConfig.addFilter("slug", (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  });

  // Limit filter for arrays (used in related posts)
  eleventyConfig.addFilter("limit", (arr, count) => {
    return (arr || []).slice(0, count);
  });

  // --- Merged blog index: local markdown posts + portal-authored posts ---
  // Portal posts are wrapped so they expose the same shape as Eleventy
  // collection items (`url`, `date`, `data.*`, `templateContent`) — that lets
  // blog.njk and feed.njk iterate the merged collection without branching.
  eleventyConfig.addCollection("allBlogPosts", async (collectionApi) => {
    const local = collectionApi.getFilteredByTag("blog").filter(p => !p.data.draft);
    const portal = await fetchPortalPosts();
    const portalItems = portal.map(p => ({
      url: p.url,
      date: p.publishedAtDate,
      data: {
        title: p.title,
        metaDescription: p.metaDescription,
        featuredImage: p.ogImageUrl,
        categories: p.tags,
        author: p.author.fullName,
        draft: false,
        isPortal: true,
        portal: p,
      },
      templateContent: p.bodyHtml,
    }));
    return [...local, ...portalItems].sort((a, b) => a.date - b.date);
  });

  // --- Blog by Category Collection ---
  eleventyConfig.addCollection("blogByCategory", (collectionApi) => {
    const posts = collectionApi.getFilteredByTag("blog");
    const categories = {};
    posts.forEach(post => {
      (post.data.categories || []).forEach(cat => {
        const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        if (!categories[slug]) categories[slug] = { name: cat, slug: slug, posts: [] };
        categories[slug].posts.push(post);
      });
    });
    // Sort posts within each category by date descending
    Object.values(categories).forEach(cat => {
      cat.posts.sort((a, b) => b.date - a.date);
    });
    return categories;
  });

  return {
    templateFormats: ["md", "njk"],
    htmlTemplateEngine: false,
    markdownTemplateEngine: "njk",
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site"
    }
  };
};
