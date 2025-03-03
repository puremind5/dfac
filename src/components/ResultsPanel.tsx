import React from 'react';

const ResultsPanel = ({ results, onNewRound }) => {
  console.log("Received results in ResultsPanel:", results); // Логируем данные

  // Проверяем, что results существует и содержит массив
  if (!results || !Array.isArray(results)) {
    return <div className="text-center text-red-500">Error: No valid results</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-center">Game Results</h2>
      <ul className="bg-gray-100 p-4 rounded-lg shadow">
        {results.map((result, index) => (
          <li key={index} className="border-b py-2 last:border-b-0 text-center">
            <span className="font-semibold">{result.player}</span> chose chest {result.choice} and scored <span className="font-semibold">{result.points}</span> points.
          </li>
        ))}
      </ul>
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
