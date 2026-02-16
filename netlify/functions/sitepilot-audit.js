// REQUIRED: Set ANTHROPIC_API_KEY in Netlify dashboard → Site settings → Environment variables
const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Parse the domain from the request
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

  // Clean the domain
  domain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [
          {
            role: 'user',
            content: `You are an SEO auditor. Search for and analyze the website at ${domain}. Look at the actual site content, meta tags, structure, and online presence.

Respond with ONLY a JSON object — no markdown, no backticks, no explanation before or after. Just the raw JSON:

{
  "overall_score": <number 0-100>,
  "overall_grade": "<letter grade like A, B+, C-, D+, etc>",
  "summary": "<one sentence assessment specific to this site>",
  "categories": {
    "meta": { "score": <0-100>, "visible_issue": "<one specific issue you actually found>" },
    "content": { "score": <0-100>, "visible_issue": "<one specific issue you actually found>" },
    "schema": { "score": <0-100>, "visible_issue": "<one specific issue you actually found>" },
    "mobile": { "score": <0-100>, "visible_issue": "<one specific issue you actually found>" },
    "performance": { "score": <0-100>, "visible_issue": "<one specific issue you actually found>" },
    "local": { "score": <0-100>, "visible_issue": "<one specific issue you actually found>" }
  },
  "critical_count": <number of critical issues>,
  "warning_count": <number of warnings>,
  "passed_count": <number of checks passed>,
  "blurred_findings": [
    "<specific teaser finding — concerning but not actionable without help>",
    "<specific teaser finding>",
    "<specific teaser finding>"
  ]
}

Rules:
- Be honest and accurate based on what you actually find
- Every visible_issue must be specific to THIS site, not generic advice
- Keep each visible_issue to one sentence
- The blurred_findings should be real issues but described vaguely enough that the user can't fix them alone
- Score harshly but fairly — most small business sites score 40-65
- If you can't find the site, score everything low and say "Site could not be fully analyzed" in the summary`
          }
        ],
      }),
    });

    const data = await response.json();

    // Check for API errors
    if (data.error) {
      console.error('Anthropic API error:', data.error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Audit service temporarily unavailable' }),
      };
    }

    // Extract text from response (may have multiple content blocks from web search)
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
          console.error('JSON parse failed. Response:', cleaned.slice(0, 500));
          return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Could not parse audit results' }),
          };
        }
      } else {
        console.error('No JSON found. Response:', cleaned.slice(0, 500));
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Audit returned unexpected format' }),
        };
      }
    }

    // Validate required fields exist
    if (!parsed.overall_score || !parsed.overall_grade || !parsed.categories) {
      console.error('Missing required fields:', Object.keys(parsed));
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Audit results incomplete' }),
      };
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
