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

  const { auditId, email, name, domain, results } = body;
  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing email' }) };
  }

  try {
    // If frontend already has results, send email immediately (no Blobs needed)
    if (results && results.overall_score) {
      await sendReportEmail(email, name, domain, results);
      await sendInternalNotification(email, name, domain, results);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sent: true }),
      };
    }

    // No results yet — store email request for background function to pick up
    if (auditId) {
      const store = getStore('sitepilot-audits');
      await store.setJSON(`email-${auditId}`, { email, name, domain, requestedAt: Date.now() });

      // Check if background function already finished
      const raw = await store.get(auditId);
      if (raw) {
        const auditData = JSON.parse(raw);
        if (auditData.status === 'complete' && auditData.results) {
          await sendReportEmail(email, name, domain, auditData.results);
          await sendInternalNotification(email, name, domain, auditData.results);
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sent: true }),
          };
        }
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
  if (score >= 80) return '#16a34a';
  if (score >= 60) return '#ca8a04';
  return '#dc2626';
}

function getScoreLabel(score) {
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Needs Work';
  return 'Critical';
}

async function sendReportEmail(email, name, domain, results) {
  const transporter = getTransporter();
  const greeting = name ? `Hi ${name},` : 'Hi there,';
  const scoreColor = getScoreColor(results.overall_score);

  const catRows = Object.entries({
    meta: 'Can Customers Find You?',
    content: 'Does Your Site Win Them Over?',
    schema: 'Does Your Listing Stand Out?',
    mobile: 'Does It Work on Phones?',
    performance: 'Is Your Site Fast Enough?',
    local: 'Do Nearby Customers See You?',
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
