# Правила игры "Охота за сокровищами"

## 1. Основные сущности

### Игроки
- **Игрок (You)** - управляется пользователем
- **Боты** - три управляемых компьютером игрока:
  - Алиса
  - Олег
  - Сири

### Сундуки
| Номер сундука | Ценность (золото) |
|---------------|-------------------|
| 1             | 35                |
| 2             | 50                |
| 3             | 70                |
| 4             | 100               |

## 2. Фазы игры

### Фаза 1: Подготовка раунда
- **Начало:** При первой загрузке или нажатии "Играть снова"
- **Действия:** Сброс выборов, установка таймера, активация игры
- **Конец:** Интерфейс готов, таймер запущен

### Фаза 2: Сбор выборов
- **Начало:** Игроки видят активные сундуки и таймер обратного отсчета (7 секунд)
- **Действия:** Игроки выбирают сундуки (игрок кликом, боты автоматически)
- **Конец:** Таймер достигает 0, даже если все игроки сделали выбор раньше

### Фаза 3: Отображение результатов
- **Начало:** Сразу после окончания таймера фазы 2
- **Действия:** Показ результатов, обновление банка и баланса игроков
- **Конец:** Нажатие кнопки "Играть снова"

## 3. Механики игры

### Определение победителя
- Победителем становится игрок, выбравший **уникальный** сундук с наибольшей ценностью
- Если несколько игроков выбрали одинаковый сундук, этот выбор не считается уникальным
- Если нет уникальных выборов, победителя нет ("No winner")

### Распределение наград
- Каждый сундук содержит фиксированное количество золота:
  - Сундук 1: 35 монет
  - Сундук 2: 50 монет
  - Сундук 3: 70 монет
  - Сундук 4: 100 монет
- Победитель получает ровно столько монет, сколько содержится в выбранном им сундуке
  - Пример: Если игрок выбрал сундук 2 и выиграл, он получает 50 монет
  - Пример: Если бот Алиса выбрала сундук 4 и выиграла, она получает 100 монет

### Экономика игры
- **Стоимость раунда:** С каждого игрока удерживается 25 золота за участие в раунде
- **Выплата награды:** Победителю выплачивается полная стоимость выбранного им сундука, независимо от удержаний с игроков
- **Пополнение банка:** В банк идут все удержания с игроков (100 золота) минус награда победителю
  - Если награда меньше 100: в банк идет разница (например, при награде 35 в банк идет 65 золота)
  - Если награда равна 100: банк не пополняется
  - Если нет победителя: все 100 золота идут в банк

### Серия побед
- Игрок, выигравший 3 раза подряд, получает весь банк
- После получения банка, серия побед обнуляется

## 4. Визуальное представление

### Цвета игроков
- **Игрок (You):** Синий градиент
- **Боты:** Синий градиент

### Состояние выбора
- Активный игрок: яркий цвет
- Сделавший выбор: затемненный цвет (opacity-50)

## 5. Таймеры и ограничения
- **Время на выбор:** 7 секунд
- **Порог банка:** 150 золота (для выплаты серии побед)

## 6. Начальные значения
- **Стартовое золото:** 100 у каждого игрока
- **Банк:** 0 в начале игры

## 7. Правила разработки
- **Синхронизация значений:** Значения сундуков (35, 50, 70, 100) должны быть строго одинаковыми во всех компонентах:
  - В файле App.tsx (CHEST_VALUES)
  - В файле GameBoard2.tsx (CHEST_VALUES)
  - В файле Players.tsx (CHEST_VALUES)
  - В любых других компонентах, использующих эти значения
  - В описании правил игры

- **Правило консистентности UI/логики:** Отображаемые на экране значения сундуков должны соответствовать значениям, используемым в игровой логике. 

{playersMadeChoice['You'] && (
  <p className="text-xs text-green-600 font-medium">Выбрал сундук</p>
)} 