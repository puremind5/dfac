import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Game state
const chestValues = [10, 20, 50, 100];
const botNames = ['Bot Alex', 'Bot Max', 'Bot Eva'];

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// Game routes
app.post('/api/game/play', (req, res) => {
  const { playerChoice } = req.body;
  
  if (playerChoice === undefined || playerChoice < 0 || playerChoice > 3) {
    return res.status(400).json({ error: 'Invalid player choice' });
  }
  
  // Generate bot choices
  const botChoices = botNames.map(() => Math.floor(Math.random() * 4));
  
  // Calculate results
  const results = calculateResults(playerChoice, botChoices);
  
  res.json(results);
});

function calculateResults(playerChoice, botChoices) {
  const allChoices = [playerChoice, ...botChoices];
  const choiceCounts = {};
  
  // Count how many players chose each chest
  allChoices.forEach(choice => {
    choiceCounts[choice] = (choiceCounts[choice] || 0) + 1;
  });
  
  // Determine valid chests (chosen by only one player)
  const validChests = {};
  for (let i = 0; i < allChoices.length; i++) {
    const choice = allChoices[i];
    if (choiceCounts[choice] === 1) {
      validChests[i] = choice;
    }
  }
  
  // Find the winner (player with highest value valid chest)
  let winnerIndex = -1;
  let highestValue = -1;
  
  Object.entries(validChests).forEach(([playerIndex, chestIndex]) => {
    const value = chestValues[chestIndex];
    if (value > highestValue) {
      highestValue = value;
      winnerIndex = parseInt(playerIndex);
    }
  });
  
  // Prepare player data
  const players = [
    { name: 'You', choice: playerChoice },
    ...botNames.map((name, index) => ({ 
      name, 
      choice: botChoices[index] 
    }))
  ];
  
  return {
    players,
    chestValues,
    winner: winnerIndex,
    score: winnerIndex === 0 ? chestValues[playerChoice] : 0,
    validChests
  };
}

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});