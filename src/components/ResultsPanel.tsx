import React from 'react';

const ResultsPanel: React.FC<{ results: any; onNewRound: () => void }> = ({ results, onNewRound }) => {
  console.log("Received results in ResultsPanel:", results);

  return (
    <div className="p-6 mt-6 min-h-[180px] flex flex-col justify-center items-center bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center">Результаты игры</h2>

      {/* Фиксированное место для результатов */}
      <div className="min-h-[100px] flex flex-col justify-center">
        {results ? (
          <>
            <p className="text-center text-lg font-bold">
              {results.winner === "You" ? `🎉 Вы выиграли ${results.reward} золота! 💰` 
                : results.winner.includes("Bot") ? `🤖 ${results.winner} выиграл ${results.reward} золота!` 
                : "Никто не выиграл в этом раунде."}
            </p>

            {/* Вывод результатов каждого игрока */}
            <div className="mt-4">
              <h3 className="text-lg font-bold text-center mb-2">Выбор игроков</h3>
              <ul className="bg-white p-4 rounded-lg shadow-md">
                <li className="font-semibold">🧑 Вы выбрали сундук {results.playerChoice}</li>
                {results.botChoices.map((choice: number, index: number) => (
                  <li key={index}>🤖 Бот {index + 1} выбрал сундук {choice}</li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500">Ожидаем результатов...</p>
        )}
      </div>

      <div className="mt-4 flex justify-center">
        <button 
          className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition"
          onClick={onNewRound}
        >
          Играть снова
        </button>
      </div>
    </div>
  );
};

export default ResultsPanel;
