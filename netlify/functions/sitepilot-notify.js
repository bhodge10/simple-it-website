// Stores email for an audit and sends results immediately if already complete
const { getStore } = require('@netlify/blobs');
const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  const { auditId, email, name, domain } = body;
  if (!auditId || !email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing auditId or email' }) };
  }

  try {
    const store = getStore('sitepilot-audits');

    // Store email request for this audit
    await store.setJSON(`email-${auditId}`, { email, name, domain, requestedAt: Date.now() });

    // Check if results already exist
    const raw = await store.get(auditId);
    if (raw) {
      const auditData = JSON.parse(raw);
      if (auditData.status === 'complete' && auditData.results) {
        // Results ready — send email now
        await sendReportEmail(email, name, domain, auditData.results);
        await sendInternalNotification(email, name, domain, auditData.results);
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sent: true }),
        };
      }
    }

    // Results not ready yet — background function will send when done
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queued: true }),
    };

  } catch (err) {
    console.error('Notify error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Could not process notification request' }),
    };
  }
};

// ─── Email helpers (same as background function) ───

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
  if (score >= 80) return '#00D4AA';
  if (score >= 60) return '#FFBE0B';
  return '#FF4757';
}

async function sendReportEmail(email, name, domain, results) {
  const transporter = getTransporter();
  const greeting = name ? `Hi ${name},` : 'Hi,';
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
    return `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #1a2050;color:#E8E6F0;">${label}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #1a2050;color:${color};font-weight:700;text-align:center;">${cat.score}/100</td>
      <td style="padding:10px 12px;border-bottom:1px solid #1a2050;color:#8B8AA0;font-size:13px;">${cat.visible_issue}</td>
    </tr>`;
  }).join('');

  await transporter.sendMail({
    from: '"SitePilot by Simple IT" <info@simple-it.us>',
    to: email,
    subject: `Your SEO Audit Results for ${domain} — Grade: ${results.overall_grade}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#0A0E27;color:#E8E6F0;">
        <div style="padding:30px;text-align:center;border-bottom:1px solid #1a2050;">
          <h1 style="margin:0;font-size:24px;color:#fff;">🚀 SitePilot SEO Audit</h1>
          <p style="margin:8px 0 0;color:#8B8AA0;font-size:14px;">by Simple IT</p>
        </div>
        <div style="padding:30px;">
          <p style="color:#E8E6F0;font-size:16px;">${greeting}</p>
          <p style="color:#E8E6F0;">Your SEO audit for <strong>${domain}</strong> is complete. Here are your results:</p>
          <div style="text-align:center;margin:30px 0;">
            <div style="display:inline-block;background:#111638;border-radius:16px;padding:30px 50px;">
              <div style="font-size:48px;font-weight:800;color:${scoreColor};">${results.overall_grade}</div>
              <div style="font-size:20px;color:#8B8AA0;margin-top:4px;">${results.overall_score}/100</div>
            </div>
          </div>
          <p style="color:#8B8AA0;text-align:center;font-style:italic;margin-bottom:30px;">${results.summary}</p>
          <div style="text-align:center;margin-bottom:20px;">
            <span style="color:#FF4757;">🔴 ${results.critical_count} Critical</span> &nbsp;·&nbsp;
            <span style="color:#FFBE0B;">🟡 ${results.warning_count} Warnings</span> &nbsp;·&nbsp;
            <span style="color:#00D4AA;">🟢 ${results.passed_count} Passed</span>
          </div>
          <table style="width:100%;border-collapse:collapse;background:#111638;border-radius:10px;overflow:hidden;">
            <tr style="background:#0d1230;">
              <th style="padding:12px;text-align:left;color:#8B8AA0;font-size:12px;text-transform:uppercase;">Category</th>
              <th style="padding:12px;text-align:center;color:#8B8AA0;font-size:12px;text-transform:uppercase;">Score</th>
              <th style="padding:12px;text-align:left;color:#8B8AA0;font-size:12px;text-transform:uppercase;">Key Issue</th>
            </tr>
            ${catRows}
          </table>
          <div style="margin-top:30px;padding:20px;background:#111638;border-left:3px solid #0066FF;border-radius:10px;">
            <h3 style="margin:0 0 10px;color:#fff;font-size:16px;">Want to fix these issues?</h3>
            <p style="color:#8B8AA0;margin:0 0 15px;font-size:14px;">Our SitePilot service can auto-fix most SEO issues. We'll review your audit and show you exactly what we can improve.</p>
            <div style="text-align:center;">
              <a href="https://simple-it.us/contact-us" style="display:inline-block;background:linear-gradient(135deg,#0066FF,#00D4AA);color:#fff;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:700;">Get Your Full Report →</a>
            </div>
          </div>
          <p style="color:#8B8AA0;font-size:13px;margin-top:20px;text-align:center;">Or call us directly: <strong style="color:#E8E6F0;">859-449-7878</strong></p>
        </div>
        <div style="padding:20px 30px;border-top:1px solid #1a2050;text-align:center;font-size:11px;color:#555;">
          <p style="margin:5px 0;"><strong>Simple IT, LLC</strong></p>
          <p style="margin:5px 0;">2220 Grandview Drive, Suite 250 | Ft. Mitchell, KY 41017</p>
          <p style="margin:10px 0 0;color:#444;">You're receiving this because you requested an SEO audit on simple-it.us/sitepilot</p>
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
