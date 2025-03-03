import React from 'react';
import { Trash as Treasure, Trophy, RefreshCw, User, Bot } from 'lucide-react';

interface ResultsPanelProps {
  results: {
    players: Array<{
      name: string;
      choice: number;
    }>;
    chestValues: number[];
    winner: number;
    score: number;
    validChests: Record<string, number>;
  };
  onNewRound: () => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ results, onNewRound }) => {
  if (!results) return null;
  
  const { players, chestValues, winner, score, validChests } = results;
  
  const isValidChoice = (playerIndex: number) => {
    return Object.keys(validChests).includes(playerIndex.toString());
  };
  
  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-6">Round Results</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {chestValues.map((value, index) => (
          <div 
            key={index}
            className="bg-gradient-to-b from-amber-700 to-amber-900 rounded-lg p-4 text-center"
          >
            <Treasure className="h-12 w-12 mx-auto text-yellow-400 mb-2" />
            <div className="bg-amber-800 w-full h-2 rounded-full mt-1"></div>
            <div className="mt-3 font-bold text-white">Chest {index + 1}</div>
            <div className="text-yellow-300 font-bold text-xl">{value} points</div>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Player Choices:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {players.map((player, index) => {
            const isWinner = index === winner;
            const isValid = isValidChoice(index);
            
            return (
              <div 
                key={index}
                className={`
                  flex items-center p-3 rounded-lg
                  ${isWinner ? 'bg-green-100 border border-green-300' : 
                    isValid ? 'bg-blue-50 border border-blue-200' : 
                    'bg-gray-100 border border-gray-200'}
                `}
              >
                {player.name === 'You' ? (
                  <User className={`h-6 w-6 ${isWinner ? 'text-green-600' : 'text-blue-600'} mr-2`} />
                ) : (
                  <Bot className={`h-6 w-6 ${isWinner ? 'text-green-600' : 'text-gray-600'} mr-2`} />
                )}
                <div className="flex-1">
                  <div className="font-medium">{player.name}</div>
                  <div className="text-sm text-gray-600">
                    Selected chest {player.choice + 1} ({chestValues[player.choice]} points)
                  </div>
                </div>
                {isWinner && (
                  <Trophy className="h-6 w-6 text-yellow-500" />
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="bg-amber-50 p-6 rounded-lg border border-amber-200 mb-6 text-center">
        {winner === 0 ? (
          <>
            <Trophy className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
            <h3 className="text-xl font-bold text-amber-800">You won!</h3>
            <p className="text-amber-700">You get {score} points</p>
          </>
        ) : winner !== -1 ? (
          <>
            <h3 className="text-xl font-bold text-amber-800">{players[winner].name} won!</h3>
            <p className="text-amber-700">You don't get any points this round</p>
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold text-amber-800">It's a tie!</h3>
            <p className="text-amber-700">No one gets points this round</p>
          </>
        )}
      </div>
      
      <button
        onClick={onNewRound}
        className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold py-3 px-6 rounded-lg shadow hover:shadow-lg flex items-center justify-center mx-auto"
      >
        <RefreshCw className="h-5 w-5 mr-2" />
        Start New Round
      </button>
    </div>
  );
};

export default ResultsPanel;