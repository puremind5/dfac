const express = require('express');
const serverless = require('serverless-http');

const app = express();
app.use(express.json());

const router = express.Router();

// Игровая логика
router.post('/game/play', (req, res) => {
  res.json({ message: 'Game logic will be here!' });
});

// Другие маршруты API
router.get('/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

app.use('/.netlify/functions/api', router);

module.exports.handler = serverless(app);