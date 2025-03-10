import React, { useState, useEffect } from 'react';
import '../App.css'; // Импортируем стили

interface PlayersProps {
  results: any;
  timeLeft: number;
  gameActive: boolean;
  playersMadeChoice: Record<string, boolean>;
  setPlayersMadeChoice: (value: Record<string, boolean>) => void;
  visiblePlayers?: string[]; // Список имен игроков, которые должны быть видимы
  activePlayer: 'You' | 'Игрок2'; // Текущий активный игрок
}

const CHEST_VALUES = { 1: 35, 2: 50, 3: 70, 4: 100 };
// Имена ботов
const BOT_NAMES = ['Алиса', 'Олег'];

const Players: React.FC<PlayersProps> = ({ 
  results, 
  timeLeft, 
  gameActive, 
  playersMadeChoice,
  setPlayersMadeChoice,
  visiblePlayers,
  activePlayer
}) => {
  const [botChoices, setBotChoices] = useState<Record<string, boolean>>({
    'Алиса': false,
    'Олег': false
  });
  
  // Сброс состояний при начале нового раунда
  useEffect(() => {
    if (gameActive) {
      setBotChoices({
        'Алиса': false,
        'Олег': false
      });
      setPlayersMadeChoice({
        'You': false,
        'Игрок2': false,
        'Алиса': false,
        'Олег': false
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
    <div className="mt-8 flex flex-row flex-wrap gap-4 items-center justify-center">
      {/* Игрок 1 (You) */}
      <div className="text-center player-container">
        <div className={`player-circle w-16 h-16 mx-auto rounded-full flex items-center justify-center 
          ${!gameActive ? (
            getPlayerResult('You') === 'win' ? 'bg-green-500 ring-4 ring-green-400 ring-pulse' :
            getPlayerResult('You') === 'lose' ? 'bg-gray-300 ring-4 ring-red-500' :
            'bg-gray-300 ring-2 ring-gray-400'
          ) : (
            activePlayer === 'You' ? 'bg-blue-500 ring-4 ring-blue-300 pulse-ring' : 'bg-gray-300'
          )}
          transition-all duration-300`}>
          <span className="text-xl font-bold text-white">1</span>
        </div>
        <p className="mt-2 font-bold">Вы</p>
        {gameActive && (
          <>
            {playersMadeChoice['You'] ? (
              <p className="text-xs text-green-600 font-medium">Выбрали сундук</p>
            ) : (
              activePlayer === 'You' ? (
                <p className="text-xs text-gray-500 font-medium blinking-text">СДЕЛАЙТЕ ВЫБОР</p>
              ) : (
                <p className="text-xs text-gray-500 font-medium">Ожидание хода</p>
              )
            )}
          </>
        )}
      </div>

      {/* Игрок 2 */}
      <div className="text-center player-container">
        <div className={`player-circle w-16 h-16 mx-auto rounded-full flex items-center justify-center 
          ${!gameActive ? (
            getPlayerResult('Игрок2') === 'win' ? 'bg-green-500 ring-4 ring-green-400 ring-pulse' :
            getPlayerResult('Игрок2') === 'lose' ? 'bg-gray-300 ring-4 ring-red-500' :
            'bg-gray-300 ring-2 ring-gray-400'
          ) : (
            activePlayer === 'Игрок2' ? 'bg-blue-500 ring-4 ring-blue-300 pulse-ring' : 'bg-gray-300'
          )}
          transition-all duration-300`}>
          <span className="text-xl font-bold text-white">2</span>
        </div>
        <p className="mt-2 font-bold">Игрок2</p>
        {gameActive && (
          <>
            {playersMadeChoice['Игрок2'] ? (
              <p className="text-xs text-green-600 font-medium">Выбрал сундук</p>
            ) : (
              activePlayer === 'Игрок2' ? (
                <p className="text-xs text-gray-500 font-medium blinking-text">СДЕЛАЙТЕ ВЫБОР</p>
              ) : (
                <p className="text-xs text-gray-500 font-medium">Ожидание хода</p>
              )
            )}
          </>
        )}
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
            <span className="text-xl font-bold text-white">{index + 3}</span>
          </div>
          <p className="mt-2 font-bold">{bot}</p>
          {gameActive && (
            <>
              {playersMadeChoice[bot] ? (
                <p className="text-xs text-green-600 font-medium">
                  {bot === 'Алиса' ? 'Выбрала сундук' : 'Выбрал сундук'}
                </p>
              ) : (
                <p className="text-xs text-gray-500 font-medium blinking-text">Думает...</p>
              )}
            </>
          )}
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
    
    // Добавляем игрока 1, если он должен быть видим
    if (!visiblePlayers || visiblePlayers.includes('You')) {
      chestSelections[results.playerChoice].push({
        name: 'You',
        displayName: 'Вы',
        number: 1,
        isWinner: results.winner === 'You',
        isLoser: results.winner !== 'No winner' && results.winner !== 'You',
        isPlayer: true,
        reward: results.winner === 'You' ? results.reward : 0
      });
    }
    
    // Добавляем игрока 2, если он должен быть видим
    if (!visiblePlayers || visiblePlayers.includes('Игрок2')) {
      chestSelections[results.player2Choice].push({
        name: 'Игрок2',
        displayName: 'Игрок2',
        number: 2,
        isWinner: results.winner === 'Игрок2',
        isLoser: results.winner !== 'No winner' && results.winner !== 'Игрок2',
        isPlayer: true,
        reward: results.winner === 'Игрок2' ? results.reward : 0
      });
    }
    
    // Добавляем ботов, если они должны быть видимы
    results.botChoices.forEach((choice: number, index: number) => {
      const botName = results.botNames[index];
      if (!visiblePlayers || visiblePlayers.includes(botName)) {
        chestSelections[choice].push({
          name: botName,
          displayName: botName,
          number: index + 3,
          isWinner: results.winner === botName,
          isLoser: results.winner !== 'No winner' && results.winner !== botName,
          isPlayer: false,
          reward: results.winner === botName ? results.reward : 0
        });
      }
    });
    
    return (
      <div className="results-container">
        {/* Отображаем группы игроков для каждого сундука */}
        {[1, 2, 3, 4].map(chestNumber => {
          // Определяем, сколько игроков выбрали этот сундук
          const playersCount = chestSelections[chestNumber].length;
          
          return (
            <div key={chestNumber} className={`chest-result-group chest-group-${chestNumber}`}>
              <div className="overlapping-players-container" style={{ display: 'flex', justifyContent: 'center' }}>
                {chestSelections[chestNumber].map((player, index) => {
                  // Определяем класс для рамки
                  let ringClass = 'ring-2 ring-gray-400';
                  if (player.isWinner) ringClass = 'ring-4 ring-green-400 ring-pulse';
                  if (player.isLoser) ringClass = 'ring-4 ring-red-500 opacity-60';
                  
                  // Еще более сильное наложение кружков - примерно на 80%
                  const marginLeftValue = (index > 0 && playersCount > 1) ? '-50px' : '0';
                  
                  return (
                    <div 
                      key={player.name} 
                      className="player-result" 
                      style={{ 
                        marginLeft: marginLeftValue,
                        position: 'relative',
                        zIndex: 10 - index // Для правильного наложения
                      }}
                    >
                      <div 
                        className={`player-circle-result
                          ${player.isPlayer ? 'bg-gray-300' : 'bg-gradient-to-br from-blue-500 to-blue-600'} 
                          ${ringClass}
                        `}
                      >
                        <span className="text-xl font-bold text-white">{player.number}</span>
                      </div>
                      <p className="text-sm font-bold" style={{marginLeft: index > 0 && playersCount > 1 ? '50px' : '0'}}>
                        {player.displayName}
                      </p>
                      {/* Отображаем награду под именем, если игрок является победителем */}
                      {player.isWinner && player.reward > 0 && (
                        <p 
                          className="text-xs text-green-600 font-medium" 
                          style={{marginLeft: index > 0 && playersCount > 1 ? '50px' : '0'}}
                        >
                          ПОБЕДИТЕЛЬ! +{player.reward}
                        </p>
                      )}
                      {/* Отображаем "-25 монет" красным цветом под именами проигравших */}
                      {!player.isWinner && (
                        <p 
                          className="text-xs text-red-500 font-medium" 
                          style={{marginLeft: index > 0 && playersCount > 1 ? '50px' : '0'}}
                        >
                          -25
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
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