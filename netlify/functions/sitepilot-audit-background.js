// Background function: fetches live HTML, calls Claude, stores results in Blobs
// Netlify runs this in the background (up to 15 min) and returns 202 immediately
const fetch = require('node-fetch');
const { getStore } = require('@netlify/blobs');
const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid request' };
  }

  const { domain, auditId } = body;
  if (!domain || !auditId) {
    return { statusCode: 400, body: 'Missing domain or auditId' };
  }

  const store = getStore('sitepilot-audits');

  // Mark as processing
  await store.setJSON(auditId, { status: 'processing', domain, startedAt: Date.now() });

  try {
    // ─── Step 1: Fetch live homepage HTML ───
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
          timeout: 8000,
        });

        if (res.ok) {
          const fullHtml = await res.text();
          const headMatch = fullHtml.match(/<head[\s\S]*?<\/head>/i);
          const head = headMatch ? headMatch[0] : '';

          const schemaBlocks = [];
          const schemaRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
          let schemaMatch;
          while ((schemaMatch = schemaRegex.exec(fullHtml)) !== null) {
            schemaBlocks.push(schemaMatch[0]);
          }

          const bodyMatch = fullHtml.match(/<body[\s\S]*?<\/body>/i);
          const bodyPreview = bodyMatch ? bodyMatch[0].slice(0, 10000) : '';

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

    // ─── Step 2: Build prompt ───
    let htmlContext = '';
    if (liveHtml) {
      htmlContext = `\n\nHere is the LIVE HTML fetched directly from ${domain} right now (not cached):\n\n<homepage_html>\n${liveHtml}\n</homepage_html>\n\nIMPORTANT: Base your technical analysis (meta tags, titles, schema markup, heading structure, internal links, content quality) on this LIVE HTML. The live HTML is the ground truth for what is currently on the site.`;
    } else {
      htmlContext = `\n\nNOTE: Could not fetch live HTML from ${domain} (${fetchError || 'connection failed'}). Base your analysis on your knowledge of this domain and what a typical site like this would have.`;
    }

    // ─── Step 3: Call Claude API ───
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      await store.setJSON(auditId, { status: 'error', domain, error: 'API key not configured' });
      return { statusCode: 200, body: 'done' };
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
        temperature: 0,
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

    if (data.error) {
      console.error('Anthropic API error:', JSON.stringify(data.error));
      await store.setJSON(auditId, { status: 'error', domain, error: data.error.message || 'API error' });
      return { statusCode: 200, body: 'done' };
    }

    const allText = (data.content || [])
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('\n');

    if (!allText) {
      await store.setJSON(auditId, { status: 'error', domain, error: 'No text in API response' });
      return { statusCode: 200, body: 'done' };
    }

    // Parse JSON from response
    const cleaned = allText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*"overall_score"[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          await store.setJSON(auditId, { status: 'error', domain, error: 'Could not parse results' });
          return { statusCode: 200, body: 'done' };
        }
      } else {
        await store.setJSON(auditId, { status: 'error', domain, error: 'Unexpected response format' });
        return { statusCode: 200, body: 'done' };
      }
    }

    if (!parsed.overall_score || !parsed.overall_grade || !parsed.categories) {
      await store.setJSON(auditId, { status: 'error', domain, error: 'Incomplete results' });
      return { statusCode: 200, body: 'done' };
    }

    // ─── Step 4: Store results ───
    await store.setJSON(auditId, {
      status: 'complete',
      domain,
      results: parsed,
      completedAt: Date.now(),
    });

    // ─── Step 5: Check if email notification was requested ───
    try {
      const emailDataRaw = await store.get(`email-${auditId}`);
      if (emailDataRaw) {
        const emailData = JSON.parse(emailDataRaw);
        if (emailData && emailData.email) {
          await sendReportEmail(emailData.email, emailData.name, domain, parsed);
          // Also notify Simple IT
          await sendInternalNotification(emailData.email, emailData.name, domain, parsed);
        }
      }
    } catch (e) {
      console.error('Email send error:', e.message);
    }

  } catch (err) {
    console.error('Background function error:', err);
    try {
      await store.setJSON(auditId, { status: 'error', domain, error: err.message });
    } catch (e) {
      console.error('Failed to store error:', e.message);
    }
  }

  return { statusCode: 200, body: 'done' };
};

// ─── Email helpers ───

function getTransporter() {
  return nodemailer.createTransport({
    host: 'mail.smtp2go.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP2GO_USERNAME,
      pass: process.env.SMTP2GO_PASSWORD,
    },
  });
}

function getScoreColor(score) {
  if (score >= 80) return '#16a34a';
  if (score >= 60) return '#ca8a04';
  return '#dc2626';
}

async function sendReportEmail(email, name, domain, results) {
  const transporter = getTransporter();
  const greeting = name ? `Hi ${name},` : 'Hi there,';
  const scoreColor = getScoreColor(results.overall_score);

  const catRows = Object.entries({
    meta: 'Meta Tags & Titles',
    content: 'Content Quality',
    schema: 'Schema Markup',
    mobile: 'Mobile Friendliness',
    performance: 'Page Speed',
    local: 'Local SEO',
  }).map(([key, label]) => {
    const cat = results.categories[key];
    const color = getScoreColor(cat.score);
    const hasIssue = cat.visible_issue && !cat.visible_issue.toLowerCase().includes('no major issues');
    return `<tr>
      <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#333;font-size:14px;">${label}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:center;"><span style="color:${color};font-weight:700;font-size:14px;">${cat.score}</span><span style="color:#999;font-size:12px;">/100</span></td>
      <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:${hasIssue ? '#666' : '#16a34a'};font-size:13px;">${cat.visible_issue}</td>
    </tr>`;
  }).join('');

  await transporter.sendMail({
    from: '"SitePilot by Simple IT" <info@simple-it.us>',
    to: email,
    subject: `Your SEO Audit Results for ${domain} — Grade: ${results.overall_grade}`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;background:#ffffff;">
        <!-- Header -->
        <div style="padding:28px 30px;border-bottom:2px solid #0066FF;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="font-size:20px;font-weight:700;color:#333;">SitePilot SEO Audit</td>
            <td style="text-align:right;font-size:13px;color:#999;">by Simple IT</td>
          </tr></table>
        </div>

        <!-- Body -->
        <div style="padding:30px;">
          <p style="color:#333;font-size:15px;margin:0 0 5px;">${greeting}</p>
          <p style="color:#555;font-size:15px;margin:0 0 30px;line-height:1.5;">Your SEO audit for <strong style="color:#333;">${domain}</strong> is complete.</p>

          <!-- Score Card -->
          <div style="text-align:center;padding:30px 20px;border:1px solid #e5e5e5;border-radius:8px;margin-bottom:30px;">
            <div style="font-size:56px;font-weight:800;color:${scoreColor};line-height:1;">${results.overall_grade}</div>
            <div style="font-size:16px;color:#999;margin-top:6px;">${results.overall_score} out of 100</div>
          </div>

          <!-- Summary -->
          <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 24px;text-align:center;font-style:italic;">${results.summary}</p>

          <!-- Issue Counts -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
            <tr>
              <td style="text-align:center;padding:12px;border:1px solid #fecaca;border-radius:6px;background:#fef2f2;">
                <div style="font-size:22px;font-weight:700;color:#dc2626;">${results.critical_count}</div>
                <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;">Critical</div>
              </td>
              <td width="12"></td>
              <td style="text-align:center;padding:12px;border:1px solid #fef08a;border-radius:6px;background:#fefce8;">
                <div style="font-size:22px;font-weight:700;color:#ca8a04;">${results.warning_count}</div>
                <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;">Warnings</div>
              </td>
              <td width="12"></td>
              <td style="text-align:center;padding:12px;border:1px solid #bbf7d0;border-radius:6px;background:#f0fdf4;">
                <div style="font-size:22px;font-weight:700;color:#16a34a;">${results.passed_count}</div>
                <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;">Passed</div>
              </td>
            </tr>
          </table>

          <!-- Category Table -->
          <table style="width:100%;border-collapse:collapse;border:1px solid #e5e5e5;border-radius:8px;">
            <tr style="background:#f9fafb;">
              <th style="padding:10px 16px;text-align:left;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e5e5;">Category</th>
              <th style="padding:10px 16px;text-align:center;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e5e5;">Score</th>
              <th style="padding:10px 16px;text-align:left;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e5e5;">Key Finding</th>
            </tr>
            ${catRows}
          </table>

          <!-- CTA -->
          <div style="margin-top:30px;padding:24px;background:#f9fafb;border-radius:8px;border-left:4px solid #0066FF;">
            <h3 style="margin:0 0 8px;color:#333;font-size:16px;">Want help fixing these issues?</h3>
            <p style="color:#666;margin:0 0 16px;font-size:14px;line-height:1.5;">Our SitePilot service can auto-fix most SEO issues. We'll review your audit and show you exactly what we can improve.</p>
            <div style="text-align:center;">
              <a href="https://simple-it.us/contact-us" style="display:inline-block;background:#0066FF;color:#ffffff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px;">Get Your Full Report &rarr;</a>
            </div>
          </div>

          <p style="color:#999;font-size:13px;margin-top:20px;text-align:center;">Or call us directly: <strong style="color:#333;">859-449-7878</strong></p>
        </div>

        <!-- Footer -->
        <div style="padding:20px 30px;border-top:1px solid #e5e5e5;text-align:center;font-size:12px;color:#999;">
          <p style="margin:4px 0;"><strong style="color:#666;">Simple IT, LLC</strong></p>
          <p style="margin:4px 0;">2220 Grandview Drive, Suite 250 | Ft. Mitchell, KY 41017</p>
          <p style="margin:10px 0 0;font-size:11px;color:#bbb;">You received this because you requested an SEO audit on simple-it.us/sitepilot</p>
        </div>
      </div>
    `,
  });
}

async function sendInternalNotification(email, name, domain, results) {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: '"SitePilot Lead" <info@simple-it.us>',
    to: 'info@simple-it.us',
    subject: `SitePilot Lead: ${name || email} audited ${domain} (${results.overall_grade})`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;">
        <h2 style="color:#2B4C7E;">New SitePilot Audit Lead</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="background:#f5f5f5;"><td style="padding:10px;border:1px solid #ddd;"><strong>Name:</strong></td><td style="padding:10px;border:1px solid #ddd;">${name || 'Not provided'}</td></tr>
          <tr><td style="padding:10px;border:1px solid #ddd;"><strong>Email:</strong></td><td style="padding:10px;border:1px solid #ddd;">${email}</td></tr>
          <tr style="background:#f5f5f5;"><td style="padding:10px;border:1px solid #ddd;"><strong>Domain:</strong></td><td style="padding:10px;border:1px solid #ddd;">${domain}</td></tr>
          <tr><td style="padding:10px;border:1px solid #ddd;"><strong>Score:</strong></td><td style="padding:10px;border:1px solid #ddd;">${results.overall_grade} (${results.overall_score}/100)</td></tr>
          <tr style="background:#f5f5f5;"><td style="padding:10px;border:1px solid #ddd;"><strong>Critical:</strong></td><td style="padding:10px;border:1px solid #ddd;">${results.critical_count}</td></tr>
          <tr><td style="padding:10px;border:1px solid #ddd;"><strong>Time:</strong></td><td style="padding:10px;border:1px solid #ddd;">${new Date().toLocaleString()}</td></tr>
        </table>
        <p style="margin-top:20px;"><strong>This prospect requested their audit results by email — high intent lead.</strong></p>
      </div>
    `,
  });
}
