import React, { useState } from 'react';

export default function ChatContainer({ onSend, placeholder = "Type your message..." }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <div className="chat-container">
      <form onSubmit={handleSubmit} className="chat-input-wrapper">
        <input
          type="text"
          className="chat-input"
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" className="chat-send-button">
          ▸ Send
        </button>
      </form>
    </div>
  );
}
