// Netlify Function to fetch Google Reviews
// This keeps your API key secure and caches results

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    const placeId = event.queryStringParameters.placeId;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!placeId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Place ID is required' })
        };
    }

    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'API key not configured' })
        };
    }

    try {
        // Use the NEW Places API endpoint
        const url = `https://places.googleapis.com/v1/places/${placeId}?fields=displayName,rating,reviews,userRatingCount&key=${apiKey}`;
        
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-FieldMask': 'displayName,rating,reviews,userRatingCount'
            }
        });
        
        const data = await response.json();

        if (data.displayName) {
            // Cache the response for 24 hours to reduce API calls
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'public, max-age=86400', // 24 hours
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    rating: data.rating || 5.0,
                    totalReviews: data.userRatingCount || 0,
                    reviews: data.reviews || []
                })
            };
        } else {
            throw new Error(data.error?.message || 'Failed to fetch reviews');
        }
    } catch (error) {
        console.error('Error fetching Google reviews:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                error: 'Failed to fetch reviews. Please try again later.'
            })
        };
    }
};
