const path = require('path');
const fs = require('fs');
const netlifyApiPath = path.join(__dirname, '..', 'netlify', 'functions', 'api.js');

// Значения сундуков
const CHEST_VALUES = { 1: 35, 2: 50, 3: 70, 4: 100 };

// Загружаем API из файла Netlify Function
let api;
try {
  api = require(netlifyApiPath);
  console.log('✅ Netlify API успешно загружен');
} catch (error) {
  console.error('❌ Ошибка при загрузке Netlify API:', error);
  // Создаем игровую заглушку API
  api = {
    handler: async (event) => {
      try {
        // Обрабатываем только игровые запросы
        if (event.path.includes('/api/game/play')) {
          const body = JSON.parse(event.body || '{}');
          const playerChoice = Number(body.playerChoice || 0);
          
          if (![1, 2, 3, 4].includes(playerChoice)) {
            return {
              statusCode: 400,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ error: 'Invalid choice. Choose a chest from 1 to 4.' })
            };
          }
          
          // Боты делают случайный выбор
          const botChoices = [
            Math.ceil(Math.random() * 4),
            Math.ceil(Math.random() * 4),
            Math.ceil(Math.random() * 4),
          ];
          
          // Считаем количество выборов
          const allChoices = [playerChoice, ...botChoices];
          const choiceCount = {};
          allChoices.forEach(choice => {
            choiceCount[choice] = (choiceCount[choice] || 0) + 1;
          });
          
          // Уникальные выборы
          const uniqueChoices = Object.keys(choiceCount)
            .map(Number)
            .filter(choice => choiceCount[choice] === 1);
            
          let winner = "No winner";
          let reward = 0;
          
          if (uniqueChoices.length > 0) {
            // Самый дорогой уникальный сундук
            const bestChoice = uniqueChoices.reduce((best, choice) => 
              CHEST_VALUES[choice] > CHEST_VALUES[best] ? choice : best, uniqueChoices[0]);
              
            // Кто выбрал этот сундук?
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
          
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result)
          };
        } else {
          // Для других API запросов
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              message: 'API заглушка работает',
              path: event.path,
              method: event.httpMethod
            })
          };
        }
      } catch (error) {
        console.error('Error in API stub:', error);
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Internal Server Error' })
        };
      }
    }
  };
}

// Экспортируем API для использования в ESM модуле
module.exports = api; 