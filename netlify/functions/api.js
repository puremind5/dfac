const express = require('express');
const serverless = require('serverless-http');

const app = express();
app.use(express.json());

const router = express.Router();

router.post('/game/play', (req, res) => {
  try {
    console.log("Received request body:", req.body);

    if (!req.body || typeof req.body.playerChoice === 'undefined') {
      console.error("Error: No playerChoice received");
      return res.status(400).json({ error: 'Invalid request. No playerChoice provided.' });
    }

    // Преобразуем в число (исправляем баг с 0)
    let playerChoice = Number(req.body.playerChoice);
    
    console.log("Parsed playerChoice:", playerChoice, "Type:", typeof playerChoice);

    // Проверяем, является ли playerChoice допустимым значением
    if (![1, 2, 3, 4].includes(playerChoice)) {
      console.error("Error: Invalid choice");
      return res.status(400).json({ error: 'Invalid choice. Choose a chest from 1 to 4.' });
    }

    res.json({ message: `You selected chest ${playerChoice}` });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.use('/api', router);

module.exports.handler = serverless(app);
