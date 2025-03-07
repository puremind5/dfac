import React from 'react';

interface PlayersProps {
  results: any;
  timeLeft: number;
  gameActive: boolean;
  playersMadeChoice: Record<string, boolean>;
}

const Players: React.FC<PlayersProps> = ({ results, timeLeft, gameActive, playersMadeChoice }) => {
  const getPlayerResult = (playerName: string) => {
    if (!results) return null;
    if (results.winner === playerName) return 'win';
    if (results.winner !== "No winner") return 'lose';
    return null;
  };

  const getChestValue = (chestNumber: number) => {
    const values = { 1: 35, 2: 50, 3: 70, 4: 100 };
    return values[chestNumber as keyof typeof values];
  };

  return (
    <div className="mt-8">
      <div className="grid grid-cols-4 gap-4">
        {/* Игрок */}
        <div className="flex flex-col items-center">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg flex items-center justify-center transform transition-all duration-300 
            ${playersMadeChoice['You'] ? 'scale-105' : ''}
            ${getPlayerResult('You') === 'win' ? 'ring-4 ring-green-500 animate-pulse' : ''}
            ${getPlayerResult('You') === 'lose' ? 'ring-4 ring-red-500' : ''}
            ${!getPlayerResult('You') ? 'ring-2 ring-gray-300' : ''}`}>
            <span className="text-xl font-bold text-white">1</span>
          </div>
          <span className="mt-2 text-sm font-semibold text-gray-700">Вы</span>
          {results && (
            <span className="text-xs text-gray-500 mt-1">
              Выбрал {getChestValue(results.playerChoice)} Gold
            </span>
          )}
        </div>

        {/* Боты */}
        {[1, 2, 3].map((botNumber) => {
          const botName = `Bot ${botNumber}`;
          return (
            <div key={botNumber} className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg flex items-center justify-center transform transition-all duration-300 
                ${playersMadeChoice[botName] ? 'scale-105' : ''}
                ${getPlayerResult(botName) === 'win' ? 'ring-4 ring-green-500 animate-pulse' : ''}
                ${getPlayerResult(botName) === 'lose' ? 'ring-4 ring-red-500' : ''}
                ${!getPlayerResult(botName) ? 'ring-2 ring-gray-300' : ''}`}>
                <span className="text-xl font-bold text-white">{botNumber + 1}</span>
              </div>
              <span className="mt-2 text-sm font-semibold text-gray-700">Бот {botNumber}</span>
              {results && (
                <span className="text-xs text-gray-500 mt-1">
                  Выбрал {getChestValue(results.botChoices[botNumber - 1])} Gold
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Players; 