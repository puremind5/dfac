// Переключение на ESM синтаксис для соответствия package.json (type: "module")
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Получаем текущую директорию
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Инициализация Express
const app = express();
const PORT = process.env.PORT || 3000;

// Промежуточное ПО (middleware)
app.use(cors());
app.use(express.json());

// Значения сундуков
const CHEST_VALUES = { 1: 35, 2: 50, 3: 70, 4: 100 };

// Импортируем API через адаптер
let apiHandler;
try {
  // Используем специальный формат импорта для CommonJS модулей из ESM
  apiHandler = await import('./api-adapter.cjs');
  console.log('🔌 API-обработчик успешно загружен через адаптер');
} catch (error) {
  console.error('❌ Ошибка при загрузке API-обработчика:', error);
  // Продолжаем выполнение без ошибки, используя заглушки API
}

// Создаем простой API для тестирования, если основной API не загрузился
app.get('/api/test', (req, res) => {
  res.json({ message: 'API server is running' });
});

// Маршрут для игры
app.post('/api/game/play', async (req, res) => {
  try {
    console.log('📲 Получен запрос на игру:', req.body);
    
    const playerChoice = Number(req.body.playerChoice);
    if (![1, 2, 3, 4].includes(playerChoice)) {
      return res.status(400).json({ error: 'Invalid choice. Choose a chest from 1 to 4.' });
    }
    
    // Если API загружен корректно, используем его
    if (apiHandler && apiHandler.default && apiHandler.default.handler) {
      // Создаем объект события, который ожидает Netlify Function
      const event = {
        path: req.path,
        httpMethod: req.method,
        headers: req.headers,
        body: JSON.stringify(req.body),
        queryStringParameters: req.query
      };

      // Вызываем обработчик API
      try {
        const response = await apiHandler.default.handler(event);
        // Отправляем ответ
        const responseBody = JSON.parse(response.body);
        return res.status(response.statusCode).json(responseBody);
      } catch (apiError) {
        console.error('⚠️ Ошибка вызова API, использую заглушку:', apiError);
        // Если ошибка в API, используем заглушку
      }
    }
    
    // Если API не загружен или возникла ошибка, используем заглушку
    console.log('⚠️ Используется игровая заглушка API');
    
    // Боты делают случайный выбор сундуков (1-4)
    const botChoices = [
      Math.ceil(Math.random() * 4),
      Math.ceil(Math.random() * 4),
      Math.ceil(Math.random() * 4),
    ];

    // Подсчёт количества выборов каждого сундука
    const allChoices = [playerChoice, ...botChoices];
    const choiceCount = {};
    allChoices.forEach(choice => {
      choiceCount[choice] = (choiceCount[choice] || 0) + 1;
    });

    console.log("Выборы игроков:", allChoices, "Подсчет:", choiceCount);

    // Определяем уникальные выборы (сундуки, которые выбраны только одним игроком/ботом)
    const uniqueChoices = Object.keys(choiceCount)
      .map(Number)
      .filter(choice => choiceCount[choice] === 1);

    let winner = "No winner";
    let reward = 0;

    if (uniqueChoices.length > 0) {
      // Выбираем самый дорогой уникальный сундук
      const bestChoice = uniqueChoices.reduce((best, choice) => 
        CHEST_VALUES[choice] > CHEST_VALUES[best] ? choice : best, uniqueChoices[0]);

      console.log("Лучший уникальный выбор:", bestChoice);

      // Проверяем, кто выбрал этот сундук
      if (playerChoice === bestChoice) {
        winner = "You";
      } else {
        const botIndex = botChoices.indexOf(bestChoice);
        if (botIndex !== -1) {
          winner = `Bot ${botIndex + 1}`;
        }
      }

      reward = CHEST_VALUES[bestChoice];
    }

    const result = { 
      success: true, 
      playerChoice, 
      botChoices, 
      winner, 
      reward 
    };
    
    console.log("Результат игры:", result);
    return res.json(result);
  } catch (error) {
    console.error('❌ Ошибка при обработке запроса игры:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Общий маршрут API для других запросов
app.use('/api/*', async (req, res) => {
  try {
    // Проверяем, есть ли обработчик
    if (!apiHandler || !apiHandler.default || !apiHandler.default.handler) {
      throw new Error('API handler not found or not properly loaded');
    }

    // Создаем объект события, который ожидает Netlify Function
    const event = {
      path: req.path,
      httpMethod: req.method,
      headers: req.headers,
      body: JSON.stringify(req.body),
      queryStringParameters: req.query
    };

    // Вызываем обработчик API
    const response = await apiHandler.default.handler(event);
    
    // Отправляем ответ
    res.status(response.statusCode).set(response.headers).send(response.body);
  } catch (error) {
    console.error('❌ Ошибка при обработке запроса:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Локальный API-сервер запущен на порту ${PORT}`);
  console.log(`📌 API доступно по адресу: http://localhost:${PORT}/api/`);
  console.log(`📌 Тестовый API доступен по адресу: http://localhost:${PORT}/api/test`);
}); 