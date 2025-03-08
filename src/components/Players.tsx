import React, { useState, useEffect } from 'react';
import '../App.css'; // Импортируем стили

interface PlayersProps {
  results: any;
  timeLeft: number;
  gameActive: boolean;
  playersMadeChoice: Record<string, boolean>;
  setPlayersMadeChoice: (value: Record<string, boolean>) => void;
  visiblePlayers?: string[]; // Список имен игроков, которые должны быть видимы
}

const CHEST_VALUES = { 1: 35, 2: 50, 3: 70, 4: 100 };
// Имена ботов
const BOT_NAMES = ['Алиса', 'Олег', 'Сири'];

const Players: React.FC<PlayersProps> = ({ 
  results, 
  timeLeft, 
  gameActive, 
  playersMadeChoice,
  setPlayersMadeChoice,
  visiblePlayers
}) => {
  const [botChoices, setBotChoices] = useState<Record<string, boolean>>({
    'Алиса': false,
    'Олег': false,
    'Сири': false
  });
  
  // Сброс состояний при начале нового раунда
  useEffect(() => {
    if (gameActive) {
      setBotChoices({
        'Алиса': false,
        'Олег': false,
        'Сири': false
      });
      setPlayersMadeChoice({
        'You': false,
        'Алиса': false,
        'Олег': false,
        'Сири': false
      });

      // Боты делают выбор в случайное время в течение таймера
      BOT_NAMES.forEach(bot => {
        // Случайная задержка от 1 до 5 секунд
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

  // Во время активной игры показываем обычную сетку
  const renderPlayersGrid = () => (
    <div className="mt-8 grid grid-cols-4 gap-4 items-center justify-center">
      {/* Игрок */}
      <div className="text-center player-container">
        <div className={`player-circle w-16 h-16 mx-auto rounded-full flex items-center justify-center 
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
      </div>

      {/* Боты */}
      {BOT_NAMES.map((bot, index) => (
        <div key={bot} className="text-center player-container">
          <div className={`player-circle w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600
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
          <p className="mt-2 font-bold">{bot}</p>
        </div>
      ))}
    </div>
  );

  // Когда игра неактивна и есть результаты, отображаем игроков под сундуками
  const renderPlayersUnderChests = () => {
    if (!results) return null;
    
    // Группируем игроков по выбранным сундукам
    const chestSelections = {
      1: [] as any[],
      2: [] as any[],
      3: [] as any[],
      4: [] as any[]
    };
    
    // Добавляем игрока, если он должен быть видим
    if (!visiblePlayers || visiblePlayers.includes('You')) {
      chestSelections[results.playerChoice].push({
        name: 'You',
        displayName: 'Вы',
        number: 1,
        isWinner: results.winner === 'You',
        isLoser: results.winner !== 'No winner' && results.winner !== 'You',
        isPlayer: true
      });
    }
    
    // Добавляем ботов, если они должны быть видимы
    results.botChoices.forEach((choice: number, index: number) => {
      const botName = BOT_NAMES[index];
      if (!visiblePlayers || visiblePlayers.includes(botName)) {
        chestSelections[choice].push({
          name: botName,
          displayName: botName,
          number: index + 2,
          isWinner: results.winner === botName,
          isLoser: results.winner !== 'No winner' && results.winner !== botName,
          isPlayer: false
        });
      }
    });
    
    return (
      <div className="results-container">
        {/* Отображаем группы игроков для каждого сундука */}
        {[1, 2, 3, 4].map(chestNumber => (
          <div key={chestNumber} className={`chest-result-group chest-group-${chestNumber}`}>
            {chestSelections[chestNumber].map((player) => {
              // Определяем класс для рамки
              let ringClass = 'ring-2 ring-gray-400';
              if (player.isWinner) ringClass = 'ring-4 ring-green-400 ring-pulse';
              if (player.isLoser) ringClass = 'ring-4 ring-red-500 opacity-60';
              
              return (
                <div key={player.name} className="player-result">
                  <div 
                    className={`player-circle-result
                      ${player.isPlayer ? 'bg-gray-300' : 'bg-gradient-to-br from-blue-500 to-blue-600'} 
                      ${ringClass}
                    `}
                  >
                    <span className="text-xl font-bold text-white">{player.number}</span>
                  </div>
                  <p className="text-sm font-bold">{player.displayName}</p>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Показываем обычную сетку только во время игры */}
      {gameActive && renderPlayersGrid()}
      
      {/* Показываем результаты под сундуками когда игра неактивна */}
      {!gameActive && results && renderPlayersUnderChests()}
    </>
  );
};

export default Players;