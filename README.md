# 🌟 Orion Social Media AI Studio

AI-powered social media content creation tool that generates videos, images, captions, and voiceovers.

---

## 🚀 Quick Setup (5 Minutes!)

### Step 1: Upload to GitHub
1. Download this entire folder
2. Go to https://github.com/new
3. Create a new repository named `orion-social-studio`
4. Upload all files using GitHub Desktop or web interface

### Step 2: Add Your API Keys
1. Copy `.env.local.example` to `.env.local`
2. Add your OpenAI API key from https://platform.openai.com/api-keys
3. Add your Shotstack API key from https://dashboard.shotstack.io/

### Step 3: Deploy to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Add environment variables (same as .env.local)
4. Click "Deploy"
5. Done! 🎉

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser to http://localhost:3000
```

---

## 📁 Project Structure

```
orion-social-studio/
├── pages/
│   ├── index.js              → Main Orion wizard interface
│   ├── _app.js               → App wrapper with global styles
│   └── api/                  → Backend API routes
│       ├── compose.js        → AI content generation
│       ├── tts.js            → Text-to-speech
│       ├── renderTemplate.js → Static image rendering
│       ├── renderVideo.js    → Video rendering
│       ├── status.js         → Check render status
│       └── shotstackWebhook.js → Webhook handler
├── components/
│   ├── OrionHeader.js        → Top header with logo
│   ├── TypewriterText.js     → Animated typing effect
│   ├── StepIndicator.js      → Progress tracker
│   ├── ChatContainer.js      → Chat-style input
│   └── steps/                → 8 wizard steps
├── styles/
│   ├── globals.css           → Orion dark theme
│   └── orion.module.css      → Component styles
├── lib/
│   ├── openai.js             → OpenAI helper functions
│   ├── shotstack.js          → Shotstack helper functions
│   └── validation.js         → Input validation
└── templates/
    ├── square.json           → 1:1 format template
    ├── reel.json             → 9:16 reel template
    ├── story.json            → 9:16 story template
    ├── wide.json             → 16:9 wide template
    └── static.json           → Static image template
```

---

## 🎯 Features

- ✅ AI-generated headlines, captions, hashtags
- ✅ Text-to-speech voiceovers
- ✅ Static image generation
- ✅ Video rendering (Reels, Stories, Wide format)
- ✅ Multiple templates
- ✅ Dark Orion-themed UI
- ✅ Typewriter animation effects
- ✅ Real-time rendering status

---

## 🔑 Required API Keys

### OpenAI
- Sign up: https://platform.openai.com/signup
- Create API key: https://platform.openai.com/api-keys
- Used for: Content generation, TTS voiceovers

### Shotstack
- Sign up: https://dashboard.shotstack.io/register
- Get API key: https://dashboard.shotstack.io/
- Used for: Image & video rendering

---

## 📞 Support

For issues or questions:
- Check the code comments in each file
- Review Shotstack docs: https://shotstack.io/docs/guide/
- Review OpenAI docs: https://platform.openai.com/docs/

---

## 🎨 Customization

- Edit templates in `/templates/` folder
- Modify colors in `/styles/globals.css`
- Adjust AI prompts in `/pages/api/compose.js`
- Change voices in `/pages/api/tts.js`

---

**Built with Next.js, OpenAI, and Shotstack** 🚀
