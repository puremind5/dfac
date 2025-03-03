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
    console.log("API Response in App.tsx:", data); // Логируем данные

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

