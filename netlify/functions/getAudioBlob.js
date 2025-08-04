const axios = require('axios');

exports.handler = async function (event) {
  const { id } = event.queryStringParameters;

  if (!id) {
    return {
      statusCode: 400,
      body: 'Missing conversation ID',
    };
  }

  try {
    const response = await axios.get(
      `https://api.elevenlabs.io/v1/convai/conversations/${id}/audio`,
      {
        headers: {
          'xi-api-key': process.env.ELEVEN_API_KEY,
        },
        responseType: 'arraybuffer',
      }
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
      },
      body: Buffer.from(response.data, 'binary').toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('Error fetching audio:', error.message);
    return {
      statusCode: 500,
      body: 'Failed to fetch audio',
    };
  }
};
