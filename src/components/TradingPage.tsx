import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PriceChart from './PriceChart';
import MonkeyAnimation from './MonkeyAnimation';
import { CandleData, PredictionType } from '../types/trading';

interface PredictionLog {
  timestamp: number;
  prediction: PredictionType;
  result: 'UP' | 'DOWN';
  isCorrect: boolean;
}

const TradingPage: React.FC = () => {
  const navigate = useNavigate();
  const playerName = localStorage.getItem('playerName') || 'Trader';
  const [score, setScore] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 1200, height: 600 });
  const [upFillLevel, setUpFillLevel] = useState(0);
  const [downFillLevel, setDownFillLevel] = useState(0);
  const [currentCandle, setCurrentCandle] = useState<CandleData | null>(null);
  const [nextCandle, setNextCandle] = useState<CandleData | null>(null);
  const [currentPrediction, setCurrentPrediction] = useState<PredictionType>(null);
  const [canMakeNewPrediction, setCanMakeNewPrediction] = useState(true);
  const [predictionLogs, setPredictionLogs] = useState<PredictionLog[]>([]);
  const [correctPrediction, setCorrectPrediction] = useState(false);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setChartDimensions({ width: width - 32, height: 400 });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handlePrediction = (type: PredictionType) => {
    if (!canMakeNewPrediction) return;
    
    setCurrentPrediction(type);
    setCanMakeNewPrediction(false);
  };

  const checkPrediction = (candle: CandleData) => {
    if (!currentPrediction) return;

    const isUp = candle.close > candle.open;
    const result = isUp ? 'UP' : 'DOWN';
    const isCorrect = (currentPrediction === 'UP' && isUp) || (currentPrediction === 'DOWN' && !isUp);
    const increment = 10;

    // Устанавливаем флаг правильного предсказания
    setCorrectPrediction(isCorrect);
    
    // Сбрасываем флаг через короткое время
    setTimeout(() => {
      setCorrectPrediction(false);
    }, 100);

    // Добавляем лог
    setPredictionLogs(prev => [{
      timestamp: Date.now(),
      prediction: currentPrediction,
      result,
      isCorrect
    }, ...prev.slice(0, 9)]); // Храним только последние 10 логов

    if (isCorrect) {
      if (currentPrediction === 'UP') {
        setUpFillLevel(prev => Math.min(100, prev + increment));
      } else {
        setDownFillLevel(prev => Math.min(100, prev + increment));
      }
      setScore(prev => prev + 10);
    }

    setCurrentPrediction(null);
  };

  const handleCandleUpdate = (currentCandle: CandleData, nextCandle: CandleData | null) => {
    // Если есть предсказание, проверяем его на текущей свече
    if (currentPrediction && !canMakeNewPrediction) {
      checkPrediction(currentCandle);
    }

    setCurrentCandle(currentCandle);
    setNextCandle(nextCandle);
    setCanMakeNewPrediction(true);
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
              onCandleUpdate={handleCandleUpdate}
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
                disabled={!canMakeNewPrediction}
                className={`w-1/2 py-3 bg-gradient-to-r from-green-500 to-[#00f0ff] rounded-lg font-bold text-white 
                           ${canMakeNewPrediction 
                             ? 'shadow-[0_0_10px_rgba(0,240,255,0.3)] hover:shadow-[0_0_20px_rgba(0,240,255,0.5)]' 
                             : 'opacity-50 cursor-not-allowed'} 
                           transition-all`}
              >
                UP {currentPrediction === 'UP' && '✓'}
              </button>
              <button 
                onClick={() => handlePrediction('DOWN')}
                disabled={!canMakeNewPrediction}
                className={`w-1/2 py-3 bg-gradient-to-r from-[#ff1f8f] to-red-500 rounded-lg font-bold text-white 
                           ${canMakeNewPrediction 
                             ? 'shadow-[0_0_10px_rgba(255,31,143,0.3)] hover:shadow-[0_0_20px_rgba(255,31,143,0.5)]' 
                             : 'opacity-50 cursor-not-allowed'} 
                           transition-all`}
              >
                DOWN {currentPrediction === 'DOWN' && '✓'}
              </button>
            </div>

            {/* Области для сосудов */}
            <div className="flex gap-4 h-32">
              <div className="w-1/2 flex justify-center">
                <div
                  className="relative"
                  style={{
                    width: '60px',
                    height: '120px',
                    backgroundColor: 'transparent',
                    border: '2px solid #00f0ff',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    boxShadow: '0 0 10px rgba(0,240,255,0.3)'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: `${upFillLevel}%`,
                      backgroundColor: '#00f0ff',
                      transition: 'height 0.5s ease-out',
                      boxShadow: 'inset 0 0 10px rgba(255,255,255,0.5)',
                      opacity: 0.7
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: '#fff',
                      fontWeight: 'bold',
                      textShadow: '0 0 5px rgba(0,0,0,0.5)'
                    }}
                  >
                    {upFillLevel}%
                  </div>
                </div>
              </div>
              <div className="w-1/2 flex justify-center">
                <div
                  className="relative"
                  style={{
                    width: '60px',
                    height: '120px',
                    backgroundColor: 'transparent',
                    border: '2px solid #ff1f8f',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    boxShadow: '0 0 10px rgba(255,31,143,0.3)'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: `${downFillLevel}%`,
                      backgroundColor: '#ff1f8f',
                      transition: 'height 0.5s ease-out',
                      boxShadow: 'inset 0 0 10px rgba(255,255,255,0.5)',
                      opacity: 0.7
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: '#fff',
                      fontWeight: 'bold',
                      textShadow: '0 0 5px rgba(0,0,0,0.5)'
                    }}
                  >
                    {downFillLevel}%
                  </div>
                </div>
              </div>
            </div>

            {/* Prediction Logs */}
            <div className="mt-6 p-4 bg-[#2c1b4d] rounded-lg">
              <h4 className="text-[#00f0ff] text-sm mb-2">Prediction Logs</h4>
              
              {/* Current Prediction */}
              {currentPrediction && (
                <div className="text-sm p-2 mb-2 rounded bg-blue-900/30 text-blue-400">
                  <span className="font-mono">
                    {new Date().toLocaleTimeString()} →
                  </span>
                  {' '}
                  Current Prediction: <span className="font-bold">{currentPrediction}</span>
                  {' '}
                  (waiting for next candle...)
                </div>
              )}

              {/* Past Predictions */}
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {predictionLogs.map((log, index) => (
                  <div 
                    key={log.timestamp}
                    className={`text-sm p-2 rounded ${
                      log.isCorrect 
                        ? 'bg-green-900/30 text-green-400' 
                        : 'bg-red-900/30 text-red-400'
                    }`}
                  >
                    <span className="font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()} →
                    </span>
                    {' '}
                    Prediction: <span className="font-bold">{log.prediction}</span>
                    {' '}
                    Result: <span className="font-bold">{log.result}</span>
                    {' '}
                    {log.isCorrect ? '✓' : '✗'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monkey Animation */}
      <MonkeyAnimation onCorrectPrediction={correctPrediction} />
    </div>
  );
};

export default TradingPage; 