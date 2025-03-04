import React, { useState } from 'react';
import { Trash as Treasure } from 'lucide-react';
import GameBoard from './components/GameBoard';

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
    "Bot 1": 0,
    "Bot 2": 0,
    "Bot 3": 0,
  });

  // 🌟 Баланс игроков
  const [totalGold, setTotalGold] = useState<{ [key: string]: number }>({
    You: 100,
    "Bot 1": 100,
    "Bot 2": 100,
    "Bot 3": 100,
  });

  const handleChestSelect = async (chestIndex: number) => {
    if (!gameActive) return;

    try {
      setLoading(true);
      setError(null);
      setGameActive(false);

      // 💰 Все игроки платят за вход в игру (100 монет суммарно)
      setTotalGold(prevGold => ({
        You: prevGold["You"] - GAME_COST,
        "Bot 1": prevGold["Bot 1"] - GAME_COST,
        "Bot 2": prevGold["Bot 2"] - GAME_COST,
        "Bot 3": prevGold["Bot 3"] - GAME_COST,
      }));

      const response = await fetch('/api/game/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerChoice: chestIndex }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response in App.tsx:", data);

      if (!data || typeof data !== 'object' || !('winner' in data)) {
        throw new Error("Invalid response format");
      }

      setResults(data);

      const totalCollected = 100; // 4 игрока по 25 монет
      let totalPaidOut = data.winner !== "No winner" ? data.reward : 0;

      // 🌟 Если кто-то выиграл, добавляем золото к его балансу
      if (data.winner !== "No winner") {
        setTotalGold(prevGold => ({
          ...prevGold,
          [data.winner]: (prevGold[data.winner] || 0) + data.reward,
        }));

        // 📌 Увеличиваем серию побед ТОЛЬКО если банк достиг 100 монет
        setWinStreak(prevStreak => ({
          ...prevStreak,
          [data.winner]: bank >= BANK_THRESHOLD ? (prevStreak[data.winner] || 0) + 1 : 0,
        }));

        // 🏆 Если игрок выиграл 3 раза подряд – он забирает БАНК
        if (bank >= BANK_THRESHOLD && winStreak[data.winner] + 1 === 3) {
          setTotalGold(prevGold => ({
            ...prevGold,
            [data.winner]: prevGold[data.winner] + bank,
          }));
          setBank(0); // 🔥 БАНК очищается после выигрыша
        }
      } else {
        setWinStreak({ You: 0, "Bot 1": 0, "Bot 2": 0, "Bot 3": 0 }); // ❌ Победная серия сбрасывается
      }

      // 📌 В банк отправляется ТОЛЬКО неразыгранные монеты
      const leftover = totalCollected - totalPaidOut;
      if (leftover > 0) {
        setBank(prevBank => prevBank + leftover);
      }

    } catch (err) {
      setError('Failed to connect to the game server');
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const startNewRound = () => {
    setResults(null);
    setGameActive(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden p-6">
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-6">
          <div className="flex items-center justify-center">
            <Treasure className="h-10 w-10 text-yellow-100 mr-3" />
            <h1 className="text-3xl font-bold text-white">Охота за сокровищами</h1>
          </div>
        </div>

        {/* 🌟 Описание игры */}
        <div className="mt-6 p-6 bg-gray-100 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-center mb-2">Как играть:</h2>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>• Вы играете против 3 ботов</li>
            <li>• В каждом сундуке разное количество золота: 35, 50, 70 или 100 монет</li>
            <li>• Если только вы выбрали самый ценный сундук, вы получаете золото</li>
            <li>• Если несколько игроков выбрали один и тот же сундук, никто не получает золото</li>
            <li className="font-semibold">• 💰 Стоимость участия в раунде: {GAME_COST} монет</li>
          </ul>
        </div>

        {/* 🎯 Игровая доска */}
        <GameBoard onChestSelect={handleChestSelect} loading={loading} gameActive={gameActive} />

        {/* 🌟 Банк */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-md text-center">
          <h2 className="text-lg font-bold">🏦 Банк: {bank} монет</h2>
          {bank >= BANK_THRESHOLD && <p className="text-red-500 font-semibold">🔥 Банк теперь можно выиграть!</p>}
        </div>

        {/* 🌟 Общий счёт + текущий раунд (как было) */}
        <div className="mt-6 p-6 bg-gray-100 rounded-lg shadow-md grid grid-cols-2 gap-4">
          <div className="text-center">
            <h2 className="text-lg font-bold mb-2">💰 Общий счёт</h2>
            <ul className="text-sm text-gray-700">
              {Object.entries(totalGold).map(([player, gold]) => (
                <li key={player} className={`py-1 ${gold < 0 ? "text-red-500" : ""}`}>
                  {player}: {gold} монет {bank >= BANK_THRESHOLD ? `(🔥 ${winStreak[player]} побед подряд)` : ""}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;


