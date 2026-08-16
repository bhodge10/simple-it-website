// Returns audit status and results from Netlify Blobs
const { getStore, connectLambda } = require('@netlify/blobs');

exports.handler = async (event) => {
  // Legacy-style functions must connect Blobs to the invocation event or
  // getStore() throws — the source of every "Could not check audit status".
  if (typeof connectLambda === 'function') connectLambda(event);

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
      // status 'unavailable', NOT 'error': the page treats 'error' as "the
      // audit failed" and stops polling — a storage hiccup here shouldn't
      // kill an audit that's still running. Include the real message so the
      // next person doesn't have to guess what broke.
      body: JSON.stringify({ status: 'unavailable', error: 'Could not check audit status', detail: err.message }),
    };
  }
};
