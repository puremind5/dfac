const express = require('express');
const serverless = require('serverless-http');

const app = express();
app.use(express.json());

const router = express.Router();

const CHEST_VALUES = { 0: 10, 1: 20, 2: 50, 3: 100 };

router.post('/game/play', (req, res) => {
  try {
    console.log("Received request body:", req.body);

    const playerChoice = Number(req.body.playerChoice);
    console.log("Parsed playerChoice:", playerChoice, "Type:", typeof playerChoice);

    if (![0, 1, 2, 3].includes(playerChoice)) {
      return res.status(400).json({ error: 'Invalid choice. Choose a chest from 0 to 3.' });
    }

    // Боты делают случайный выбор сундуков
    const botChoices = [
      Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 4),
    ];

    const allChoices = [playerChoice, ...botChoices];

    // Подсчёт количества выборов каждого сундука
    const choiceCount = {};
    allChoices.forEach(choice => {
      choiceCount[choice] = (choiceCount[choice] || 0) + 1;
    });

    console.log("Choice counts:", choiceCount);

    // Находим уникальные выборы (сундуки, которые выбраны только одним игроком/ботом)
    const uniqueChoices = Object.keys(choiceCount)
      .map(Number)
      .filter(choice => choiceCount[choice] === 1);

    let winner = "No winner";
    let reward = 0;

    if (uniqueChoices.length > 0) {
      // Выбираем самый дорогой уникальный сундук
      const bestChoice = uniqueChoices.reduce((best, choice) => 
        CHEST_VALUES[choice] > CHEST_VALUES[best] ? choice : best, uniqueChoices[0]);

      console.log("Best unique choice:", bestChoice);

      // Если этот сундук выбрал игрок — он выигрывает
      if (playerChoice === bestChoice) {
        winner = "You";
        reward = CHEST_VALUES[bestChoice];
      }
    }

    res.json({ success: true, playerChoice, botChoices, winner, reward });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.use('/api', router);

module.exports.handler = serverless(app);
