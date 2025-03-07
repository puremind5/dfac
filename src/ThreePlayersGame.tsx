import React, { useState } from 'react';
import { Trash as Treasure } from 'lucide-react';

// Константы
const CHEST_VALUES = { 1: 35, 2: 50, 3: 75 }; // Награды в сундуках: 35, 50, 75
const GAME_COST = 25; // 💰 Стоимость каждой игры - 25 монет
const BANK_THRESHOLD = 100; // 📌 Порог банка для розыгрыша
const BANK_RESERVE = 50; // 📌 Резерв банка после распределения

const ThreePlayersGame: React.FC = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [gameActive, setGameActive] = useState<boolean>(true);
  const [playerGold, setPlayerGold] = useState(100);
  const [bot1Gold, setBot1Gold] = useState(100);
  const [bot2Gold, setBot2Gold] = useState(100);
  const [bankGold, setBankGold] = useState(0); // Начальное значение банка = 0
  const [winStreak, setWinStreak] = useState<{ [key: string]: number }>({
    You: 0,
    "Bot 1": 0,
    "Bot 2": 0,
  });
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [bankInDebt, setBankInDebt] = useState(false);

  const addToLog = (message: string) => {
    setGameLog(prev => [message, ...prev].slice(0, 10));
  };

  // Функция распределения монет из банка при выигрыше винстрика
  const distributeBankGoldToWinner = (winner: string) => {
    if (bankGold >= BANK_THRESHOLD && winStreak[winner] === 2) { // На этом ходу будет 3-я победа
      const bankReward = Math.max(0, bankGold); // Банк отдает все свои деньги
      if (bankReward > 0) {
        if (winner === "You") {
          setPlayerGold(prev => prev + bankReward);
        } else if (winner === "Bot 1") {
          setBot1Gold(prev => prev + bankReward);
        } else if (winner === "Bot 2") {
          setBot2Gold(prev => prev + bankReward);
        }
        setBankGold(0); // Банк остается пустым
        addToLog(`🔥 ${winner} выиграл весь банк в размере ${bankReward} монет!`);
        return true;
      }
    }
    return false;
  };

  const handleChestSelect = (chestNumber: number) => {
    if (!gameActive) return;
    setLoading(true);
    setGameActive(false);

    // Логика выбора сундука
    const playerChoice = chestNumber;
    const bot1Choice = Math.floor(Math.random() * 3) + 1; // Выбор из 3 сундуков
    const bot2Choice = Math.floor(Math.random() * 3) + 1; // Выбор из 3 сундуков

    // 💰 Игроки платят за вход в игру
    setPlayerGold(prev => prev - GAME_COST);
    setBot1Gold(prev => prev - GAME_COST);
    setBot2Gold(prev => prev - GAME_COST);

    // Общий банк за игру
    const totalBet = GAME_COST * 3; // 75 монет (3 игрока по 25 монет)

    // Считаем количество выборов
    const allChoices = [playerChoice, bot1Choice, bot2Choice];
    const choiceCount: Record<number, number> = {};
    allChoices.forEach(choice => {
      choiceCount[choice] = (choiceCount[choice] || 0) + 1;
    });

    // Уникальные выборы
    const uniqueChoices = Object.keys(choiceCount)
      .map(Number)
      .filter(choice => choiceCount[choice] === 1);

    let winner = "No winner";
    let reward = 0;

    if (uniqueChoices.length > 0) {
      // Самый дорогой уникальный сундук
      const bestChoice = uniqueChoices.reduce((best, choice) =>
        CHEST_VALUES[choice] > CHEST_VALUES[best] ? choice : best, uniqueChoices[0]);

      // Кто выбрал этот сундук?
      if (playerChoice === bestChoice) {
        winner = "You";
        reward = CHEST_VALUES[bestChoice];
        setPlayerGold(prev => prev + reward);
        
        // Увеличиваем серию побед только если в банке достаточно монет
        setWinStreak(prev => ({
          ...prev,
          You: bankGold >= BANK_THRESHOLD ? prev.You + 1 : 0,
          "Bot 1": 0,
          "Bot 2": 0
        }));
      } else if (bot1Choice === bestChoice) {
        winner = "Bot 1";
        reward = CHEST_VALUES[bestChoice];
        setBot1Gold(prev => prev + reward);
        
        // Увеличиваем серию побед только если в банке достаточно монет
        setWinStreak(prev => ({
          ...prev,
          You: 0,
          "Bot 1": bankGold >= BANK_THRESHOLD ? prev["Bot 1"] + 1 : 0,
          "Bot 2": 0
        }));
      } else if (bot2Choice === bestChoice) {
        winner = "Bot 2";
        reward = CHEST_VALUES[bestChoice];
        setBot2Gold(prev => prev + reward);
        
        // Увеличиваем серию побед только если в банке достаточно монет
        setWinStreak(prev => ({
          ...prev,
          You: 0,
          "Bot 1": 0,
          "Bot 2": bankGold >= BANK_THRESHOLD ? prev["Bot 2"] + 1 : 0
        }));
      }

      // 🏆 Если игрок выиграл 3 раза подряд – он забирает БАНК
      distributeBankGoldToWinner(winner);

      // Остаток монет уходит в БАНК
      const remainingGold = totalBet - reward;
      setBankGold(prev => {
        const newBankGold = prev + remainingGold;
        // Проверяем, не пора ли банку распределить монеты
        if (newBankGold > BANK_THRESHOLD) {
          // Банк будет распределять монеты в следующем раунде
          addToLog(`📢 Банк готовится распределить монеты!`);
        }
        if (newBankGold >= 0 && bankInDebt) {
          setBankInDebt(false);
          addToLog(`✅ Банк вышел из минуса! Текущий баланс: ${newBankGold}`);
        }
        return newBankGold;
      });
    } else {
      // Нет уникальных выборов, все монеты уходят в банк
      setBankGold(prev => {
        const newBankGold = prev + totalBet;
        // Проверяем, не пора ли банку распределить монеты
        if (newBankGold > BANK_THRESHOLD) {
          // Банк будет распределять монеты в следующем раунде
          addToLog(`📢 Банк готовится распределить монеты!`);
        }
        if (newBankGold >= 0 && bankInDebt) {
          setBankInDebt(false);
          addToLog(`✅ Банк вышел из минуса! Текущий баланс: ${newBankGold}`);
        }
        return newBankGold;
      });
      
      // Сбрасываем серии побед для всех игроков
      setWinStreak({
        You: 0,
        "Bot 1": 0,
        "Bot 2": 0
      });
      
      // Добавляем сообщение в лог
      addToLog("Ничья! Все серии побед сброшены.");
    }

    // Обновляем результаты
    setResults({
      winner,
      playerChoice,
      botChoices: [bot1Choice, bot2Choice],
      reward
    });

    setLoading(false);
  };

  const startNewRound = () => {
    setResults(null);
    setGameActive(true);
  };

  return (
    <div>
      {/* 🎯 Игровая доска */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-amber-100 rounded-lg">
        {[1, 2, 3].map(chest => (
          <button
            key={chest}
            onClick={() => handleChestSelect(chest)}
            disabled={!gameActive || loading}
            className={`
              p-6 rounded-lg shadow-lg flex flex-col items-center justify-center
              ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${!gameActive ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-300'}
              bg-amber-400 text-amber-900 transition-all
            `}
          >
            <Treasure className="h-12 w-12 mb-2" />
            <span className="font-bold">Сундук {chest}</span>
            <span className="text-sm">({CHEST_VALUES[chest]} монет)</span>
          </button>
        ))}
      </div>

      {results && (
        <div className="flex justify-center mt-6">
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
        <h2 className="text-lg font-bold">🏦 Банк: {bankGold} монет {bankInDebt && "🚨"}</h2>
        {bankGold >= BANK_THRESHOLD && <p className="text-red-500 font-semibold">🔥 Банк теперь можно выиграть!</p>}
        {bankInDebt && <p className="text-red-500 font-semibold">🚨 Банк в минусе!</p>}
      </div>

      {/* 🌟 Общий счёт + текущий раунд */}
      <div className="mt-6 p-6 bg-gray-100 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Общий счёт (слева) */}
        <div className="text-center">
          <h2 className="text-lg font-bold mb-2">💰 Общий счёт</h2>
          <ul className="text-sm text-gray-700">
            <li className={`py-1 ${playerGold < 0 ? "text-red-500" : ""}`}>
              You: {playerGold} монет{" "}
              {winStreak.You >= 3 ? "🔥🔥🔥" : winStreak.You === 2 ? "🔥🔥" : bankGold >= BANK_THRESHOLD ? `(🔥 ${winStreak.You} побед подряд)` : ""}
            </li>
            <li className={`py-1 ${bot1Gold < 0 ? "text-red-500" : ""}`}>
              Bot 1: {bot1Gold} монет{" "}
              {winStreak["Bot 1"] >= 3 ? "🔥🔥🔥" : winStreak["Bot 1"] === 2 ? "🔥🔥" : bankGold >= BANK_THRESHOLD ? `(🔥 ${winStreak["Bot 1"]} побед подряд)` : ""}
            </li>
            <li className={`py-1 ${bot2Gold < 0 ? "text-red-500" : ""}`}>
              Bot 2: {bot2Gold} монет{" "}
              {winStreak["Bot 2"] >= 3 ? "🔥🔥🔥" : winStreak["Bot 2"] === 2 ? "🔥🔥" : bankGold >= BANK_THRESHOLD ? `(🔥 ${winStreak["Bot 2"]} побед подряд)` : ""}
            </li>
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
                <li key={index}>🤖 Бот {index + 1} выбрал сундук {choice}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 🌟 Описание игры */}
      <div className="mt-6 p-6 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-center mb-2">Как играть:</h2>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>• Вы играете против 2 ботов</li>
          <li>• В каждом сундуке разное количество золота: 35, 50, 75 монет</li>
          <li>• Если только вы выбрали самый ценный сундук, вы получаете золото</li>
          <li>• Если несколько игроков выбрали один и тот же сундук, никто не получает золото</li>
          <li className="font-semibold">• 💰 Стоимость участия в раунде: {GAME_COST} монет</li>
          <li>• 🏦 <span className="font-semibold">Банк</span>: неразыгранные монеты попадают в банк</li>
          <li>• 🔥 Когда в банке накапливается {BANK_THRESHOLD} монет, его можно выиграть</li>
          <li>• 🏆 Серия побед начинает считаться только тогда, когда в банке есть хотя бы {BANK_THRESHOLD} монет</li>
          <li>• 🏆 При серии из 3 побед подряд игрок забирает весь банк</li>
          <li>• 🏆 Чтобы забрать банк, нужно <span className="font-semibold">выиграть 3 раза подряд</span></li>
        </ul>
      </div>
      
      {/* 🌟 Журнал игры */}
      <div className="mt-6 p-6 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-center mb-2">Журнал игры:</h2>
        <ul className="text-sm space-y-1 text-gray-700">
          {gameLog.map((log, index) => (
            <li key={index}>{log}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ThreePlayersGame; 