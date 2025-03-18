import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    // Save player name to localStorage or state management
    localStorage.setItem('playerName', playerName.trim());
    navigate('/trading');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8">
      <div className="cyberpunk-border p-8 animate-pulse">
        {/* Logo Container */}
        <div className="w-64 h-64 relative">
          <img 
            src={logo} 
            alt="Den Factory Logo" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Name Input Container */}
      <div className="w-64 space-y-2">
        <input
          type="text"
          value={playerName}
          onChange={(e) => {
            setPlayerName(e.target.value);
            setError('');
          }}
          placeholder="Enter your name"
          className="w-full px-4 py-2 bg-transparent border-2 border-[#00f0ff] rounded-lg 
                     text-white placeholder-[#00f0ff]/50 focus:border-[#ff1f8f] 
                     focus:outline-none transition-colors duration-300
                     shadow-[0_0_10px_rgba(0,240,255,0.3)]
                     focus:shadow-[0_0_15px_rgba(255,31,143,0.5)]"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
        />
        {error && (
          <p className="text-[#ff1f8f] text-sm text-center animate-pulse">
            {error}
          </p>
        )}
      </div>

      <button 
        onClick={handleSubmit}
        className="neon-button text-xl"
      >
        ENTER
      </button>
    </div>
  );
};

export default WelcomePage; 