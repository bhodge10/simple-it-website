// One-time migration: insert <script src="/attribution.js" defer> and
// <script src="/lead-capture.js" defer> into every top-level HTML file,
// anchored to the existing gtag.js tag. Idempotent — safe to re-run.
//
// Run with:   node scripts/inject-attribution-scripts.js
//
// After committing the changes, this file can stay around as documentation
// or be deleted; the injected tags are now part of each HTML file.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SKIP_DIRS = new Set(["node_modules", "_site", ".git", "scripts", "_includes", "blog", "admin", "Claude Artifacts", "downloads", "fonts", "images", "netlify", "emails"]);
const SKIP_FILES = new Set([
  // Internal/preview pages, redirects-to-/
  "review-entry-helper.html",
  "ticket-confirmation-email-preview.html",
  "simple-it-redesign.html",
]);

const ATTR_TAG = '<script src="/attribution.js" defer></script>';
const LEAD_TAG = '<script src="/lead-capture.js" defer></script>';
const GTAG_RE = /(<script\s+async\s+src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[A-Z0-9-]+"><\/script>)/;

function listHtmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isFile() && d.name.endsWith(".html") && !SKIP_FILES.has(d.name))
    .map(d => path.join(dir, d.name));
}

function injectInto(file) {
  let content = fs.readFileSync(file, "utf8");
  const hasAttribution = content.includes(ATTR_TAG);
  const hasLeadCapture = content.includes(LEAD_TAG);
  if (hasAttribution && hasLeadCapture) {
    return { file, action: "skip-already-injected" };
  }
  if (!GTAG_RE.test(content)) {
    return { file, action: "skip-no-gtag-anchor" };
  }
  const additions = [];
  if (!hasAttribution) additions.push("    " + ATTR_TAG);
  if (!hasLeadCapture) additions.push("    " + LEAD_TAG);
  const insertion = "$1\n" + additions.join("\n");
  const updated = content.replace(GTAG_RE, insertion);
  fs.writeFileSync(file, updated, "utf8");
  return { file, action: "injected" };
}

const files = listHtmlFiles(ROOT);
let counts = { injected: 0, "skip-already-injected": 0, "skip-no-gtag-anchor": 0 };
for (const file of files) {
  const { action } = injectInto(file);
  counts[action] = (counts[action] || 0) + 1;
  if (action === "skip-no-gtag-anchor") {
    console.log(`  ! ${path.basename(file)} has no gtag anchor; skipped`);
  }
}
console.log(`\nDone. Injected: ${counts.injected}, already had tags: ${counts["skip-already-injected"]}, no gtag anchor: ${counts["skip-no-gtag-anchor"]}`);
