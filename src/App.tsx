import React, { useState, useEffect } from 'react';
import { Trash as Treasure } from 'lucide-react';
import GameBoard2 from './components/GameBoard2';
import BankGame from './BankGame';
import ThreePlayersGame from './ThreePlayersGame';
import Players from './components/Players';
import axios from 'axios';
import './App.css';

const CHEST_VALUES = { 1: 35, 2: 50, 3: 70, 4: 100 };
const GAME_COST = 25; // 💰 Стоимость каждой игры
const BANK_THRESHOLD = 100; // 📌 Порог банка для розыгрыша

function App() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [gameActive, setGameActive] = useState<boolean>(true);
  const [bank, setBank] = useState<number>(0); // 🌟 БАНК
  const [winStreak, setWinStreak] = useState<{ [key: string]: number }>({
    You: 0,
    "Алиса": 0,
    "Олег": 0,
    "Сири": 0,
  });

  // 🌟 Баланс игроков
  const [totalGold, setTotalGold] = useState<{ [key: string]: number }>({
    You: 100,
    "Алиса": 100,
    "Олег": 100,
    "Сири": 100,
  });

  const [gameVersion, setGameVersion] = useState<'original' | 'bank' | 'three-players'>('original');
  const [timeLeft, setTimeLeft] = useState(10); // Добавляем время для таймера
  const [playersMadeChoice, setPlayersMadeChoice] = useState<Record<string, boolean>>({
    'You': false,
    'Алиса': false,
    'Олег': false,
    'Сири': false
  });

  const [playerChoice, setPlayerChoice] = useState<number | null>(null);

  // Таймер
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (gameActive) {
      // Сбрасываем таймер при начале нового раунда
      setTimeLeft(10);
      console.log('Запуск таймера, gameActive =', gameActive);
      
      // Запускаем таймер
      timer = setInterval(() => {
        setTimeLeft(prevTime => {
          console.log('Таймер: осталось', prevTime, 'секунд');
          // Когда время истекло
          if (prevTime <= 1) {
            console.log('Таймер закончился!');
            clearInterval(timer!);
            
            // Если игрок не сделал выбор, выбираем случайный сундук
            if (!playersMadeChoice['You']) {
              console.log('Игрок не сделал выбор, выбираем случайный сундук');
              const randomChest = Math.floor(Math.random() * 4) + 1;
              setPlayerChoice(randomChest);
              setPlayersMadeChoice(prev => ({
                ...prev,
                'You': true
              }));
              
              // Завершаем раунд с выбором за игрока
              console.log('Вызываем finishRound с случайным выбором:', randomChest);
              finishRound(randomChest);
            } else if (playerChoice !== null) {
              // Если игрок уже сделал выбор, завершаем раунд с его выбором
              console.log('Игрок уже сделал выбор:', playerChoice, 'вызываем finishRound');
              finishRound(playerChoice);
            } else {
              console.log('Ошибка: playersMadeChoice[You] = true, но playerChoice = null');
            }
            
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) {
        console.log('Очищаем таймер при размонтировании компонента');
        clearInterval(timer);
      }
    };
  }, [gameActive]);

  // Проверка, сделали ли все игроки выбор
  useEffect(() => {
    // Запускается только во время активной игры
    if (!gameActive || !playerChoice) return;
    
    // Создаем интервал для проверки выборов всех игроков
    const checkInterval = setInterval(() => {
      console.log('Проверяем, сделали ли все игроки выбор:', playersMadeChoice);
      
      // Проверяем, сделали ли все игроки выбор
      const allPlayersChose = Object.values(playersMadeChoice).every(choice => choice === true);
      
      if (allPlayersChose) {
        console.log('Все игроки сделали выбор! Заканчиваем раунд досрочно.');
        clearInterval(checkInterval);
        
        // Завершаем раунд с выбором игрока
        finishRound(playerChoice);
      }
    }, 1000); // Проверка каждую секунду
    
    return () => {
      clearInterval(checkInterval);
    };
  }, [playersMadeChoice, gameActive, playerChoice]);

  const handleChestSelect = (chestIndex: number) => {
    if (!gameActive) return;
    
    console.log('Игрок выбрал сундук:', chestIndex);

    // Сохраняем выбор игрока
    setPlayerChoice(chestIndex);
    
    // Отмечаем, что игрок сделал выбор
    setPlayersMadeChoice(prev => ({
      ...prev,
      'You': true
    }));

    // Если таймер уже закончился, завершаем раунд сразу
    if (timeLeft <= 0) {
      console.log('Таймер уже закончился, вызываем finishRound напрямую');
      finishRound(chestIndex);
    } else {
      console.log('Таймер ещё не закончился, ждем его окончания');
    }
  };

  // Определяем победителя
  const determineWinner = (playerChoice: number, botChoices: number[], reward: number) => {
    // Ценность сундуков (индекс + 1 = номер сундука)
    const chestValues = [35, 50, 70, 100];
    
    // Имена ботов
    const botNames = ['Алиса', 'Олег', 'Сири'];
    
    // Собираем все выборы в один массив
    const allChoices = [...botChoices];
    
    // Создаем объект, где ключ - номер сундука, значение - массив игроков, выбравших этот сундук
    const choiceMap: Record<number, string[]> = {
      1: [],
      2: [],
      3: [],
      4: []
    };
    
    // Добавляем выбор игрока
    choiceMap[playerChoice].push('You');
    
    // Добавляем выборы ботов
    botChoices.forEach((choice, index) => {
      choiceMap[choice].push(botNames[index]);
    });
    
    console.log('Карта выборов:', choiceMap);
    
    // Находим уникальные выборы (сундуки, которые выбрал только один игрок)
    const uniqueChoices: {chest: number, player: string, value: number}[] = [];
    
    Object.entries(choiceMap).forEach(([chest, players]) => {
      const chestNumber = parseInt(chest);
      if (players.length === 1) {
        // Это уникальный выбор
        uniqueChoices.push({
          chest: chestNumber,
          player: players[0],
          value: chestValues[chestNumber - 1]
        });
      }
    });
    
    console.log('Уникальные выборы:', uniqueChoices);
    
    // Если есть уникальные выборы, находим самый ценный
    if (uniqueChoices.length > 0) {
      // Сортируем по убыванию ценности
      uniqueChoices.sort((a, b) => b.value - a.value);
      
      // Возвращаем игрока с самым ценным уникальным выбором
      console.log('Победитель:', uniqueChoices[0].player, 'с сундуком', uniqueChoices[0].chest, '(', uniqueChoices[0].value, 'золота)');
      return uniqueChoices[0].player;
    }
    
    // Если нет уникальных выборов, никто не выигрывает
    console.log('Нет уникальных выборов, нет победителя');
    return 'No winner';
  };

  // Обновляем банк и золото
  const updateBankAndGold = (winner: string, reward: number) => {
    // Если есть победитель, добавляем ему награду
    if (winner !== 'No winner') {
      setTotalGold(prev => ({
        ...prev,
        [winner]: prev[winner] + reward
      }));
    }
    
    // Добавляем неразыгранное золото в банк
    if (winner === 'No winner') {
      setBank(prev => prev + GAME_COST * 4); // Все 4 игрока заплатили, но никто не получил
    } else {
      setBank(prev => prev + (GAME_COST * 4 - reward)); // Добавляем разницу между платой и наградой
    }
  };

  // Обновляем серии побед
  const updateWinStreaks = (winner: string) => {
    if (winner !== 'No winner') {
      // Увеличиваем серию побед победителя
      setWinStreak(prev => ({
        ...prev,
        [winner]: prev[winner] + 1
      }));
      
      // Сбрасываем серии побед проигравших
      setWinStreak(prev => {
        const newStreak = { ...prev };
        Object.keys(newStreak).forEach(player => {
          if (player !== winner) {
            newStreak[player] = 0;
          }
        });
        return newStreak;
      });
      
      // Если победитель выиграл 3 раза подряд и банк достаточно большой
      if (winStreak[winner] + 1 >= 3 && bank >= BANK_THRESHOLD) {
        // Выплачиваем банк победителю
        setTotalGold(prev => ({
          ...prev,
          [winner]: prev[winner] + bank
        }));
        setBank(0); // Обнуляем банк
      }
    } else {
      // Если нет победителя, все серии сбрасываются
      setWinStreak({
        'You': 0,
        'Алиса': 0,
        'Олег': 0,
        'Сири': 0
      });
    }
  };

  // Вынесем логику завершения раунда в отдельную функцию
  const finishRound = (chestIndex: number) => {
    console.log('Функция finishRound начала выполнение');
    try {
      setLoading(true);
      setError(null);
      setGameActive(false);

      // Генерируем локальные данные
      const botChoices = [
        Math.floor(Math.random() * 4) + 1,
        Math.floor(Math.random() * 4) + 1,
        Math.floor(Math.random() * 4) + 1
      ];
      
      // Определяем награду (35, 50, 70 или 100)
      const reward = [35, 50, 70, 100][Math.floor(Math.random() * 4)];
      
      console.log('Данные для игры:', { playerChoice: chestIndex, botChoices, reward });
      
      // Определяем победителя
      const winner = determineWinner(chestIndex, botChoices, reward);
      console.log('Определен победитель:', winner);

      // Обновляем результаты
      const results = {
        winner,
        reward,
        playerChoice: chestIndex,
        botChoices,
        botNames: ['Алиса', 'Олег', 'Сири'] // Добавляем имена ботов в результаты
      };
      
      console.log('Устанавливаем результаты:', results);
      setResults(results);

      // Обновляем банк, баланс игроков и серию побед
      updateBankAndGold(winner, reward);
      updateWinStreaks(winner);

      setLoading(false);
      console.log('Функция finishRound завершила выполнение');
    } catch (error) {
      console.error("Ошибка при финализации раунда:", error);
      setError("Произошла ошибка. Пожалуйста, попробуйте еще раз.");
      setLoading(false);
    }
  };

  const startNewRound = () => {
    setGameActive(true);
    setResults(null);
    setError(null);
    setPlayerChoice(null); // Сбрасываем выбор игрока
    
    // Вычитаем стоимость участия у каждого игрока
    setTotalGold(prev => ({
      'You': prev['You'] - GAME_COST,
      'Алиса': prev['Алиса'] - GAME_COST,
      'Олег': prev['Олег'] - GAME_COST,
      'Сири': prev['Сири'] - GAME_COST
    }));
    
    setPlayersMadeChoice({
      'You': false,
      'Алиса': false,
      'Олег': false,
      'Сири': false
    });
    console.log("Начинаем новый раунд");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden p-6">
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-6">
          <div className="flex items-center justify-center">
            <Treasure className="h-10 w-10 text-yellow-100 mr-3" />
             <h1 className="text-xl md:text-3xl font-bold text-white whitespace-nowrap">Охота за сокровищами</h1>
             {/* 🌟 Заголовок перед игровым полем */}
          </div>
        </div>
        
        {/* Переключатель версий игры */}
        <div className="flex justify-center mt-4 mb-4">
          <button 
            className={`px-4 py-2 ${gameVersion === 'original' ? 'bg-blue-600 text-white' : 'bg-gray-200'} ${gameVersion === 'original' ? '' : 'rounded-l-lg'}`}
            onClick={() => setGameVersion('original')}
          >
            Оригинальная игра
          </button>
          <button 
            className={`px-4 py-2 ${gameVersion === 'bank' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setGameVersion('bank')}
          >
            Игра с БАНКОМ
          </button>
          <button 
            className={`px-4 py-2 ${gameVersion === 'three-players' ? 'bg-blue-600 text-white' : 'bg-gray-200'} ${gameVersion === 'three-players' ? '' : 'rounded-r-lg'}`}
            onClick={() => setGameVersion('three-players')}
          >
            3 игрока / 3 сундука
          </button>
        </div>
        
        {gameVersion === 'original' ? (
          <>
            {/* Создаем общий контейнер для игры */}
            <div className="game-container">
              {/* 🎯 Оригинальная игровая доска */}
              <GameBoard2 
                onChestSelect={handleChestSelect} 
                loading={loading} 
                gameActive={gameActive} 
                selectedChest={playerChoice}
              />
              
              {/* Обертка для компонента Players */}
              <div className="players-wrapper">
                <Players 
                  results={results} 
                  timeLeft={timeLeft} 
                  gameActive={gameActive} 
                  playersMadeChoice={playersMadeChoice}
                  setPlayersMadeChoice={setPlayersMadeChoice}
                />
              </div>
            </div>
            
            {results && (
              <div className="flex justify-center -mt-10">
                <button 
                className="px-5 py-3 bg-blue-500 text-white text-lg font-bold rounded-lg shadow-md hover:bg-blue-700 transition"
                onClick={startNewRound}
                >
                🔄 Играть снова
                </button>
              </div>
            )}

            {/* 🌟 Банк */}
            <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-md text-center">
              <h2 className="text-lg font-bold">🏦 Банк: {bank} монет</h2>
              {bank >= BANK_THRESHOLD && <p className="text-red-500 font-semibold">🔥 Банк теперь можно выиграть!</p>}
            </div>

            {/* 🌟 Общий счёт + текущий раунд (как было) */}
            <div className="mt-6 p-6 bg-gray-100 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Общий счёт (слева) */}
              <div className="text-center">
                <h2 className="text-lg font-bold mb-2">💰 Общий счёт</h2>

                <ul className="text-sm text-gray-700">
                  {Object.entries(totalGold).map(([player, gold]) => (
                  <li key={player} className={`py-1 ${gold < 0 ? "text-red-500" : ""}`}>
                  {player}: {gold} монет{" "}
                  {winStreak[player] >= 3 ? "🔥🔥🔥" : winStreak[player] === 2 ? "🔥🔥" : bank >= BANK_THRESHOLD ? `(🔥 ${winStreak[player]} побед подряд)` : ""}
                  </li>
                ))}
                </ul>
                
              </div>

              {/* Текущий раунд (справа) */}
              {results && (
                <div className="text-center">
                  <h2 className="text-lg font-bold mb-2">🎲 Текущий раунд</h2>
                  <p className="text-lg font-semibold">
                    {results.winner !== "No winner" ? `🏆 ${results.winner} выиграл ${results.reward} монет!` : "Никто не выиграл."}
                  </p>
                  <ul className="text-sm text-gray-700 mt-2">
                    <li className="font-semibold">🧑 Вы выбрали сундук {results.playerChoice}</li>
                    {results.botChoices.map((choice: number, index: number) => (
                      <li key={index}>🤖 {results.botNames[index]} выбрал{results.botNames[index] === 'Алиса' ? 'а' : ''} сундук {choice}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 🌟 Описание игры (теперь внизу) */}
            <div className="mt-6 p-6 bg-gray-100 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-center mb-2">Как играть:</h2>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Вы играете против 3 ботов</li>
                <li>• В каждом сундуке разное количество золота: 35, 50, 70 или 100 монет</li>
                <li>• Если только вы выбрали самый ценный сундук, вы получаете золото</li>
                <li>• Если несколько игроков выбрали один и тот же сундук, никто не получает золото</li>
                <li className="font-semibold">• 💰 Стоимость участия в раунде: {GAME_COST} монет</li>
                <li>• 🏦 <span className="font-semibold">Банк</span>: неразыгранные монеты попадают в банк</li>
                <li>• 🔥 Когда в банке накапливается {BANK_THRESHOLD} монет, его можно выиграть</li>
                <li>• 🏆 Чтобы забрать банк, нужно <span className="font-semibold">выиграть 3 раза подряд</span></li>
              </ul>
            </div>
          </>
        ) : gameVersion === 'bank' ? (
          <BankGame />
        ) : (
          <ThreePlayersGame />
        )}
      </div>
    </div>
  );
}

export default App;
