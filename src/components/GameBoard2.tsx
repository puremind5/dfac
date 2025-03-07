import React, { useState, useEffect } from 'react';
import '../App.css'; // Импортируем стили

interface GameBoard2Props {
  onChestSelect: (chestIndex: number) => void;
  loading: boolean;
  gameActive: boolean;
  selectedChest: number | null;
}

const CHEST_VALUES = { 1: 35, 2: 50, 3: 70, 4: 100 };

const GameBoard2: React.FC<GameBoard2Props> = ({ 
  onChestSelect, 
  loading, 
  gameActive,
  selectedChest
}) => {
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameActive, timeLeft]);

  // Сброс таймера при начале нового раунда
  useEffect(() => {
    if (gameActive) {
      setTimeLeft(10);
    }
  }, [gameActive]);

  const handleChestClick = (chestNumber: number) => {
    if (!loading && gameActive) {
      onChestSelect(chestNumber);
    }
  };

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-black">Выберите сундук</h2>
        <span className="text-xl font-bold text-blue-600">⏱️ {timeLeft}с</span>
      </div>
      <div className="grid grid-cols-4 gap-4 justify-center">
        {[1, 2, 3, 4].map((chestNumber) => (
          <button
            key={chestNumber}
            onClick={() => handleChestClick(chestNumber)}
            disabled={loading || !gameActive || selectedChest !== null}
            className={`
              p-4 border-4 border-yellow-500 bg-yellow-300 
              text-yellow-900 font-bold text-lg rounded-xl 
              shadow-lg transition-all duration-300 transform 
              ${selectedChest === chestNumber ? 'chest-selected' : ''}
              ${selectedChest !== null && selectedChest !== chestNumber ? 'chest-not-selected' : ''}
              ${(loading || !gameActive) && !selectedChest ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            💰 {CHEST_VALUES[chestNumber]} Gold
          </button>
        ))}
      </div>
      {loading && <p className="mt-4 text-gray-300">Открываем сундук...</p>}
    </div>
  );
};

export default GameBoard2;