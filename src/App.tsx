const express = require('express');
const serverless = require('serverless-http');

const app = express();
app.use(express.json());

const router = express.Router();

const CHEST_VALUES = { 1: 10, 2: 20, 3: 50, 4: 100 }; // Количество золота в сундуках

router.post('/game/play', (req, res) => {
  try {
    console.log("Received request body:", req.body);

    const playerChoice = Number(req.body.playerChoice);
    console.log("Parsed playerChoice:", playerChoice, "Type:", typeof playerChoice);

    if (![1, 2, 3, 4].includes(playerChoice)) {
      console.error("Error: Invalid choice");
      return res.status(400).json({ error: 'Invalid choice. Choose a chest from 1 to 4.' });
    }

    // Боты делают случайный выбор сундуков
    const botChoices = [
      Math.ceil(Math.random() * 4),
      Math.ceil(Math.random() * 4),
      Math.ceil(Math.random() * 4),
    ];

    const allChoices = [playerChoice, ...botChoices];

    // Подсчёт количества выборов каждого сундука
    const choiceCount = {};
    allChoices.forEach(choice => {
      choiceCount[choice] = (choiceCount[choice] || 0) + 1;
    });

    console.log("Choice counts:", choiceCount);

    // Определяем, выбрал ли игрок уникальный сундук
    let winner = "No winner";
    let reward = 0;

    // Выигрывает только тот, кто выбрал сундук один
    if (choiceCount[playerChoice] === 1) {
      winner = "You";
      reward = CHEST_VALUES[playerChoice]; // Награда = золото в сундуке
    }

    res.json({
      success: true,
      playerChoice,
      botChoices,
      winner,
      reward, // Отправляем точное количество золота как награду
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.use('/api', router);

module.exports.handler = serverless(app);
