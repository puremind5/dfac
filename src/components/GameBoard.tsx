import React from 'react';

const CHEST_VALUES = [10, 20, 50, 100]; // Значения сундуков

const GameBoard: React.FC<{ onChestSelect: (index: number) => void; loading: boolean; gameActive: boolean }> = ({ onChestSelect, loading, gameActive }) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4 text-white">Выберите сундук с золотом</h2>

      <div className="grid grid-cols-4 gap-4 justify-center">
        {CHEST_VALUES.map((value, index) => (
          <button
            key={index}
            className="p-4 border-4 border-yellow-500 bg-yellow-300 hover:bg-yellow-400 text-yellow-900 font-bold text-lg rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
            onClick={() => onChestSelect(index + 1)} 
            disabled={!gameActive || loading} // 🔒 Отключаем кнопки после выбора
          >
            💰 {value} Gold
          </button>
        ))}
      </div>

      {loading && <p className="mt-4 text-gray-300">Открываем сундук...</p>}
    </div>
  );
};

export default GameBoard;
