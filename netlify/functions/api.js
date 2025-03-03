const express = require('express');
const serverless = require('serverless-http');

const app = express();
app.use(express.json());

const router = express.Router();

router.get('/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

app.use('/api', router);

module.exports.handler = serverless(app);
