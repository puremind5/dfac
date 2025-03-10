import React, { useState, useEffect } from 'react';
import { Trash as Treasure } from 'lucide-react';
import GameBoard2 from './components/GameBoard2';
import Players from './components/Players';
import './App.css';

const CHEST_VALUES = { 1: 35, 2: 50, 3: 70, 4: 100 };
const GAME_COST = 25; // 💰 Стоимость каждой игры
const BANK_THRESHOLD = 100; // 📌 Порог банка для розыгрыша

const MultiplayerGame: React.FC = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [gameActive, setGameActive] = useState<boolean>(true);
  const [bank, setBank] = useState<number>(0); // 🌟 БАНК
  const [lastBankAddition, setLastBankAddition] = useState<number | null>(null);
  const [prevBankValue, setPrevBankValue] = useState<number>(0);
  const [bankJackpot, setBankJackpot] = useState<{player: string, amount: number} | null>(null);
  
  // 🌟 Серии побед
  const [winStreak, setWinStreak] = useState<{ [key: string]: number }>({
    You: 0,
    "Игрок2": 0,
    "Алиса": 0,
    "Олег": 0,
  });

  // 🌟 Баланс игроков
  const [totalGold, setTotalGold] = useState<{ [key: string]: number }>({
    You: 100,
    "Игрок2": 100,
    "Алиса": 100,
    "Олег": 100,
  });

  const [timeLeft, setTimeLeft] = useState(7);
  const [activePlayer, setActivePlayer] = useState<'You' | 'Игрок2'>('Игрок2'); // Изначально активен Игрок2
  const [playersMadeChoice, setPlayersMadeChoice] = useState<Record<string, boolean>>({
    'You': false,
    'Игрок2': false,
    'Алиса': false,
    'Олег': false,
  });

  const [playerChoice, setPlayerChoice] = useState<number | null>(null); // Выбор первого игрока
  const [player2Choice, setPlayer2Choice] = useState<number | null>(null); // Выбор второго игрока
  const [resultsReady, setResultsReady] = useState(false);
  const [visiblePlayers, setVisiblePlayers] = useState<string[]>([]);
  const [resultTimeLeft, setResultTimeLeft] = useState<number | null>(null);
  const [bankUpdateVisible, setBankUpdateVisible] = useState<boolean>(false);

  // Эффект для обработки таймера обратного отсчета
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => Math.max(prev - 1, 0));
      }, 1000);
    } else if (timeLeft === 0 && gameActive) {
      // Если время вышло, делаем случайный выбор за текущего активного игрока
      if (activePlayer === 'You' && !playersMadeChoice['You']) {
        const randomChest = Math.floor(Math.random() * 4) + 1;
        console.log('Таймер закончился, автоматически выбираем сундук для You:', randomChest);
        handleChestSelect(randomChest);
      } else if (activePlayer === 'Игрок2' && !playersMadeChoice['Игрок2']) {
        const randomChest = Math.floor(Math.random() * 4) + 1;
        console.log('Таймер закончился, автоматически выбираем сундук для Игрок2:', randomChest);
        handleChestSelect(randomChest);
      }
    }
    
    return () => clearInterval(timer);
  }, [gameActive, timeLeft, activePlayer, playersMadeChoice]);

  const handleChestSelect = (chestIndex: number) => {
    if (!gameActive) return;
    
    console.log(`${activePlayer} выбрал сундук:`, chestIndex);

    // Сохраняем выбор активного игрока
    if (activePlayer === 'Игрок2') {
      setPlayer2Choice(chestIndex);
      
      // Отмечаем, что второй игрок сделал выбор
      setPlayersMadeChoice(prev => ({
        ...prev,
        'Игрок2': true
      }));
      
      // Переключаемся на первого игрока
      setActivePlayer('You');
      setTimeLeft(7); // Сбрасываем таймер для первого игрока
    } else if (activePlayer === 'You') {
      setPlayerChoice(chestIndex);
      
      // Отмечаем, что первый игрок сделал выбор
      setPlayersMadeChoice(prev => ({
        ...prev,
        'You': true
      }));
      
      // Оба игрока сделали выбор, завершаем раунд
      finishRound(player2Choice || 1);
    }
  };

  // Определение победителя
  const determineWinner = (playerChoice: number, player2Choice: number, botChoices: number[], reward: number) => {
    console.log('Определяем победителя:', { playerChoice, player2Choice, botChoices, reward });
    
    // Собираем все выборы в виде объектов
    const allChoices = [
      { player: 'You', chest: playerChoice, value: CHEST_VALUES[playerChoice] || 0 },
      { player: 'Игрок2', chest: player2Choice, value: CHEST_VALUES[player2Choice] || 0 },
      { player: 'Алиса', chest: botChoices[0], value: CHEST_VALUES[botChoices[0]] || 0 },
      { player: 'Олег', chest: botChoices[1], value: CHEST_VALUES[botChoices[1]] || 0 }
    ];
    
    // Создаем карту выборов для определения уникальных выборов
    const choiceMap: Record<number, string[]> = {};
    allChoices.forEach(choice => {
      if (!choiceMap[choice.chest]) {
        choiceMap[choice.chest] = [];
      }
      choiceMap[choice.chest].push(choice.player);
    });
    
    // Находим уникальные выборы (выбраны только одним игроком)
    const uniqueChoices = allChoices.filter(choice => 
      choiceMap[choice.chest].length === 1
    );
    
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
        'Игрок2': 0,
        'Алиса': 0,
        'Олег': 0,
      });
    }
  };

  // Функция завершения раунда
  const finishRound = (player2ChoiceIndex: number) => {
    console.log('Функция finishRound начала выполнение');
    try {
      setLoading(true);
      setError(null);
      setGameActive(false);
      setResultsReady(true);
      
      // Сбрасываем видимость всех игроков и обновления банка
      setVisiblePlayers([]);
      setBankUpdateVisible(false);

      // Генерируем локальные данные для двух ботов
      const botChoices = [
        Math.floor(Math.random() * 4) + 1,
        Math.floor(Math.random() * 4) + 1
      ];
      
      // Определяем награду на основе выбранного сундука
      const playerChestValue = CHEST_VALUES[playerChoice || 1] || 0;
      const player2ChestValue = CHEST_VALUES[player2ChoiceIndex] || 0;
      const reward = Math.max(playerChestValue, player2ChestValue);
      
      console.log('Данные для игры:', { 
        playerChoice, 
        player2Choice: player2ChoiceIndex, 
        botChoices, 
        reward,
        playerChestValue,
        player2ChestValue
      });
      
      // Определяем победителя с учетом обоих выборов
      const { winner, reward: determinedReward } = determineWinner(
        playerChoice || 1, 
        player2ChoiceIndex, 
        botChoices, 
        reward
      );
      console.log('Определен победитель:', winner);

      // Обновляем результаты
      const results = {
        winner,
        reward: determinedReward,
        playerChoice: playerChoice || 1,
        player2Choice: player2ChoiceIndex,
        botChoices,
        botNames: ['Алиса', 'Олег'],
        displayOrder: ['You', 'Игрок2', 'Алиса', 'Олег']  // Порядок отображения
      };
      
      console.log('Устанавливаем результаты:', results);
      setResults(results);

      // Добавляем 2-секундную задержку перед началом последовательного отображения
      setTimeout(() => {
        // Создаем массив для всех игроков с информацией о наградах
        const allPlayersData = [];
        
        // Добавляем выбор первого игрока
        allPlayersData.push({
          player: 'You',
          choice: results.playerChoice,
          reward: results.winner === 'You' ? results.reward : 0
        });
        
        // Добавляем выбор второго игрока
        allPlayersData.push({
          player: 'Игрок2',
          choice: results.player2Choice,
          reward: results.winner === 'Игрок2' ? results.reward : 0
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
            // Если награды одинаковые, сначала игроки, потом боты по порядку
            if (a.player === 'You' || a.player === 'Игрок2') return -1;
            if (b.player === 'You' || b.player === 'Игрок2') return 1;
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
    setPlayerChoice(null); // Сбрасываем выбор первого игрока
    setPlayer2Choice(null); // Сбрасываем выбор второго игрока
    setActivePlayer('Игрок2'); // Ход начинается со второго игрока
    
    // Обновляем состояние prevBankValue текущим значением банка
    setPrevBankValue(bank);
    
    // Вычитаем стоимость участия у каждого игрока
    setTotalGold(prev => ({
      'You': prev['You'] - GAME_COST,
      'Игрок2': prev['Игрок2'] - GAME_COST,
      'Алиса': prev['Алиса'] - GAME_COST,
      'Олег': prev['Олег'] - GAME_COST
    }));
    
    setTimeLeft(7); // Сбрасываем таймер на 7 секунд
    setResultsReady(false); // Сбрасываем готовность результатов
    setBankUpdateVisible(false); // Сбрасываем видимость обновления банка
    setBankJackpot(null); // Сбрасываем информацию о джекпоте
    
    setPlayersMadeChoice({
      'You': false,
      'Игрок2': false,
      'Алиса': false,
      'Олег': false
    });
    
    // Сбрасываем информацию о последнем пополнении банка при начале нового раунда
    setLastBankAddition(null);
    
    console.log("Начинаем новый раунд");
  };

  // В будущем здесь будет логика мультиплеера
  console.log("Режим мультиплеера активирован");

  return (
    <div>
      {/* Заголовок режима мультиплеера */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-bold text-white">📱 Режим мультиплеера 📱</h2>
        <p className="text-sm text-white mt-2">Реализация: 2 игрока + 2 бота</p>
      </div>
      
      <div className="game-container">
        {/* 🎯 Игровая доска */}
        <GameBoard2 
          onChestSelect={handleChestSelect} 
          loading={loading} 
          gameActive={gameActive} 
          selectedChest={activePlayer === 'You' ? playerChoice : player2Choice}
          playersMadeChoice={playersMadeChoice}
          resultsReady={resultsReady}
          activePlayer={activePlayer}
          timeLeft={timeLeft}
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
            activePlayer={activePlayer}
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
            🔥🔥🔥 {bankJackpot.player === 'You' ? 'Вы сорвали' : bankJackpot.player === 'Игрок2' ? 'Игрок2 сорвал' : `${bankJackpot.player} сорвал${bankJackpot.player === 'Алиса' ? 'а' : ''}`} банк +{bankJackpot.amount} монет 🔥🔥🔥
          </p>
        )}
      </div>

      {/* 🌟 Общий счёт + текущий раунд */}
      <div className="mt-6 p-6 bg-gray-100 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Общий счёт (слева) */}
        <div className="text-center">
          <h2 className="text-lg font-bold mb-2">💰 Общий счёт</h2>

          <ul className="text-sm text-gray-700">
            {Object.entries(totalGold)
              .filter(([player]) => ["You", "Игрок2", "Алиса", "Олег"].includes(player))
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
              <li className="font-semibold">👤 Игрок2 выбрал сундук {results.player2Choice}</li>
              {results.botChoices.map((choice: number, index: number) => (
                <li key={index}>🤖 {results.botNames[index]} выбрал{results.botNames[index] === 'Алиса' ? 'а' : ''} сундук {choice}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 🌟 Описание игры (теперь внизу) */}
      <div className="mt-6 p-6 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-center mb-2">Мультиплеер (в разработке):</h2>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>• 2 игрока и 2 бота играют вместе</li>
          <li>• Игроки совершают ходы по очереди</li>
          <li>• В каждом сундуке разное количество золота: 35, 50, 70 или 100 монет</li>
          <li>• Если только один игрок выбрал самый ценный сундук, он получает золото</li>
          <li>• Если несколько игроков выбрали один и тот же сундук, никто не получает золото</li>
          <li className="font-semibold">• 💰 Стоимость участия в раунде: {GAME_COST} монет</li>
          <li>• 🏦 <span className="font-semibold">Банк</span>: неразыгранные монеты попадают в банк</li>
          <li>• 🔥 Когда в банке накапливается {BANK_THRESHOLD} монет, его можно выиграть</li>
          <li>• 🏆 Чтобы забрать банк, нужно <span className="font-semibold">выиграть 3 раза подряд</span></li>
        </ul>
      </div>
    </div>
  );
};

export default MultiplayerGame; 