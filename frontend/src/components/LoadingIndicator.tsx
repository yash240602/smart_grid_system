import React, { useState, useEffect } from 'react';
import './LoadingIndicator.css';

interface LoadingIndicatorProps {
  message?: string;
}

// Array of loading messages to display randomly
const loadingMessages = [
  "⚡ Powering up the grid...",
  "💻 Crunching the numbers...",
  "📊 Analyzing voltage patterns...",
  "🔌 Connecting to virtual substations...",
  "🔍 Scanning for anomalies...",
  "🧮 Computing optimal paths...",
  "🌐 Bootstrapping network...",
  "🔄 Syncing data streams...",
  "🧠 Initializing AI modules...",
  "🔋 Charging virtual batteries..."
];

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message }) => {
  const [currentMessage, setCurrentMessage] = useState(message || loadingMessages[0]);

  useEffect(() => {
    if (!message) {
      // Change message every 2 seconds if no specific message was provided
      const intervalId = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * loadingMessages.length);
        setCurrentMessage(loadingMessages[randomIndex]);
      }, 2000);

      return () => clearInterval(intervalId);
    }
  }, [message]);

  return (
    <div className="loading-indicator-container heavy-component">
      <div className="spinner animation-hardware"></div>
      <p className="loading-message">{currentMessage}</p>
    </div>
  );
};

export default LoadingIndicator; 