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

    const botChoices = [
      Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 4),
    ];

    const allChoices = [playerChoice, ...botChoices];

    const choiceCount = {};
    allChoices.forEach(choice => {
      choiceCount[choice] = (choiceCount[choice] || 0) + 1;
    });

    let winner = "No winner";
    let reward = 0;

    if (choiceCount[playerChoice] === 1) {
      winner = "You";
      reward = CHEST_VALUES[playerChoice];
    }

    res.json({ success: true, playerChoice, botChoices, winner, reward });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.use('/api', router);

module.exports.handler = serverless(app);
