import React from 'react';
import { Trash as Treasure } from 'lucide-react';

interface GameBoardProps {
  onChestSelect: (index: number) => void;
  loading: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ onChestSelect, loading }) => {
  const chests = [0, 1, 2, 3];
  
  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-6">Choose a Chest</h2>
      <p className="text-gray-600 mb-8">
        Select one of the four chests. Each chest contains a different amount of points.
        You'll only get points if you choose the most valuable chest that no one else selected.
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {chests.map((index) => (
          <button
            key={index}
            onClick={() => onChestSelect(index)}
            disabled={loading}
            className={`
              relative bg-gradient-to-b from-amber-700 to-amber-900 
              rounded-lg p-6 flex flex-col items-center justify-center
              transition-transform transform hover:scale-105 hover:shadow-lg
              ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <Treasure className="h-16 w-16 text-yellow-400 mb-2" />
            <div className="bg-amber-800 w-full h-2 rounded-full mt-2"></div>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-3 bg-amber-950 rounded-t-lg"></div>
            <span className="mt-4 font-bold text-white">Chest {index + 1}</span>
          </button>
        ))}
      </div>
      
      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      )}
      
      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mt-4">
        <h3 className="font-semibold text-amber-800 mb-2">Game Rules:</h3>
        <ul className="text-left text-sm text-amber-700 space-y-1">
          <li>• You play against 3 bots</li>
          <li>• Each chest has a different value: 10, 20, 50, or 100 points</li>
          <li>• If only you choose the most valuable chest, you get the points</li>
          <li>• If multiple players choose the same chest, no one gets points for it</li>
        </ul>
      </div>
    </div>
  );
};

export default GameBoard;