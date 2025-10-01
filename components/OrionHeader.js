import React from 'react';

export default function OrionHeader() {
  return (
    <div className="orion-header">
      <div className="orion-logo">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#00d9ff" strokeWidth="2"/>
          <circle cx="12" cy="12" r="3" fill="#00d9ff"/>
        </svg>
      </div>
      <h1>Orion — AI Social Media Agent</h1>
      <p>I'll help design campaigns, create media, and preview your post.</p>
    </div>
  );
}
