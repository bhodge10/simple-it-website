// TEMPORARY diagnostic — hardcoded to expertsvc.com (never an open proxy).
// Reports what this function's egress IP sees when fetching the site, to
// diagnose why the SEO audit's live-HTML fetch fails. Delete after use.
const fetch = require('node-fetch');

exports.handler = async () => {
  const results = [];
  const urls = ['https://expertsvc.com', 'https://www.expertsvc.com', 'http://expertsvc.com'];
  for (const url of urls) {
    const started = Date.now();
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
        timeout: 8000,
      });
      const body = await res.text();
      results.push({
        url,
        status: res.status,
        ms: Date.now() - started,
        finalUrl: res.url,
        server: res.headers.get('server'),
        cfRay: res.headers.get('cf-ray'),
        cfMitigated: res.headers.get('cf-mitigated'),
        bodyBytes: body.length,
        bodyStart: body.slice(0, 300),
      });
    } catch (err) {
      results.push({ url, ms: Date.now() - started, error: err.message, errorName: err.name });
    }
  }
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(results, null, 2),
  };
};
