import React from 'react';

const ResultsPanel = ({ results, onNewRound }) => {
  console.log("Received results in ResultsPanel:", results); // Логируем данные

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
