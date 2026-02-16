// Returns audit status and results from Netlify Blobs
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const auditId = event.queryStringParameters && event.queryStringParameters.id;
  if (!auditId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing audit ID' }) };
  }

  try {
    const store = getStore('sitepilot-audits');
    const raw = await store.get(auditId);

    if (!raw) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'not_found' }),
      };
    }

    const data = JSON.parse(raw);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error('Status check error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'error', error: 'Could not check audit status' }),
    };
  }
};
