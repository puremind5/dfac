import React, { useState, useEffect } from 'react';
import { Trash as Treasure } from 'lucide-react';
import GameBoard2 from './components/GameBoard2';
import BankGame from './BankGame';
import ThreePlayersGame from './ThreePlayersGame';
import MultiplayerGame from './MultiplayerGame';
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
  const [lastBankAddition, setLastBankAddition] = useState<number | null>(null); // Последнее пополнение банка
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

  // Тип игры (теперь по умолчанию 'multiplayer')
  const [gameVersion, setGameVersion] = useState<'original' | 'bank' | 'three-players' | 'multiplayer'>('multiplayer');
  const [timeLeft, setTimeLeft] = useState(7); // Изменяем начальное время с 10 на 7 секунд
  const [playersMadeChoice, setPlayersMadeChoice] = useState<Record<string, boolean>>({
    'You': false,
    'Алиса': false,
    'Олег': false,
    'Сири': false
  });

  const [playerChoice, setPlayerChoice] = useState<number | null>(null);
  const [resultsReady, setResultsReady] = useState(false); // Новое состояние для сигнала о готовности результатов
  
  // Состояние для хранения видимых игроков (для последовательного отображения)
  const [visiblePlayers, setVisiblePlayers] = useState<string[]>([]);
  const [resultTimeLeft, setResultTimeLeft] = useState<number | null>(null);
  // Состояние для контроля видимости обновления банка
  const [bankUpdateVisible, setBankUpdateVisible] = useState<boolean>(false);
  // Состояние для хранения предыдущего значения банка (до добавления)
  const [prevBankValue, setPrevBankValue] = useState<number>(0);
  // Состояние для игрока, который сорвал банк, и суммы выигрыша
  const [bankJackpot, setBankJackpot] = useState<{player: string, amount: number} | null>(null);

  // Эффект для обработки таймера обратного отсчета
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => Math.max(prev - 1, 0));
      }, 1000);
    } else if (timeLeft === 0 && gameActive) {
      // Когда таймер достиг 0, завершаем раунд
      setGameActive(false);
      
      // Если игрок сделал выбор, завершаем с этим выбором
      // Иначе выбираем случайный сундук для игрока
      if (playerChoice !== null) {
        console.log('Таймер закончился, завершаем раунд с выбором игрока:', playerChoice);
        finishRound(playerChoice);
      } else {
        // Выбираем случайный сундук для игрока
        const randomChest = Math.floor(Math.random() * 4) + 1;
        console.log('Таймер закончился, автоматически выбираем сундук:', randomChest);
        setPlayerChoice(randomChest);
        finishRound(randomChest);
      }
    }
    
    return () => clearInterval(timer);
  }, [gameActive, timeLeft, playerChoice]);

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

    // Убираем проверку на окончание таймера,
    // теперь мы всегда дожидаемся окончания таймера
  };

  // Определяем победителя
  const determineWinner = (playerChoice: number, botChoices: number[], reward: number): { winner: string, reward: number } => {
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
      
      const winner = uniqueChoices[0];
      // Возвращаем игрока с самым ценным уникальным выбором и награду, соответствующую выбранному сундуку
      console.log('Победитель:', winner.player, 'с сундуком', winner.chest, '(', winner.value, 'золота)');
      return { 
        winner: winner.player, 
        reward: winner.value // Награда равна ценности выбранного сундука
      };
    }
    
    // Если нет уникальных выборов, никто не выигрывает
    console.log('Нет уникальных выборов, нет победителя');
    return { winner: 'No winner', reward: 0 };
  };

  // Обновляем банк и золото
  const updateBankAndGold = (winner: string, reward: number) => {
    // Запоминаем предыдущее значение банка перед обновлением
    setPrevBankValue(bank);
    
    // Если есть победитель, добавляем ему награду
    if (winner !== 'No winner') {
      setTotalGold(prev => ({
        ...prev,
        [winner]: prev[winner] + reward
      }));
    }
    
    // Добавляем неразыгранное золото в банк
    if (winner === 'No winner') {
      const addition = GAME_COST * 4; // Все 4 игрока заплатили, но никто не получил
      setBank(prev => prev + addition);
      setLastBankAddition(addition);
    } else {
      const addition = GAME_COST * 4 - reward; // Добавляем разницу между платой и наградой
      setBank(prev => prev + addition);
      setLastBankAddition(addition);
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
      
      // Обновляем серии побед проигравших
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
        // Запоминаем, кто сорвал банк и сколько выиграл
        setBankJackpot({player: winner, amount: bank});
        
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
      setResultsReady(true); // Сразу отмечаем, что результаты готовы
      
      // Сбрасываем видимость всех игроков и обновления банка
      setVisiblePlayers([]);
      setBankUpdateVisible(false);

      // Генерируем локальные данные
      const botChoices = [
        Math.floor(Math.random() * 4) + 1,
        Math.floor(Math.random() * 4) + 1,
        Math.floor(Math.random() * 4) + 1
      ];
      
      // Определяем награду на основе выбранного сундука
      const chestValues = [35, 50, 70, 100];
      const reward = chestValues[chestIndex - 1];
      
      console.log('Данные для игры:', { playerChoice: chestIndex, botChoices, reward });
      
      // Определяем победителя
      const { winner, reward: determinedReward } = determineWinner(chestIndex, botChoices, reward);
      console.log('Определен победитель:', winner);

      // Обновляем результаты
      const results = {
        winner,
        reward: determinedReward,
        playerChoice: chestIndex,
        botChoices,
        botNames: ['Алиса', 'Олег', 'Сири'] // Добавляем имена ботов в результаты
      };
      
      console.log('Устанавливаем результаты:', results);
      setResults(results);

      // Добавляем 2-секундную задержку перед началом последовательного отображения
      setTimeout(() => {
        // Создаем массив для всех игроков с информацией о наградах
        const allPlayersData = [];
        
        // Добавляем выбор игрока
        allPlayersData.push({
          player: 'You',
          choice: results.playerChoice,
          reward: results.winner === 'You' ? results.reward : 0
        });
        
        // Добавляем выборы ботов
        results.botChoices.forEach((choice: number, index: number) => {
          const botName = results.botNames[index];
          allPlayersData.push({
            player: botName,
            choice,
            reward: results.winner === botName ? results.reward : 0
          });
        });
        
        // Сортируем всех игроков строго по ценности награды (от 0 до 100)
        allPlayersData.sort((a, b) => {
          if (a.reward !== b.reward) {
            // Если награды разные, сортируем строго по возрастанию
            return a.reward - b.reward;
          } else {
            // Если награды одинаковые, сначала игрок, потом боты по порядку
            if (a.player === 'You') return -1;
            if (b.player === 'You') return 1;
            return results.botNames.indexOf(a.player) - results.botNames.indexOf(b.player);
          }
        });
        
        // Создаем массив с именами игроков в отсортированном порядке
        const sortedPlayerNames = allPlayersData.map(p => p.player);
        
        // Функция для показа следующего игрока
        const showNextPlayer = (index: number) => {
          if (index < sortedPlayerNames.length) {
            // Показываем игрока и всех предыдущих
            setVisiblePlayers(sortedPlayerNames.slice(0, index + 1));
            
            // Если это последний игрок, показываем обновление банка вместе с ним
            if (index === sortedPlayerNames.length - 1) {
              setBankUpdateVisible(true);
            }
            
            // Запускаем таймер для следующего игрока с задержкой 2 секунды
            setTimeout(() => {
              showNextPlayer(index + 1);
            }, 2000); // Задержка 2 секунды между игроками
          } else {
            // Все игроки уже показаны, обновление банка уже видимо
            // Ничего дополнительно делать не нужно
          }
        };
        
        // Запускаем отображение первого игрока
        showNextPlayer(0);
        
        // Обновляем банк, баланс игроков и серию побед
        updateBankAndGold(winner, determinedReward);
        updateWinStreaks(winner);
        
        setLoading(false);
      }, 2000); // Задержка 2 секунды перед началом показа
      
      console.log('Функция finishRound завершила выполнение, ожидаем 2 секунды до начала показа результатов');
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
    
    // Обновляем состояние prevBankValue текущим значением банка
    setPrevBankValue(bank);
    
    // Вычитаем стоимость участия у каждого игрока
    setTotalGold(prev => ({
      'You': prev['You'] - GAME_COST,
      'Алиса': prev['Алиса'] - GAME_COST,
      'Олег': prev['Олег'] - GAME_COST,
      'Сири': prev['Сири'] - GAME_COST
    }));
    
    setTimeLeft(7); // Сбрасываем таймер на 7 секунд
    setResultsReady(false); // Сбрасываем готовность результатов
    setBankUpdateVisible(false); // Сбрасываем видимость обновления банка
    setBankJackpot(null); // Сбрасываем информацию о джекпоте
    
    setPlayersMadeChoice({
      'You': false,
      'Алиса': false,
      'Олег': false,
      'Сири': false
    });
    
    // Сбрасываем информацию о последнем пополнении банка при начале нового раунда
    setLastBankAddition(null);
    
    console.log("Начинаем новый раунд");
  };

  // Функция для последовательного отображения результатов
  const showResultsSequentially = (results: any) => {
    // Сбрасываем состояние видимых игроков
    setVisiblePlayers([]);
    setBankUpdateVisible(false);

    // Создаем массив для всех игроков с информацией о наградах
    const allPlayersData = [];
    
    // Добавляем выбор игрока
    allPlayersData.push({
      player: 'You',
      choice: results.playerChoice,
      reward: results.winner === 'You' ? results.reward : 0
    });
    
    // Добавляем выборы ботов
    results.botChoices.forEach((choice: number, index: number) => {
      const botName = results.botNames[index];
      allPlayersData.push({
        player: botName,
        choice,
        reward: results.winner === botName ? results.reward : 0
      });
    });
    
    // Сортируем всех игроков строго по ценности награды (от 0 до 100)
    allPlayersData.sort((a, b) => {
      if (a.reward !== b.reward) {
        // Если награды разные, сортируем строго по возрастанию
        return a.reward - b.reward;
      } else {
        // Если награды одинаковые, сначала игрок, потом боты по порядку
        if (a.player === 'You') return -1;
        if (b.player === 'You') return 1;
        return results.botNames.indexOf(a.player) - results.botNames.indexOf(b.player);
      }
    });
    
    // Проверяем что у нас правильная сортировка от 0 до 100
    console.log('Отсортированные игроки по награде (от 0 до 100):', allPlayersData);
    
    // Создаем массив с именами игроков в отсортированном порядке
    const sortedPlayerNames = allPlayersData.map(p => p.player);
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
            className={`px-4 py-2 ${gameVersion === 'original' ? 'bg-blue-600 text-white' : 'bg-gray-200'} rounded-l-lg`}
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
            className={`px-4 py-2 ${gameVersion === 'three-players' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setGameVersion('three-players')}
          >
            3 игрока / 3 сундука
          </button>
          <button 
            className={`px-4 py-2 ${gameVersion === 'multiplayer' ? 'bg-blue-600 text-white' : 'bg-gray-200'} rounded-r-lg`}
            onClick={() => setGameVersion('multiplayer')}
          >
            Мультиплеер
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
                playersMadeChoice={playersMadeChoice}
                resultsReady={resultsReady}
              />
              
              {/* Обертка для компонента Players */}
              <div className="players-wrapper">
                <Players 
                  results={results} 
                  timeLeft={timeLeft} 
                  gameActive={gameActive} 
                  playersMadeChoice={playersMadeChoice}
                  setPlayersMadeChoice={setPlayersMadeChoice}
                  visiblePlayers={visiblePlayers}
                />
              </div>
            </div>
            
            {/* Показываем кнопку "Играть снова" только когда все игроки видны - размещаем над банком */}
            {results && visiblePlayers.length === 4 && (
              <div className="flex justify-center mt-4 mb-4">
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
              <h2 className="text-lg font-bold">
                🏦 Банк: {prevBankValue} монет
                {lastBankAddition !== null && lastBankAddition > 0 && visiblePlayers.length === 4 && !bankJackpot && (
                  <span className="text-green-600"> +{lastBankAddition} монет</span>
                )}
              </h2>
              {bank >= BANK_THRESHOLD && !bankJackpot && <p className="text-red-500 font-semibold">🔥 Банк теперь можно выиграть!</p>}
              {/* Отображаем сообщение о срыве банка */}
              {bankJackpot && (
                <p className="text-red-500 font-bold text-lg jackpot-text">
                  🔥🔥🔥 {bankJackpot.player === 'You' ? 'Вы сорвали' : `${bankJackpot.player} сорвал${bankJackpot.player === 'Алиса' ? 'а' : ''}`} банк +{bankJackpot.amount} монет 🔥🔥🔥
                </p>
              )}
            </div>

            {/* 🌟 Общий счёт + текущий раунд (как было) */}
            <div className="mt-6 p-6 bg-gray-100 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Общий счёт (слева) */}
              <div className="text-center">
                <h2 className="text-lg font-bold mb-2">💰 Общий счёт</h2>

                <ul className="text-sm text-gray-700">
                  {Object.entries(totalGold)
                    .filter(([player]) => ["You", "Алиса", "Олег", "Сири"].includes(player))
                    .map(([player, gold]) => (
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
                  
                  {/* Показываем сообщение о просмотре результатов, пока не все игроки видны */}
                  {visiblePlayers.length < 4 ? (
                    <p className="text-lg font-semibold">📊 Смотрим результаты...</p>
                  ) : (
                    <p className="text-lg font-semibold">
                      {results.winner !== "No winner" ? `🏆 ${results.winner} выиграл ${results.reward} монет!` : "Никто не выиграл."}
                    </p>
                  )}
                  
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
        ) : gameVersion === 'three-players' ? (
          <ThreePlayersGame />
        ) : (
          <MultiplayerGame />
        )}
      </div>
    </div>
  );
}

export default App;
