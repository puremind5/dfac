import React, { useState, useEffect } from 'react';

interface PlayersProps {
  results: any;
  timeLeft: number;
  gameActive: boolean;
  playersMadeChoice: Record<string, boolean>;
  setPlayersMadeChoice: (value: Record<string, boolean>) => void;
}

const CHEST_VALUES = { 1: 35, 2: 50, 3: 70, 4: 100 };

const Players: React.FC<PlayersProps> = ({ 
  results, 
  timeLeft, 
  gameActive, 
  playersMadeChoice,
  setPlayersMadeChoice 
}) => {
  const [botChoices, setBotChoices] = useState<Record<string, boolean>>({
    'Bot 1': false,
    'Bot 2': false,
    'Bot 3': false
  });

  // Сброс состояний при начале нового раунда
  useEffect(() => {
    if (gameActive) {
      setBotChoices({
        'Bot 1': false,
        'Bot 2': false,
        'Bot 3': false
      });
      setPlayersMadeChoice({
        'You': false,
        'Bot 1': false,
        'Bot 2': false,
        'Bot 3': false
      });

      // Боты делают выбор в случайное время в течение таймера
      ['Bot 1', 'Bot 2', 'Bot 3'].forEach(bot => {
        // Случайная задержка от 1 до 8 секунд
        const delay = 1000 + Math.random() * 4000;
        setTimeout(() => {
          setBotChoices(prev => ({
            ...prev,
            [bot]: true
          }));
          setPlayersMadeChoice(prev => ({
            ...prev,
            [bot]: true
          }));
        }, delay);
      });
    }
  }, [gameActive, setPlayersMadeChoice]);

  const getPlayerResult = (playerName: string) => {
    if (!results) return null;
    if (results.winner === playerName) return 'win';
    if (results.winner !== "No winner") return 'lose';
    return 'draw';
  };

  return (
    <div className="mt-8 grid grid-cols-4 gap-4 items-center justify-center">
      {/* Игрок */}
      <div className="text-center">
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center 
          ${!gameActive ? (
            getPlayerResult('You') === 'win' ? 'bg-green-500 ring-4 ring-green-400 ring-pulse' :
            getPlayerResult('You') === 'lose' ? 'bg-gray-300 ring-4 ring-red-500' :
            'bg-gray-300 ring-2 ring-gray-400'
          ) : (
            playersMadeChoice['You'] ? 'bg-gray-300' : 'bg-blue-500'
          )}
          transition-all duration-300`}>
          <span className="text-xl font-bold text-white">1</span>
        </div>
        <p className="mt-2 font-bold">Вы</p>
        {results && (
          <p className="text-xs text-gray-500 mt-1">
            выбрал {CHEST_VALUES[results.playerChoice]} Gold
          </p>
        )}
      </div>

      {/* Боты */}
      {['Bot 1', 'Bot 2', 'Bot 3'].map((bot, index) => (
        <div key={bot} className="text-center">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600
            ${!gameActive ? (
              getPlayerResult(bot) === 'win' ? 'ring-4 ring-green-400 ring-pulse' :
              getPlayerResult(bot) === 'lose' ? 'ring-4 ring-red-500 opacity-50' :
              'ring-2 ring-gray-400 opacity-50'
            ) : (
              botChoices[bot] ? 'opacity-50' : ''
            )}
            transition-all duration-300`}>
            <span className="text-xl font-bold text-white">{index + 2}</span>
          </div>
          <p className="mt-2 font-bold">Бот {index + 1}</p>
          {results && (
            <p className="text-xs text-gray-500 mt-1">
              выбрал {CHEST_VALUES[results.botChoices[index]]} Gold
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default Players;