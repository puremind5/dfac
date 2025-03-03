const express = require('express');
const serverless = require('serverless-http');

const app = express();
app.use(express.json());

const router = express.Router();

router.post('/game/play', (req, res) => {
  try {
    console.log("Received request body:", req.body);

    // Проверяем, что playerChoice передан корректно
    if (!req.body || !("playerChoice" in req.body)) {
      console.error("Error: No playerChoice received");
      return res.status(400).json({ error: 'Invalid request. No playerChoice provided.' });
    }

    // Преобразуем в число (исправляем проблему с "0")
    let playerChoice = Number(req.body.playerChoice);
    
    console.log("Parsed playerChoice:", playerChoice, "Type:", typeof playerChoice);

    // Проверяем, что playerChoice действительно 1, 2, 3 или 4
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
