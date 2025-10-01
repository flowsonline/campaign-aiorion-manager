import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      brandName,
      description,
      industry,
      goal,
      tone,
      audience,
      platform,
      website
    } = req.body;

    // Validate required fields
    if (!brandName || !description) {
      return res.status(400).json({ error: 'Brand name and description are required' });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Build the prompt
    const prompt = `You are a professional social media content creator. Create compelling social media content based on these details:

Brand: ${brandName}
${website ? `Website: ${website}` : ''}
Industry: ${industry || 'General'}
Goal: ${goal || 'Engagement'}
Tone: ${tone || 'Professional'}
Target Audience: ${audience || 'General'}
Platform: ${platform || 'Instagram'}
Campaign Description: ${description}

Generate the following (use JSON format):
1. headline: A catchy, attention-grabbing headline (max 60 characters)
2. caption: An engaging post caption (max 150 characters, include relevant context)
3. hashtags: Array of 5 relevant hashtags (without # symbol)
4. script: A 30-second voiceover script that's engaging and natural

Return ONLY valid JSON with these exact keys: headline, caption, hashtags (array), script`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a social media content expert. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 800,
    });

    const responseText = completion.choices[0].message.content;
    
    // Try to parse JSON response
    let content;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      content = JSON.parse(cleanedResponse);
    } catch (parseError) {
      // Fallback: extract content manually
      console.error('JSON parse error:', parseError);
      content = {
        headline: "Amazing Campaign Ahead!",
        caption: "Discover something extraordinary. Your journey starts here.",
        hashtags: ["innovation", "creative", "awesome", "trending", "discover"],
        script: "Hey there! Get ready for something amazing. This is your moment to shine and make an impact. Join us on this incredible journey!"
      };
    }

    // Ensure hashtags is an array
    if (!Array.isArray(content.hashtags)) {
      content.hashtags = ["social", "media", "content", "marketing", "digital"];
    }

    return res.status(200).json(content);

  } catch (error) {
    console.error('Compose API error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate content',
      message: error.message 
    });
  }
}
