import React from 'react';

const CHEST_VALUES = [10, 20, 50, 100]; // Значения сундуков

const GameBoard: React.FC<{ onChestSelect: (index: number) => void; loading: boolean }> = ({ onChestSelect, loading }) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4 text-white">Выберите сундук с золотом</h2>

      {/* Описание правил игры */}
      <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg mb-4">
        <h3 className="text-lg font-bold mb-2">Как играть:</h3>
        <ul className="text-sm space-y-1">
          <li>• Вы играете против 3 ботов</li>
          <li>• В каждом сундуке разное количество золота: 10, 20, 50 или 100 монет</li>
          <li>• Если только вы выбрали самый ценный сундук, вы получаете золото</li>
          <li>• Если несколько игроков выбрали один и тот же сундук, никто не получает золото</li>
        </ul>
      </div>

      {/* Сундуки с ценностью */}
      <div className="grid grid-cols-4 gap-4 justify-center">
        {CHEST_VALUES.map((value, index) => (
          <button
            key={index}
            className="p-4 border-4 border-yellow-500 bg-yellow-300 hover:bg-yellow-400 text-yellow-900 font-bold text-lg rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
            onClick={() => onChestSelect(index + 1)} // Сундуки от 1 до 4
            disabled={loading}
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
