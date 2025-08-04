const axios = require('axios');

exports.handler = async function(event) {
  const { start, end } = event.queryStringParameters;

  try {
    const response = await axios.get('https://api.elevenlabs.io/v1/usage/character-stats', {
      headers: {
        'xi-api-key': process.env.ELEVEN_API_KEY,
      },
      params: {
        start_unix: start,
        end_unix: end,
        aggregation_interval: 'day',
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (err) {
    console.error('Error from ElevenLabs:', err.response?.data || err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to fetch usage data',
        details: err.response?.data || err.message,
      }),
    };
  }
};
