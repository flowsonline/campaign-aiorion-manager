import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { script, voice = 'alloy' } = req.body;

    if (!script) {
      return res.status(400).json({ error: 'Script is required' });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Generate speech using OpenAI TTS
    const mp3Response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice, // Options: alloy, echo, fable, onyx, nova, shimmer
      input: script,
      speed: 1.0,
    });

    // Convert to buffer
    const buffer = Buffer.from(await mp3Response.arrayBuffer());
    
    // Convert to base64 for easy transmission
    const base64Audio = buffer.toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

    return res.status(200).json({ 
      audioUrl,
      success: true 
    });

  } catch (error) {
    console.error('TTS API error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate audio',
      message: error.message 
    });
  }
}
