import React, { useState } from 'react';
import { Trash as Treasure, Trophy, RefreshCw, User, Bot } from 'lucide-react';
import GameBoard from './components/GameBoard';
import ResultsPanel from './components/ResultsPanel';

function App() {
  const [gameState, setGameState] = useState<'choosing' | 'results'>('choosing');
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
        body: JSON.stringify({ playerChoice: Number(chestIndex + 1) }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response in App.tsx:", data); // Логируем ответ API

      if (!data || typeof data !== 'object' || !Array.isArray(data.results)) {
        throw new Error("Invalid response format");
      }

      setResults(data.results); // Передаём только массив results!
      setGameState('results');
    } catch (err) {
      setError('Failed to connect to the game server');
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const startNewRound = () => {
    setGameState('choosing');
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-6">
          <div className="flex items-center justify-center">
            <Treasure className="h-10 w-10 text-yellow-100 mr-3" />
            <h1 className="text-3xl font-bold text-white">Treasure Hunt</h1>
          </div>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {gameState === 'choosing' ? (
            <GameBoard onChestSelect={handleChestSelect} loading={loading} />
          ) : (
            <>
              {console.log("Results data in App.tsx:", results)}
              <ResultsPanel results={results} onNewRound={startNewRound} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
