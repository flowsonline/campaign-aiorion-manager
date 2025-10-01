import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      headline,
      caption,
      logoUrl,
      paletteColor,
      format = 'square' // square, reel, story, wide, static
    } = req.body;

    if (!headline || !logoUrl) {
      return res.status(400).json({ error: 'Headline and logo URL are required' });
    }

    // Load the appropriate template
    const templatePath = path.join(process.cwd(), 'templates', `${format}.json`);
    
    if (!fs.existsSync(templatePath)) {
      return res.status(400).json({ error: `Template ${format}.json not found` });
    }

    let templateContent = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholders
    templateContent = templateContent
      .replace(/\{\{headline\}\}/g, headline)
      .replace(/\{\{caption\}\}/g, caption || '')
      .replace(/\{\{logoUrl\}\}/g, logoUrl)
      .replace(/\{\{paletteColor\}\}/g, paletteColor || '#00d9ff');

    const template = JSON.parse(templateContent);

    // Submit to Shotstack
    const shotstackResponse = await axios.post(
      `https://api.shotstack.io/${process.env.SHOTSTACK_ENV || 'stage'}/render`,
      template,
      {
        headers: {
          'x-api-key': process.env.SHOTSTACK_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const renderId = shotstackResponse.data.response.id;

    return res.status(200).json({
      id: renderId,
      status: 'queued',
      message: 'Render started successfully'
    });

  } catch (error) {
    console.error('Render template error:', error.response?.data || error);
    return res.status(500).json({
      error: 'Failed to render template',
      message: error.response?.data?.message || error.message
    });
  }
}
