import React from 'react';

const CHEST_VALUES = [10, 20, 50, 100]; // Ценности сундуков (исправлено 40 → 50)

const GameBoard = ({ onChestSelect, loading }) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4 text-white">Choose a Treasure Chest</h2>

      {/* Описание правил игры */}
      <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg mb-4">
        <h3 className="text-lg font-bold mb-2">How to Play:</h3>
        <ul className="text-sm space-y-1">
          <li>• You play against 3 bots</li>
          <li>• Each chest has a different value: 10, 20, 50, or 100 points</li>
          <li>• If only you choose the most valuable chest, you get the points</li>
          <li>• If multiple players choose the same chest, no one gets points for it</li>
        </ul>
      </div>

      {/* Сундуки с ценностью */}
      <div className="grid grid-cols-4 gap-4 justify-center">
        {CHEST_VALUES.map((value, index) => (
          <button
            key={index}
            className="p-4 border-4 border-yellow-500 bg-yellow-300 hover:bg-yellow-400 text-yellow-900 font-bold text-lg rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
            onClick={() => onChestSelect(index)}
            disabled={loading}
          >
            💰 {value} Gold
          </button>
        ))}
      </div>

      {loading && <p className="mt-4 text-gray-300">Opening chest...</p>}
    </div>
  );
};

export default GameBoard;
