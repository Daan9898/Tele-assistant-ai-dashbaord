const axios = require('axios');

exports.handler = async function (event) {
  const { id } = event.queryStringParameters;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing conversation ID' }),
    };
  }

  try {
    const headers = {
      'xi-api-key': process.env.ELEVEN_API_KEY,
    };

    const [detailsRes, audioRes] = await Promise.all([
      axios.get(`https://api.elevenlabs.io/v1/convai/conversations/${id}`, { headers }),
      axios.get(`https://api.elevenlabs.io/v1/convai/conversations/${id}/audio`, { headers }),
    ]);

    const responseBody = {
      summary: detailsRes.data.summary,
      transcript: detailsRes.data.transcript,
      metadata: detailsRes.data.metadata,
      audio_url: audioRes.data.audio_url,
    };

    console.log('Returning conversation details:', responseBody); // ✅ ADD THIS LINE

    return {
      statusCode: 200,
      body: JSON.stringify(responseBody),
    };
  } catch (err) {
    console.error('Error fetching conversation details:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
