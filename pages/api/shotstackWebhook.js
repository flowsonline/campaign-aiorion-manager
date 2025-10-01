// Webhook handler for Shotstack render completion
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const webhookData = req.body;

    // Log the webhook data
    console.log('Shotstack Webhook Received:', {
      id: webhookData.id,
      status: webhookData.status,
      url: webhookData.url,
      timestamp: new Date().toISOString()
    });

    // Here you can add logic to:
    // - Update database with render status
    // - Send notification to user
    // - Trigger next step in workflow

    return res.status(200).json({ 
      received: true,
      message: 'Webhook processed successfully' 
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ 
      error: 'Webhook processing failed',
      message: error.message 
    });
  }
}
