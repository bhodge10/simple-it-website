// REQUIRED: Set ANTHROPIC_API_KEY in Netlify dashboard → Site settings → Environment variables
const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let domain;
  try {
    const body = JSON.parse(event.body);
    domain = body.domain;
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  if (!domain || domain.trim().length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Domain is required' }) };
  }

  domain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');

  // ─── Step 1: Fetch the LIVE homepage HTML ───
  let liveHtml = '';
  let fetchError = '';
  const urls = [`https://${domain}`, `http://${domain}`];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SitePilot SEO Auditor; +https://simple-it.us/sitepilot)',
          'Accept': 'text/html',
        },
        redirect: 'follow',
        timeout: 5000,
      });

      if (res.ok) {
        const fullHtml = await res.text();

        // Extract <head> section
        const headMatch = fullHtml.match(/<head[\s\S]*?<\/head>/i);
        const head = headMatch ? headMatch[0] : '';

        // Extract ALL JSON-LD schema blocks from the FULL HTML (before truncation)
        const schemaBlocks = [];
        const schemaRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
        let schemaMatch;
        while ((schemaMatch = schemaRegex.exec(fullHtml)) !== null) {
          schemaBlocks.push(schemaMatch[0]);
        }

        // Get body preview (truncated for content analysis)
        const bodyMatch = fullHtml.match(/<body[\s\S]*?<\/body>/i);
        const bodyPreview = bodyMatch ? bodyMatch[0].slice(0, 10000) : '';

        // Build the HTML context with schema blocks preserved separately
        liveHtml = head + '\n<!-- BODY PREVIEW (first 10000 chars) -->\n' + bodyPreview;

        if (schemaBlocks.length > 0) {
          liveHtml += '\n\n<!-- ALL SCHEMA MARKUP BLOCKS (extracted from full HTML, not truncated) -->\n';
          liveHtml += schemaBlocks.join('\n');
        }

        break;
      }
    } catch (err) {
      fetchError = err.message;
    }
  }

  // ─── Step 2: Build the prompt with live HTML context ───
  let htmlContext = '';
  if (liveHtml) {
    htmlContext = `

Here is the LIVE HTML fetched directly from ${domain} right now (not cached):

<homepage_html>
${liveHtml}
</homepage_html>

IMPORTANT: Base your technical analysis (meta tags, titles, schema markup, heading structure, internal links, content quality) on this LIVE HTML. The live HTML is the ground truth for what is currently on the site.`;
  } else {
    htmlContext = `

NOTE: Could not fetch live HTML from ${domain} (${fetchError || 'connection failed'}). Base your analysis on your knowledge of this domain and what a typical site like this would have.`;
  }

  // ─── Step 3: Call Claude API with live HTML context ───
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: `You are an expert SEO auditor. Analyze the website at ${domain}.${htmlContext}

Score each category based on what you ACTUALLY find in the live HTML.

Here is exactly what to check in each category:

META TAGS & TITLES: Check the live HTML <head> for: unique <title> tag with keywords and location, <meta name="description"> present and descriptive, Open Graph tags, Twitter card tags, canonical URL. Penalize if title is just the business name with no keywords.

CONTENT QUALITY: Check the live HTML <body> for: sufficient word count (300+ words on homepage), clear value proposition in the hero/header area, specific metrics or differentiators (not generic marketing speak), testimonials or social proof, clear calls to action.

SCHEMA MARKUP: All JSON-LD schema blocks have been extracted from the FULL page HTML and included below — look for the section labeled "ALL SCHEMA MARKUP BLOCKS". Check for: LocalBusiness schema, FAQPage schema, Service schema, OfferCatalog, AggregateRating, proper nesting and required fields. If multiple schema blocks are present, that is a strong positive signal — score accordingly.

MOBILE FRIENDLINESS: Check for: viewport meta tag, click-to-call links for phone numbers, responsive indicators in CSS, mobile-friendly navigation patterns.

PAGE SPEED: Check for: number and size of external scripts, inline vs external CSS, image optimization hints, lazy loading attributes, render-blocking resources.

LOCAL SEO: Check for: location-specific content, city/region mentions, local landing pages linked from nav, NAP (name, address, phone) consistency, Google Business Profile links.

SCORING WEIGHTS FOR OVERALL SCORE:
Do NOT average all six categories equally. Use these weights to calculate the overall score:
- Content Quality: 25% (most important — Google rewards helpful, specific content)
- Local SEO: 20% (critical for service-area businesses)
- Schema Markup: 20% (directly impacts rich results and AI search citations)
- Meta Tags & Titles: 15% (important but baseline technical hygiene)
- Mobile Friendliness: 12% (table stakes — most sites pass this)
- Page Speed: 8% (Google confirms this is a minor signal, only affects the slowest sites)

Calculate overall_score as: (content * 0.25) + (local * 0.20) + (schema * 0.20) + (meta * 0.15) + (mobile * 0.12) + (performance * 0.08)

Round to the nearest whole number. Then assign overall_grade based on:
95-100 = A+, 90-94 = A, 85-89 = A-, 80-84 = B+, 75-79 = B, 70-74 = B-, 65-69 = C+, 60-64 = C, 55-59 = C-, 50-54 = D+, 45-49 = D, below 45 = F

Respond with ONLY a JSON object — no markdown, no backticks, no explanation:

{"overall_score":<0-100>,"overall_grade":"<letter grade>","summary":"<one sentence specific to this site>","categories":{"meta":{"score":<0-100>,"visible_issue":"<one specific issue you actually found or 'No major issues detected'>"},"content":{"score":<0-100>,"visible_issue":"<one specific issue>"},"schema":{"score":<0-100>,"visible_issue":"<one specific issue>"},"mobile":{"score":<0-100>,"visible_issue":"<one specific issue>"},"performance":{"score":<0-100>,"visible_issue":"<one specific issue>"},"local":{"score":<0-100>,"visible_issue":"<one specific issue>"}},"critical_count":<number>,"warning_count":<number>,"passed_count":<number>,"blurred_findings":["<teaser 1>","<teaser 2>","<teaser 3>"]}

Rules:
- Base technical scores on the LIVE HTML, not guesses
- If a category looks good in the live HTML, score it high
- Be specific — reference actual tag content, actual schema types found, actual heading text
- Keep visible_issue to one sentence
- Blurred findings should be concerning but not actionable without help
- If schema markup IS present in the live HTML, acknowledge it and score accordingly
- Most small business sites score 40-70. A well-optimized site with schema, good content, and local pages should score 75-90.
- If you could not access the live HTML, note that in the summary and score conservatively (45-55)`
          }
        ],
      }),
    });

    const data = await response.json();

    // Check for API errors
    if (data.error) {
      console.error('Anthropic API error:', JSON.stringify(data.error));
      const errMsg = data.error.message || data.error.type || 'Unknown API error';
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API: ' + errMsg }),
      };
    }

    // Extract text from response
    const allText = (data.content || [])
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('\n');

    if (!allText) {
      console.error('No text in response:', JSON.stringify(data.content?.map(c => c.type)));
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Audit returned no results' }),
      };
    }

    // Parse JSON from response
    const cleaned = allText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Try regex extraction
      const match = cleaned.match(/\{[\s\S]*"overall_score"[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          console.error('JSON parse failed:', cleaned.slice(0, 500));
          return { statusCode: 500, body: JSON.stringify({ error: 'Could not parse audit results' }) };
        }
      } else {
        console.error('No JSON found:', cleaned.slice(0, 500));
        return { statusCode: 500, body: JSON.stringify({ error: 'Audit returned unexpected format' }) };
      }
    }

    // Validate required fields exist
    if (!parsed.overall_score || !parsed.overall_grade || !parsed.categories) {
      console.error('Missing fields:', Object.keys(parsed));
      return { statusCode: 500, body: JSON.stringify({ error: 'Audit results incomplete' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed),
    };

  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Audit service error. Please try again.' }),
    };
  }
};
