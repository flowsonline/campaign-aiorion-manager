import React, { useState, useEffect } from 'react';
import OrionHeader from '../components/OrionHeader';
import TypewriterText from '../components/TypewriterText';
import StepIndicator from '../components/StepIndicator';
import axios from 'axios';

export default function Home() {
  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [campaignData, setCampaignData] = useState({
    brandName: '',
    website: '',
    description: '',
    logoUrl: '',
    industry: '',
    goal: '',
    tone: '',
    platform: '',
    audience: '',
    paletteColor: '#00d9ff',
    includeVoiceover: false,
    voice: 'alloy',
    headline: '',
    caption: '',
    hashtags: [],
    script: '',
    audioUrl: '',
    imageUrl: '',
    videoUrl: '',
    renderId: '',
    renderStatus: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step messages
  const stepMessages = {
    0: "What are you posting today? Add a short description — I'll use it to shape your script & copy.",
    1: "Great. Tell me a few basics — industry, goal, tone, platform, audience, palette.",
    2: "Would you like me to generate a voiceover for your post?",
    3: "Perfect! Now I'm generating your visual content...",
    4: "Let me assemble your video with all the elements...",
    5: "Processing your content. This usually takes 30-60 seconds...",
    6: "Here's a preview of your social media post!",
    7: "All done! Your content is ready to download or post."
  };

  // Handle step progression
  const nextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
      setIsTyping(true);
      setError('');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setIsTyping(true);
      setError('');
    }
  };

  // Update campaign data
  const updateData = (field, value) => {
    setCampaignData(prev => ({ ...prev, [field]: value }));
  };

  // Step 0: Initial data collection
  const handleStep0Continue = () => {
    if (!campaignData.brandName.trim()) {
      setError('Brand/Product name is required');
      return;
    }
    if (!campaignData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!campaignData.logoUrl.trim()) {
      setError('Logo URL is required');
      return;
    }
    nextStep();
  };

  // Step 1: Generate content with AI
  const handleStep1Continue = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/compose', {
        brandName: campaignData.brandName,
        description: campaignData.description,
        website: campaignData.website,
        industry: campaignData.industry,
        goal: campaignData.goal,
        tone: campaignData.tone,
        audience: campaignData.audience,
        platform: campaignData.platform
      });

      updateData('headline', response.data.headline);
      updateData('caption', response.data.caption);
      updateData('hashtags', response.data.hashtags);
      updateData('script', response.data.script);

      nextStep();
    } catch (err) {
      setError('Failed to generate content. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Generate voiceover (optional)
  const handleStep2Continue = async () => {
    if (campaignData.includeVoiceover) {
      setLoading(true);
      setError('');

      try {
        const response = await axios.post('/api/tts', {
          script: campaignData.script,
          voice: campaignData.voice
        });

        updateData('audioUrl', response.data.audioUrl);
        nextStep();
      } catch (err) {
        setError('Failed to generate voiceover. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      nextStep();
    }
  };

  // Step 3: Generate static image/template
  const handleStep3Generate = async () => {
    setLoading(true);
    setError('');

    try {
      const formatMap = {
        'Instagram Reel 9:16': 'reel',
        'Instagram Story 9:16': 'story',
        'Static 1:1': 'static',
        'Wide 16:9': 'wide'
      };

      const format = formatMap[campaignData.platform] || 'static';

      const response = await axios.post('/api/renderTemplate', {
        headline: campaignData.headline,
        caption: campaignData.caption,
        logoUrl: campaignData.logoUrl,
        paletteColor: campaignData.paletteColor,
        format: format
      });

      updateData('renderId', response.data.id);
      updateData('renderStatus', 'queued');
      nextStep();
    } catch (err) {
      setError('Failed to start rendering. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Generate video (if selected)
  const handleStep4Generate = async () => {
    const isVideo = campaignData.platform.includes('Reel') || 
                    campaignData.platform.includes('Story') || 
                    campaignData.platform.includes('Wide');

    if (!isVideo) {
      // Skip to Step 5 if static only
      nextStep();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formatMap = {
        'Instagram Reel 9:16': 'reel',
        'Instagram Story 9:16': 'story',
        'Wide 16:9': 'wide'
      };

      const format = formatMap[campaignData.platform] || 'reel';

      const response = await axios.post('/api/renderVideo', {
        headline: campaignData.headline,
        caption: campaignData.caption,
        logoUrl: campaignData.logoUrl,
        paletteColor: campaignData.paletteColor,
        audioUrl: campaignData.audioUrl,
        format: format
      });

      updateData('renderId', response.data.id);
      updateData('renderStatus', 'queued');
      nextStep();
    } catch (err) {
      setError('Failed to start video rendering. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 5: Poll render status
  useEffect(() => {
    if (currentStep === 5 && campaignData.renderId) {
      const pollStatus = setInterval(async () => {
        try {
          const response = await axios.get(`/api/status?id=${campaignData.renderId}`);
          updateData('renderStatus', response.data.status);

          if (response.data.status === 'done') {
            updateData('videoUrl', response.data.url);
            updateData('imageUrl', response.data.url);
            clearInterval(pollStatus);
            setTimeout(() => nextStep(), 1000);
          } else if (response.data.status === 'failed') {
            setError('Rendering failed. Please try again.');
            clearInterval(pollStatus);
          }
        } catch (err) {
          console.error('Status check error:', err);
        }
      }, 4000); // Poll every 4 seconds

      return () => clearInterval(pollStatus);
    }
  }, [currentStep, campaignData.renderId]);

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="orion-panel">
            <div className="form-group">
              <label className="form-label">Brand / Product Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your brand name"
                value={campaignData.brandName}
                onChange={(e) => updateData('brandName', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Website (optional)</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://yourwebsite.com"
                value={campaignData.website}
                onChange={(e) => updateData('website', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Motive / Description *</label>
              <textarea
                className="form-textarea"
                placeholder="Describe what you want to post about..."
                value={campaignData.description}
                onChange={(e) => updateData('description', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Logo / Inspired Image URL *</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://.../logo.png"
                value={campaignData.logoUrl}
                onChange={(e) => updateData('logoUrl', e.target.value)}
              />
              <small style={{ color: '#a0aec0', fontSize: '13px' }}>
                Image must be a public, direct image URL (.png/.jpg/.jpeg/.webp)
              </small>
            </div>

            {error && <div style={{ color: '#ff6b6b', marginTop: '10px' }}>{error}</div>}

            <div className="button-group">
              <button className="orion-button orion-button-primary" onClick={handleStep0Continue}>
                Continue
              </button>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="orion-panel">
            <div className="form-group">
              <label className="form-label">Industry</label>
              <select
                className="form-select"
                value={campaignData.industry}
                onChange={(e) => updateData('industry', e.target.value)}
              >
                <option value="">Select Industry</option>
                <option value="Tech">Tech</option>
                <option value="eCommerce">eCommerce</option>
                <option value="Health & Wellness">Health & Wellness</option>
                <option value="Coaching/Education">Coaching/Education</option>
                <option value="SaaS/Tech">SaaS/Tech</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Goal</label>
              <select
                className="form-select"
                value={campaignData.goal}
                onChange={(e) => updateData('goal', e.target.value)}
              >
                <option value="">Select Goal</option>
                <option value="Traffic">Traffic</option>
                <option value="Engagement">Engagement</option>
                <option value="Awareness">Awareness</option>
                <option value="Conversions">Conversions</option>
                <option value="Leads">Leads</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tone</label>
              <select
                className="form-select"
                value={campaignData.tone}
                onChange={(e) => updateData('tone', e.target.value)}
              >
                <option value="">Select Tone</option>
                <option value="Commercial">Commercial</option>
                <option value="Professional">Professional</option>
                <option value="Casual">Casual</option>
                <option value="Inspirational">Inspirational</option>
                <option value="Humorous">Humorous</option>
                <option value="Educational">Educational</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Platform & Format</label>
              <select
                className="form-select"
                value={campaignData.platform}
                onChange={(e) => updateData('platform', e.target.value)}
              >
                <option value="">Select Platform</option>
                <option value="Instagram Reel 9:16">Instagram Reel 9:16</option>
                <option value="Instagram Story 9:16">Instagram Story 9:16</option>
                <option value="Static 1:1">Static 1:1</option>
                <option value="Wide 16:9">Wide 16:9</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Audience</label>
              <select
                className="form-select"
                value={campaignData.audience}
                onChange={(e) => updateData('audience', e.target.value)}
              >
                <option value="">Select Audience</option>
                <option value="General">General</option>
                <option value="Young Adults">Young Adults (18-30)</option>
                <option value="Professionals">Professionals (30-50)</option>
                <option value="Business Owners">Business Owners</option>
                <option value="Students">Students</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Palette (primary color)</label>
              <input
                type="color"
                className="form-input"
                value={campaignData.paletteColor}
                onChange={(e) => updateData('paletteColor', e.target.value)}
              />
            </div>

            <div className="form-group">
              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="voiceover-checkbox"
                  checked={campaignData.includeVoiceover}
                  onChange={(e) => updateData('includeVoiceover', e.target.checked)}
                />
                <label htmlFor="voiceover-checkbox">
                  Include voiceover script & TTS preview
                </label>
              </div>
            </div>

            {campaignData.includeVoiceover && (
              <div className="form-group">
                <label className="form-label">Voice</label>
                <select
                  className="form-select"
                  value={campaignData.voice}
                  onChange={(e) => updateData('voice', e.target.value)}
                >
                  <option value="alloy">Alloy (Neutral)</option>
                  <option value="echo">Echo (Male)</option>
                  <option value="fable">Fable (British Male)</option>
                  <option value="onyx">Onyx (Deep Male)</option>
                  <option value="nova">Nova (Female)</option>
                  <option value="shimmer">Shimmer (Soft Female)</option>
                </select>
              </div>
            )}

            {error && <div style={{ color: '#ff6b6b', marginTop: '10px' }}>{error}</div>}

            <div className="button-group">
              <button className="orion-button orion-button-secondary" onClick={prevStep}>
                Back
              </button>
              <button 
                className="orion-button orion-button-primary" 
                onClick={handleStep1Continue}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Continue'}
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="orion-panel">
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#00d9ff', marginBottom: '12px' }}>Generated Content:</h3>
              <p><strong>Headline:</strong> {campaignData.headline}</p>
              <p><strong>Caption:</strong> {campaignData.caption}</p>
              <p><strong>Hashtags:</strong> #{campaignData.hashtags.join(' #')}</p>
            </div>

            {campaignData.includeVoiceover && (
              <div className="form-group">
                <label className="form-label">Voiceover Script</label>
                <textarea
                  className="form-textarea"
                  value={campaignData.script}
                  onChange={(e) => updateData('script', e.target.value)}
                  rows={5}
                />
              </div>
            )}

            {error && <div style={{ color: '#ff6b6b', marginTop: '10px' }}>{error}</div>}

            <div className="button-group">
              <button className="orion-button orion-button-secondary" onClick={prevStep}>
                Back
              </button>
              <button 
                className="orion-button orion-button-primary" 
                onClick={handleStep2Continue}
                disabled={loading}
              >
                {loading ? 'Generating Audio...' : 'Continue'}
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="orion-panel">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Generating your visual content...</p>
            </div>

            {error && <div style={{ color: '#ff6b6b', marginTop: '10px', textAlign: 'center' }}>{error}</div>}

            <div className="button-group" style={{ justifyContent: 'center' }}>
              <button 
                className="orion-button orion-button-primary" 
                onClick={handleStep3Generate}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Start Rendering'}
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="orion-panel">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Assembling your video with all elements...</p>
            </div>

            {error && <div style={{ color: '#ff6b6b', marginTop: '10px', textAlign: 'center' }}>{error}</div>}

            <div className="button-group" style={{ justifyContent: 'center' }}>
              <button 
                className="orion-button orion-button-primary" 
                onClick={handleStep4Generate}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Start Video Render'}
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="orion-panel">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">
                Status: {campaignData.renderStatus || 'Processing...'}
              </p>
              <p style={{ color: '#a0aec0', fontSize: '14px', marginTop: '12px' }}>
                This usually takes 30-60 seconds. Please wait...
              </p>
            </div>

            {error && <div style={{ color: '#ff6b6b', marginTop: '20px', textAlign: 'center' }}>{error}</div>}
          </div>
        );

      case 6:
        return (
          <div className="orion-panel">
            <h3 style={{ color: '#00d9ff', marginBottom: '20px', textAlign: 'center' }}>
              Preview Your Post
            </h3>

            <div className="preview-container">
              <div className="preview-media">
                {campaignData.videoUrl || campaignData.imageUrl ? (
                  campaignData.platform.includes('Reel') || 
                  campaignData.platform.includes('Story') || 
                  campaignData.platform.includes('Wide') ? (
                    <video src={campaignData.videoUrl} controls style={{ width: '100%' }} />
                  ) : (
                    <img src={campaignData.imageUrl} alt="Generated content" style={{ width: '100%' }} />
                  )
                ) : (
                  <p style={{ textAlign: 'center', padding: '40px' }}>Media loading...</p>
                )}
              </div>

              <div style={{ marginTop: '24px', padding: '20px' }}>
                <p><strong style={{ color: '#00d9ff' }}>Headline:</strong> {campaignData.headline}</p>
                <p><strong style={{ color: '#00d9ff' }}>Caption:</strong> {campaignData.caption}</p>
                <p><strong style={{ color: '#00d9ff' }}>Hashtags:</strong> #{campaignData.hashtags.join(' #')}</p>
              </div>
            </div>

            <div className="button-group">
              <button className="orion-button orion-button-secondary" onClick={prevStep}>
                Back
              </button>
              <button className="orion-button orion-button-primary" onClick={nextStep}>
                Finalize
              </button>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="orion-panel">
            <h3 style={{ color: '#00d9ff', marginBottom: '20px', textAlign: 'center' }}>
              🎉 Your Content is Ready!
            </h3>

            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <p style={{ fontSize: '18px', marginBottom: '20px' }}>
                Your social media content has been successfully created!
              </p>

              <div className="button-group" style={{ justifyContent: 'center' }}>
                <a
                  href={campaignData.videoUrl || campaignData.imageUrl}
                  download
                  className="orion-button orion-button-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📥 Download Media
                </a>
              </div>
            </div>

            <div style={{ background: 'rgba(0,217,255,0.1)', padding: '24px', borderRadius: '12px', marginTop: '30px' }}>
              <h4 style={{ color: '#00d9ff', marginBottom: '16px' }}>✨ Best Practices Tips:</h4>
              <ul style={{ lineHeight: '1.8', color: '#e0e6f0' }}>
                <li>Post during peak engagement hours (typically 9-11 AM or 7-9 PM)</li>
                <li>Engage with comments within the first hour to boost visibility</li>
                <li>Use all suggested hashtags to maximize reach</li>
                <li>Consider creating variations for different platforms</li>
                <li>Track performance metrics to optimize future content</li>
              </ul>
            </div>

            <div className="button-group" style={{ marginTop: '30px' }}>
              <button 
                className="orion-button orion-button-primary" 
                onClick={() => {
                  setCampaignData({
                    brandName: '',
                    website: '',
                    description: '',
                    logoUrl: '',
                    industry: '',
                    goal: '',
                    tone: '',
                    platform: '',
                    audience: '',
                    paletteColor: '#00d9ff',
                    includeVoiceover: false,
                    voice: 'alloy',
                    headline: '',
                    caption: '',
                    hashtags: [],
                    script: '',
                    audioUrl: '',
                    imageUrl: '',
                    videoUrl: '',
                    renderId: '',
                    renderStatus: ''
                  });
                  setCurrentStep(0);
                  setError('');
                }}
              >
                🔄 Create Another Post
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="orion-container">
      <OrionHeader />
      
      <StepIndicator currentStep={currentStep} totalSteps={7} />
      
      {isTyping && (
        <TypewriterText 
          text={stepMessages[currentStep]} 
          onComplete={() => setIsTyping(false)}
        />
      )}
      
      {renderStep()}
    </div>
  );
}
