import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PriceChart from './PriceChart';
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
  const [points, setPoints] = useState(25); // Начальная ставка
  const [score, setScore] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 1200, height: 600 });
  const [successStreak, setSuccessStreak] = useState(0); // Положительное значение - успехи, отрицательное - неудачи
  const [currentCandle, setCurrentCandle] = useState<CandleData | null>(null);
  const [nextCandle, setNextCandle] = useState<CandleData | null>(null);
  const [currentPrediction, setCurrentPrediction] = useState<PredictionType>(null);
  const [canMakeNewPrediction, setCanMakeNewPrediction] = useState(true);
  const [predictionLogs, setPredictionLogs] = useState<PredictionLog[]>([]);
  const [gameOver, setGameOver] = useState(false);

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
    if (!canMakeNewPrediction || gameOver || points === 0) return;
    
    setCurrentPrediction(type);
    setCanMakeNewPrediction(false);
  };

  const checkPrediction = (candle: CandleData) => {
    if (!currentPrediction) return;

    const isUp = candle.close > candle.open;
    const result = isUp ? 'UP' : 'DOWN';
    const isCorrect = (currentPrediction === 'UP' && isUp) || (currentPrediction === 'DOWN' && !isUp);

    // Обновляем полоску прогресса
    setSuccessStreak(prev => {
      const newStreak = isCorrect ? Math.min(prev + 1, 10) : Math.max(prev - 1, -10);
      
      // Проверяем условие окончания игры
      if (Math.abs(newStreak) === 10) {
        setGameOver(true);
      }
      
      return newStreak;
    });

    // Обновляем очки
    if (isCorrect) {
      setPoints(prev => prev + 5);
      setScore(prev => prev + 10);
    } else {
      setPoints(prev => Math.max(0, prev - 5));
    }

    // Добавляем лог
    setPredictionLogs(prev => [{
      timestamp: Date.now(),
      prediction: currentPrediction,
      result,
      isCorrect
    }, ...prev.slice(0, 9)]);

    setCurrentPrediction(null);
  };

  const handleCandleUpdate = (currentCandle: CandleData, nextCandle: CandleData | null) => {
    if (currentPrediction && !canMakeNewPrediction) {
      checkPrediction(currentCandle);
    }

    setCurrentCandle(currentCandle);
    setNextCandle(nextCandle);
    setCanMakeNewPrediction(true);
  };

  // Вычисляем ширину и цвет полосок прогресса
  const progressWidth = Math.abs(successStreak) * 10; // 10% за каждое предсказание
  const isPositive = successStreak >= 0;

  // Добавляем модальное окно для окончания игры
  useEffect(() => {
    if (gameOver || points === 0) {
      const timeout = setTimeout(() => {
        const message = gameOver 
          ? `Игра окончена! ${successStreak > 0 ? 'Вы выиграли!' : 'Вы проиграли!'}`
          : 'У вас закончились очки!';
        alert(`${message}\nИтоговый счет: ${score}\nОчки: ${points}`);
        navigate('/');
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [gameOver, points, score, successStreak, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#1a0b2e]/90 p-2 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 sm:mb-8">
        <div className="cyberpunk-border p-2 sm:p-4 w-full sm:w-auto">
          <h2 className="neon-text text-lg sm:text-xl text-center sm:text-left">
            Welcome, {playerName}
          </h2>
        </div>
        <div className="flex gap-2 sm:gap-4 w-full sm:w-auto justify-center">
          <div className="cyberpunk-border p-2 sm:p-4 flex-1 sm:flex-auto">
            <h2 className="neon-text text-base sm:text-xl text-center">
              Points: {points}
            </h2>
          </div>
          <div className="cyberpunk-border p-2 sm:p-4 flex-1 sm:flex-auto">
            <h2 className="neon-text text-base sm:text-xl text-center">
              Score: {score}
            </h2>
          </div>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="neon-button text-sm w-full sm:w-auto"
        >
          EXIT
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Chart Container */}
        <div ref={containerRef} className="lg:col-span-2 cyberpunk-border p-2 sm:p-4">
          <h3 className="neon-text text-base sm:text-lg mb-2 sm:mb-4">Price Chart</h3>
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <PriceChart 
              containerWidth={chartDimensions.width} 
              containerHeight={window.innerWidth < 640 ? 300 : chartDimensions.height}
              onCandleUpdate={handleCandleUpdate}
            />
          </div>
        </div>  

        {/* Trading Controls */}
        <div className="cyberpunk-border p-2 sm:p-4">
          <h3 className="neon-text text-base sm:text-lg mb-2 sm:mb-4">Make Your Prediction</h3>
          <div className="space-y-2 sm:space-y-4">
            <div className="flex gap-2 sm:gap-4">
              <button 
                onClick={() => handlePrediction('UP')}
                disabled={!canMakeNewPrediction}
                className={`w-1/2 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-green-500 to-[#00f0ff] rounded-lg font-bold text-white 
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
                className={`w-1/2 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-[#ff1f8f] to-red-500 rounded-lg font-bold text-white 
                           ${canMakeNewPrediction 
                             ? 'shadow-[0_0_10px_rgba(255,31,143,0.3)] hover:shadow-[0_0_20px_rgba(255,31,143,0.5)]' 
                             : 'opacity-50 cursor-not-allowed'} 
                           transition-all`}
              >
                DOWN {currentPrediction === 'DOWN' && '✓'}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 sm:mt-6">
              <div className="relative h-6 sm:h-8 bg-gray-800 rounded-lg overflow-hidden">
                {/* Центральная линия */}
                <div className="absolute top-0 left-1/2 w-[2px] h-full bg-gray-600"></div>
                
                {/* Полоска прогресса */}
                <div 
                  className={`absolute top-0 h-full transition-all duration-500 ${
                    isPositive ? 'left-1/2 bg-green-500' : 'right-1/2 bg-red-500'
                  }`}
                  style={{ 
                    width: `${progressWidth}%`,
                    boxShadow: `0 0 20px ${isPositive ? '#00ff00' : '#ff0000'}`
                  }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs sm:text-sm">
                <span className="text-red-400">Losses</span>
                <span className="text-green-400">Wins</span>
              </div>
            </div>

            {/* Prediction Logs */}
            <div className="mt-3 sm:mt-6 p-2 sm:p-4 bg-[#2c1b4d] rounded-lg">
              <h4 className="text-[#00f0ff] text-xs sm:text-sm mb-2">Prediction Logs</h4>
              
              {/* Current Prediction */}
              {currentPrediction && (
                <div className="text-xs sm:text-sm p-2 mb-2 rounded bg-blue-900/30 text-blue-400">
                  <span className="font-mono">
                    {new Date().toLocaleTimeString()} →
                  </span>
                  {' '}
                  Current: <span className="font-bold">{currentPrediction}</span>
                </div>
              )}

              {/* Past Predictions */}
              <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                {predictionLogs.map((log, index) => (
                  <div 
                    key={log.timestamp}
                    className={`text-xs sm:text-sm p-2 rounded ${
                      log.isCorrect 
                        ? 'bg-green-900/30 text-green-400' 
                        : 'bg-red-900/30 text-red-400'
                    }`}
                  >
                    <span className="font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()} →
                    </span>
                    {' '}
                    {log.prediction} → {log.result} {log.isCorrect ? '✓' : '✗'}
                  </div>
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