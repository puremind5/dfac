import React from 'react';
import '../App.css'; // Импортируем стили

export const CHEST_VALUES = {
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
  activePlayer: 'You' | 'Игрок2';
  timeLeft: number;
  resultsReady: boolean;
}

const GameBoard2: React.FC<GameBoard2Props> = ({ 
  onChestSelect, 
  loading, 
  gameActive,
  selectedChest,
  playersMadeChoice,
  activePlayer,
  timeLeft,
  resultsReady
}) => {
  const handleChestClick = (chestNumber: number) => {
    if (!loading && gameActive) {
      onChestSelect(chestNumber);
    }
  };

  const isButtonDisabled = (chestNumber: number): boolean => {
    // Кнопка должна быть неактивна если:
    // 1. Игра неактивна
    // 2. Идет загрузка
    // 3. Текущий активный игрок уже сделал выбор
    return !gameActive || loading || playersMadeChoice[activePlayer];
  };

  return (
    <div className="text-center relative z-10">
      <div className="flex flex-col items-center justify-center gap-2 mb-6">
        <h2 className="text-2xl font-bold text-black">Выберите сундук</h2>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full ${activePlayer === 'You' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
            Игрок 1 (Вы)
          </span>
          <span className={`px-3 py-1 rounded-full ${activePlayer === 'Игрок2' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
            Игрок 2
          </span>
        </div>
        <div className="flex items-center justify-center my-2">
          <span className="text-lg font-bold text-purple-600">
            Ход: {activePlayer === 'You' ? 'Вы' : 'Игрок 2'} 
            <span className="ml-2 text-blue-600">⏱️ {timeLeft}с</span>
          </span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 justify-center chests-container">
        {[1, 2, 3, 4].map((chestNumber) => (
          <button
            key={chestNumber}
            onClick={() => handleChestClick(chestNumber)}
            disabled={isButtonDisabled(chestNumber)}
            className={`
              relative z-20
              p-4 border-4 border-yellow-500 bg-yellow-300 
              text-yellow-900 font-bold text-lg rounded-xl 
              shadow-lg transition-all duration-300 transform 
              ${selectedChest === chestNumber ? 'chest-selected' : ''}
              ${selectedChest !== null && selectedChest !== chestNumber ? 'chest-not-selected' : ''}
              ${isButtonDisabled(chestNumber) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
            `}
            id={`chest-${chestNumber}`}
          >
            💰 {CHEST_VALUES[chestNumber]} Gold
          </button>
        ))}
      </div>
      {loading && <p className="mt-4 text-gray-300">Открываем сундук...</p>}
      {activePlayer === 'You' && playersMadeChoice['You'] && (
        <p className="mt-4 text-green-600 font-bold">Вы сделали выбор. Ход переходит к Игроку 2.</p>
      )}
      {activePlayer === 'Игрок2' && playersMadeChoice['Игрок2'] && (
        <p className="mt-4 text-green-600 font-bold">Игрок 2 сделал выбор. Раунд завершается...</p>
      )}
    </div>
  );
};

export default GameBoard2;