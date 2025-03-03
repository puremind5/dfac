const express = require('express');
const serverless = require('serverless-http');

const app = express();
app.use(express.json());

// Добавляем `router` перед его использованием
const router = express.Router();

// GET-запрос для проверки API
router.get('/game/play', (req, res) => {
  res.json({ message: "Game API is working! Use POST to play." });
});

// POST-запрос для игры
router.post('/game/play', (req, res) => {
  try {
    console.log("Received request body:", req.body);

    const playerChoice = Number(req.body.playerChoice);
    console.log("Parsed playerChoice:", playerChoice, "Type:", typeof playerChoice);

    if (![1, 2, 3, 4].includes(playerChoice)) {
      console.error("Error: Invalid choice");
      return res.status(400).json({ error: 'Invalid choice. Choose a chest from 1 to 4.' });
    }

    const resultsData = [
      { player: "You", choice: playerChoice, points: 50 },
      { player: "Bot 1", choice: 2, points: 20 },
      { player: "Bot 2", choice: 3, points: 30 },
      { player: "Bot 3", choice: 4, points: 40 },
    ];

    res.json({
      success: true,
      results: resultsData, // Гарантируем, что `results` всегда массив
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Подключаем `router` к Express
app.use('/api', router);

module.exports.handler = serverless(app);
