const axios = require('axios');

exports.handler = async function (event) {
  const { start, end } = event.queryStringParameters || {};
  const agentName = 'co-fi Support agent';

  try {
    const response = await axios.get('https://api.elevenlabs.io/v1/convai/conversations', {
      headers: {
        'xi-api-key': process.env.ELEVEN_API_KEY,
      },
      params: {
        call_start_after_unix: start,
        call_start_before_unix: end,
        page_size: 100,
      },
    });

    const allConversations = response.data.conversations || [];

    // Filter by agent
    const filtered = allConversations.filter((c) => c.agent_name === agentName);

    // Format conversations
    const formatted = filtered.map((c) => ({
      id: c.conversation_id,
      date: c.call_start_time_unix || c.start_time_unix_secs, // support both
      duration: c.call_duration_secs,
      messages: c.message_count,
      evaluation: c.call_successful  || 'Pending'
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ conversations: formatted }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
