import React, { useState, useEffect } from 'react';

interface MonkeyAnimationProps {
  onCorrectPrediction?: boolean;
}

const MonkeyAnimation: React.FC<MonkeyAnimationProps> = ({ onCorrectPrediction }) => {
  const [bananas, setBananas] = useState<{ id: number; fallen: boolean }[]>([]);
  const [nextBananaId, setNextBananaId] = useState(0);

  useEffect(() => {
    if (onCorrectPrediction) {
      const newBanana = { id: nextBananaId, fallen: false };
      setBananas(prev => [...prev, newBanana]);
      setNextBananaId(prev => prev + 1);
      
      setTimeout(() => {
        setBananas(prev => 
          prev.map(b => b.id === newBanana.id ? { ...b, fallen: true } : b)
        );
      }, 500);
    }
  }, [onCorrectPrediction]);

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 mb-4">
      <div className="relative w-40 h-48">
        {/* Лиана */}
        <div 
          className="absolute left-1/2 top-0 w-2 h-full"
          style={{
            background: '#228B22',
            transform: 'translateX(-50%)',
            borderRadius: '2px'
          }}
        />

        {/* Мартышка */}
        <svg className="absolute top-8 left-1/2 transform -translate-x-1/2 translate-x-[1px]" width="100" height="120" viewBox="0 0 100 120">
          {/* Тело */}
          <path 
            d="M40,40 C30,40 25,50 25,60 C25,75 35,85 50,85 C65,85 75,75 75,60 C75,50 70,40 60,40 Z" 
            fill="#8B4513"
          />
          {/* Живот */}
          <ellipse 
            cx="50" 
            cy="65" 
            rx="15" 
            ry="12" 
            fill="#DEB887"
          />
          {/* Голова */}
          <circle 
            cx="50" 
            cy="35" 
            r="20" 
            fill="#8B4513"
          />
          {/* Мордочка */}
          <circle 
            cx="50" 
            cy="38" 
            r="15" 
            fill="#DEB887"
          />
          {/* Глаза */}
          <circle cx="43" cy="33" r="3" fill="black" />
          <circle cx="57" cy="33" r="3" fill="black" />
          {/* Нос */}
          <ellipse 
            cx="50" 
            cy="40" 
            rx="4" 
            ry="2" 
            fill="#4A2511"
          />
          {/* Уши */}
          <circle cx="35" cy="25" r="8" fill="#8B4513" />
          <circle cx="65" cy="25" r="8" fill="#8B4513" />
          {/* Руки */}
          <path 
            d="M25,45 C20,50 15,60 20,70" 
            stroke="#8B4513" 
            strokeWidth="8" 
            fill="none" 
            strokeLinecap="round"
          />
          <path 
            d="M75,45 C80,50 85,60 80,70" 
            stroke="#8B4513" 
            strokeWidth="8" 
            fill="none" 
            strokeLinecap="round"
          />
          {/* Ноги */}
          <path 
            d="M35,85 C30,90 30,100 35,105" 
            stroke="#8B4513" 
            strokeWidth="8" 
            fill="none" 
            strokeLinecap="round"
          />
          <path 
            d="M65,85 C70,90 70,100 65,105" 
            stroke="#8B4513" 
            strokeWidth="8" 
            fill="none" 
            strokeLinecap="round"
          />
        </svg>

        {/* Бананы */}
        {bananas.map(banana => (
          <div
            key={banana.id}
            className={`absolute left-1/2 ${banana.fallen ? '' : 'animate-dropBanana'}`}
            style={{
              transform: 'translateX(-50%)',
              bottom: banana.fallen ? '35px' : 'auto',
              top: banana.fallen ? 'auto' : '-20px',
              zIndex: banana.fallen ? 1 : 2
            }}
          >
            <svg width="30" height="15" viewBox="0 0 30 15">
              <path
                d="M2,7.5 C2,2 7,2 15,2 C23,2 28,2 28,7.5 C28,13 23,13 15,13 C7,13 2,13 2,7.5"
                fill="#FFE135"
                stroke="#E6B800"
                strokeWidth="1"
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonkeyAnimation; 