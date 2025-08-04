const axios = require('axios');

exports.handler = async function(event) {
  const { start, end } = event.queryStringParameters;
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

    // Filter by agent name
    const filtered = allConversations.filter(c => c.agent_name === agentName);

    const totalSeconds = filtered.reduce((sum, c) => sum + c.call_duration_secs, 0);
    const totalCalls = filtered.length;
    const avgSeconds = totalCalls > 0 ? totalSeconds / totalCalls : 0;

    const callDurations = filtered.map(c => c.call_duration_secs);

     const callsPerDay = {};
    for (const convo of filtered) {
      const day = new Date(convo.start_time_unix_secs * 1000).toISOString().split('T')[0];
      callsPerDay[day] = (callsPerDay[day] || 0) + 1;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ totalSeconds, totalCalls, avgSeconds, callDurations, callsPerDay   }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch conversations', details: err.message }),
    };
  }
};
