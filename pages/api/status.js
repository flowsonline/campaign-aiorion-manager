import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Render ID is required' });
    }

    // Poll Shotstack for render status
    const shotstackResponse = await axios.get(
      `https://api.shotstack.io/${process.env.SHOTSTACK_ENV || 'stage'}/render/${id}`,
      {
        headers: {
          'x-api-key': process.env.SHOTSTACK_API_KEY,
        },
      }
    );

    const renderData = shotstackResponse.data.response;

    return res.status(200).json({
      id: renderData.id,
      status: renderData.status, // queued, fetching, rendering, saving, done, failed
      url: renderData.url || null,
      error: renderData.error || null,
      progress: renderData.data?.renderTime || 0
    });

  } catch (error) {
    console.error('Status check error:', error.response?.data || error);
    return res.status(500).json({
      error: 'Failed to check render status',
      message: error.response?.data?.message || error.message
    });
  }
}
