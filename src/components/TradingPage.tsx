import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PriceChart from './PriceChart';

interface Prediction {
  type: 'UP' | 'DOWN';
  x: number;
}

const TradingPage: React.FC = () => {
  const navigate = useNavigate();
  const playerName = localStorage.getItem('playerName') || 'Trader';
  const [score, setScore] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 1200, height: 600 });
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const upAreaRef = useRef<HTMLDivElement>(null);
  const downAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setChartDimensions({ width: width - 32, height: 400 }); // 32px для паддингов
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handlePrediction = (type: 'UP' | 'DOWN') => {
    const areaRef = type === 'UP' ? upAreaRef : downAreaRef;
    if (areaRef.current) {
      const area = areaRef.current;
      const x = Math.random() * (area.offsetWidth - 10); // 10px - диаметр кружка
      setPredictions(prev => [...prev, { type, x }]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#1a0b2e]/90 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="cyberpunk-border p-4">
          <h2 className="neon-text text-xl">
            Welcome, {playerName}
          </h2>
        </div>
        <div className="cyberpunk-border p-4">
          <h2 className="neon-text text-xl">
            Score: {score}
          </h2>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="neon-button text-sm"
        >
          EXIT
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Container */}
        <div ref={containerRef} className="lg:col-span-2 cyberpunk-border p-4">
          <h3 className="neon-text text-lg mb-4">Price Chart</h3>
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <PriceChart 
              containerWidth={chartDimensions.width} 
              containerHeight={chartDimensions.height} 
            />
          </div>
        </div>  

        {/* Trading Controls */}
        <div className="cyberpunk-border p-4">
          <h3 className="neon-text text-lg mb-4">Make Your Prediction</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <button 
                onClick={() => handlePrediction('UP')}
                className="w-1/2 py-3 bg-gradient-to-r from-green-500 to-[#00f0ff] rounded-lg font-bold text-white shadow-[0_0_10px_rgba(0,240,255,0.3)]
                           hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-shadow"
              >
                UP
              </button>
              <button 
                onClick={() => handlePrediction('DOWN')}
                className="w-1/2 py-3 bg-gradient-to-r from-[#ff1f8f] to-red-500 rounded-lg font-bold text-white shadow-[0_0_10px_rgba(255,31,143,0.3)]
                           hover:shadow-[0_0_20px_rgba(255,31,143,0.5)] transition-shadow"
              >
                DOWN
              </button>
            </div>

            {/* Области для кружочков */}
            <div className="flex gap-4 h-20">
              <div 
                ref={upAreaRef}
                className="w-1/2 border-2 border-[#00f0ff] rounded-lg relative"
                style={{ minHeight: '50px' }}
              >
                {predictions
                  .filter(p => p.type === 'UP')
                  .map((prediction, index) => (
                    <div
                      key={index}
                      className="absolute bottom-1"
                      style={{
                        left: `${prediction.x}px`,
                        width: '5mm',
                        height: '5mm',
                        backgroundColor: '#00f0ff',
                        borderRadius: '50%',
                        boxShadow: '0 0 10px rgba(0,240,255,0.5)'
                      }}
                    />
                  ))}
              </div>
              <div 
                ref={downAreaRef}
                className="w-1/2 border-2 border-[#ff1f8f] rounded-lg relative"
                style={{ minHeight: '50px' }}
              >
                {predictions
                  .filter(p => p.type === 'DOWN')
                  .map((prediction, index) => (
                    <div
                      key={index}
                      className="absolute bottom-1"
                      style={{
                        left: `${prediction.x}px`,
                        width: '5mm',
                        height: '5mm',
                        backgroundColor: '#ff1f8f',
                        borderRadius: '50%',
                        boxShadow: '0 0 10px rgba(255,31,143,0.5)'
                      }}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingPage; 