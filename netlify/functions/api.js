const express = require('express');
const serverless = require('serverless-http');

const app = express();
app.use(express.json());

const router = express.Router();

// Маршрут для теста API
router.get('/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

// Игровая логика: обработка выбора сундуков
router.post('/game/play', (req, res) => {
  console.log("Received request body:", req.body); // Логируем входные данные

  const playerChoice = Number(req.body.playerChoice);
  console.log("Parsed playerChoice:", playerChoice); // Логируем результат преобразования

  if (!Number.isInteger(playerChoice) || ![1, 2, 3, 4].includes(playerChoice)) {
    console.log("Invalid choice, sending 400 error");
    return res.status(400).json({ error: 'Invalid choice. Choose a chest from 1 to 4.' });
  }

  res.json({ message: `You selected chest ${playerChoice}` });
});



  // Боты делают выбор случайно
  const botChoices = [
    Math.ceil(Math.random() * 4),
    Math.ceil(Math.random() * 4),
    Math.ceil(Math.random() * 4)
  ];

  const allChoices = [playerChoice, ...botChoices];
  const chestValues = { 1: 10, 2: 20, 3: 50, 4: 100 };

  // Определяем победителя
  const uniqueChoices = allChoices.filter(
    (choice, _, arr) => arr.indexOf(choice) === arr.lastIndexOf(choice)
  );

  let winner = null;
  let maxScore = 0;

  if (uniqueChoices.length > 0) {
    winner = uniqueChoices.reduce((best, choice) => 
      chestValues[choice] > maxScore ? choice : best, 0
    );
    maxScore = chestValues[winner];
  }

  res.json({
    playerChoice,
    botChoices,
    winner: winner || 'No winner',
    points: maxScore
  });
});

app.use('/api', router);

module.exports.handler = serverless(app);
