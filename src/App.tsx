import React, { useState } from 'react';
import { Trash as Treasure } from 'lucide-react';
import GameBoard from './components/GameBoard';
import ResultsPanel from './components/ResultsPanel';

const CHEST_VALUES = { 0: 10, 1: 20, 2: 50, 3: 100 };

function App() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChestSelect = async (chestIndex: number) => {
    try {
      setLoading(true);
      setError(null);

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
    } catch (err) {
      setError('Failed to connect to the game server');
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const startNewRound = () => {
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden p-6">
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-6">
          <div className="flex items-center justify-center">
            <Treasure className="h-10 w-10 text-yellow-100 mr-3" />
            <h1 className="text-3xl font-bold text-white">Treasure Hunt</h1>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Игровая доска (сундуки остаются видимыми) */}
        <GameBoard onChestSelect={handleChestSelect} loading={loading} />

        {/* Показываем результаты под сундуками, если игра завершилась */}
        {results && <ResultsPanel results={results} onNewRound={startNewRound} />}
      </div>
    </div>
  );
}

export default App;
