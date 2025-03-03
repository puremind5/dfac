import React from 'react';

const ResultsPanel: React.FC<{ results: any; onNewRound: () => void }> = ({ results, onNewRound }) => {
  console.log("Received results in ResultsPanel:", results);

  if (!results || typeof results !== 'object') {
    return <div className="text-center text-red-500">Error: No valid results</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-center">Game Results</h2>

      <div className="bg-gray-100 p-4 rounded-lg shadow">
        <p className="text-center text-lg font-bold">
          {results.winner === "You" ? `🎉 You won ${results.reward} gold! 💰` : "No one won this round."}
        </p>
      </div>

      {/* Вывод результатов каждого игрока */}
      <div className="mt-4">
        <h3 className="text-lg font-bold text-center mb-2">Player Choices</h3>
        <ul className="bg-white p-4 rounded-lg shadow-md">
          <li className="font-semibold">🧑 You chose chest {results.playerChoice}</li>
          {results.botChoices.map((choice: number, index: number) => (
            <li key={index}>🤖 Bot {index + 1} chose chest {choice}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex justify-center">
        <button 
          className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition"
          onClick={onNewRound}
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default ResultsPanel;
