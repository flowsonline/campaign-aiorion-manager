import React, { useState, useEffect } from 'react';

export default function TypewriterText({ text, speed = 30, onComplete }) {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    
    const typingInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsComplete(true);
        if (onComplete) {
          onComplete();
        }
      }
    }, speed);

    // Cursor blinking
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
    };
  }, [text, speed, onComplete]);

  return (
    <div className="typewriter">
      <span style={{ fontWeight: 600, color: '#00d9ff' }}>Orion ▸ </span>
      {displayText}
      {!isComplete && showCursor && <span className="typewriter-cursor">▋</span>}
    </div>
  );
}
