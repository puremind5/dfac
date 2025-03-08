import React, { useState, useEffect } from 'react';
import '../App.css'; // Импортируем стили

const CHEST_VALUES = {
  1: 35,
  2: 50,
  3: 70,
  4: 100
};

interface GameBoard2Props {
  onChestSelect: (chestIndex: number) => void;
  loading: boolean;
  gameActive: boolean;
  selectedChest: number | null;
  playersMadeChoice: Record<string, boolean>;
  resultsReady: boolean;
}

const GameBoard2: React.FC<GameBoard2Props> = ({ 
  onChestSelect, 
  loading, 
  gameActive,
  selectedChest,
  playersMadeChoice,
  resultsReady
}) => {
  const [timeLeft, setTimeLeft] = useState(7);

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
      setTimeLeft(7);
    }
  }, [gameActive]);

  const handleChestClick = (chestNumber: number) => {
    if (!loading && gameActive) {
      onChestSelect(chestNumber);
    }
  };

  return (
    <div className="text-center relative z-10">
      <div className="flex items-center justify-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-black">Выберите сундук</h2>
        {gameActive && <span className="text-xl font-bold text-blue-600">⏱️ {timeLeft}с</span>}
      </div>
      <div className="grid grid-cols-4 gap-4 justify-center chests-container">
        {[1, 2, 3, 4].map((chestNumber) => (
          <button
            key={chestNumber}
            onClick={() => handleChestClick(chestNumber)}
            disabled={loading || !gameActive || selectedChest !== null}
            className={`
              relative z-20
              p-4 border-4 border-yellow-500 bg-yellow-300 
              text-yellow-900 font-bold text-lg rounded-xl 
              shadow-lg transition-all duration-300 transform 
              ${selectedChest === chestNumber ? 'chest-selected' : ''}
              ${selectedChest !== null && selectedChest !== chestNumber ? 'chest-not-selected' : ''}
              ${(loading || !gameActive) && !selectedChest ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            id={`chest-${chestNumber}`}
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