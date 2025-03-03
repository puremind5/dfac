import React, { useState } from 'react';
import Confetti from 'react-confetti';
import { Trash as Treasure } from 'lucide-react';
import GameBoard from './components/GameBoard';
import { useWindowSize } from 'react-use';

const CHEST_VALUES = { 1: 10, 2: 20, 3: 50, 4: 100 };
const GAME_COST = 20; // 💰 Стоимость каждой игры

function App() {
  const { width, height } = useWindowSize(); // Получаем размеры экрана для конфетти
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [gameActive, setGameActive] = useState<boolean>(true);
  const [showConfetti, setShowConfetti] = useState<boolean>(false); // 🎉 Флаг для показа конфетти

  // 🌟 Сохраняем золото для игрока и ботов
  const [totalGold, setTotalGold] = useState<{ [key: string]: number }>({
    You: 100, // Начальный баланс игрока
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

      // 💰 Вычитаем стоимость игры у всех игроков (игрока и ботов)
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

      // 🌟 Если игрок выиграл, запускаем конфетти и обновляем золото
      if (data.winner === "You") {
        setShowConfetti(true); // 🎉 Показываем конфетти
        setTimeout(() => setShowConfetti(false), 3000); // Через 3 секунды убираем конфетти

        setTotalGold(prevGold => ({
          ...prevGold,
          You: prevGold["You"] + data.reward,
        }));
      }

      // Если выиграл бот, обновляем его золото
      if (data.winner.includes("Bot")) {
        setTotalGold(prevGold => ({
          ...prevGold,
          [data.winner]: prevGold[data.winner] + data.reward,
        }));
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
      {showConfetti && <Confetti width={width} height={height} />} {/* 🎉 Конфетти */}

      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden p-6">
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-6">
          <div className="flex items-center justify-center">
            <Treasure className="h-10 w-10 text-yellow-100 mr-3" />
            <h1 className="text-3xl font-bold text-white">Охота за сокровищами</h1>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* 🌟 Описание игры */}
        <div className="mt-6 p-6 bg-gray-100 rounded-lg shadow-md min-h-[150px] flex flex-col justify-center">
          <h2 className="text-xl font-bold text-center mb-2">Как играть:</h2>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>• Вы играете против 3 ботов</li>
            <li>• В каждом сундуке разное количество золота: 10, 20, 50 или 100 монет</li>
            <li>• Если только вы выбрали самый ценный сундук, вы получаете золото</li>
            <li>• Если несколько игроков выбрали один и тот же сундук, никто не получает золото</li>
            <li className="font-semibold">• 💰 Стоимость участия в раунде: {GAME_COST} монет</li>
          </ul>
        </div>

        {/* 🎯 Игровая доска */}
        <GameBoard onChestSelect={handleChestSelect} loading={loading} gameActive={gameActive} />

        {/* 🌟 Общий счёт + результаты текущего раунда в одном блоке */}
        <div className="mt-6 p-6 bg-gray-100 rounded-lg shadow-md grid grid-cols-2 gap-4">
          {/* Левая колонка: Общий счёт */}
          <div className="text-center">
            <h2 className="text-lg font-bold mb-2">💰 Общий счёт</h2>
            <ul className="text-sm text-gray-700">
              {Object.entries(totalGold).map(([player, gold]) => (
                <li key={player} className={`py-1 ${gold < 0 ? "text-red-500" : ""}`}>
                  {player}: {gold} монет
                </li>
              ))}
            </ul>
          </div>

          {/* Правая колонка: Результаты текущей игры */}
          <div className="text-center">
            <h2 className="text-lg font-bold mb-2">🎲 Текущий раунд</h2>
            {results ? (
              <>
                <p className="text-lg font-semibold">
                  {results.winner === "You" ? `🎉 Вы выиграли ${results.reward} золота! 💰` 
                    : results.winner.includes("Bot") ? `🤖 ${results.winner} выиграл ${results.reward} золота!` 
                    : "Никто не выиграл в этом раунде."}
                </p>
                <button 
                  className="mt-4 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition"
                  onClick={startNewRound}
                >
                  Играть снова
                </button>
              </>
            ) : (
              <p className="text-gray-500">Выберите сундук, чтобы начать игру</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;

