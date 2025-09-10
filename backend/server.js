// 1. ИМПОРТИРУЕМ ВСЕ НЕОБХОДИМЫЕ МОДУЛИ
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config(); // ЗАГРУЖАЕМ ПЕРЕМЕННЫЕ ИЗ .ENV :cite[1]:cite[9]

// Проверяем, что JWT_SECRET установлен
if (!process.env.JWT_SECRET) {
  console.error('ОШИБКА: Переменная окружения JWT_SECRET не установлена!');
  process.exit(1); // Завершаем процесс с ошибкой
}

// Проверяем, что NODE_ENV установлен
const NODE_ENV = process.env.NODE_ENV || 'development';
console.log(`Режим работы: ${NODE_ENV}`);

// 2. СОЗДАЕМ EXPRESS-APP
const app = express();

// 3. НАСТРОЙКА КОНФИГУРАЦИИ ИЗ ПЕРЕМЕННЫХ ОКРУЖЕНИЯ
const PORT = process.env.PORT || 3001; // Используем порт из .env, либо 3001 по умолчанию :cite[2]
const JWT_SECRET = process.env.JWT_SECRET; // Секрет теперь берется из .env

// 4. ПОДГОТОВКА ТЕСТОВЫХ ДАННЫХ (как и раньше)
const users = [
  {
    id: 1,
    email: 'user@mail.com',
    password: '$2b$10$ijYH2HwspHMofKbtO9WtlOWMyizVFP4/OSy3oFLWKeRQyz0GYgqqO'
  }
];

// НАСТРОЙКА MIDDLEWARE
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true // Разрешаем отправку cookies между доменами
}));
app.use(express.json());
app.use(cookieParser());

// ФУНКЦИЯ ДЛЯ ГЕНЕРАЦИИ ТОКЕНОВ
function generateTokens(payload) {
  // Access Token - живет 15 минут, для доступа к API
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  
  // Refresh Token - живет 7 дней, для обновления access token
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  
  return { accessToken, refreshToken };
}

// 7. ЭНДПОИНТ ЛОГИНА
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Получен запрос на логин');
    
    // 7.1. Получаем данные из запроса
    const { email, password } = req.body;

    // 7.2. Ищем пользователя в базе
    const user = users.find(u => u.email === email);
    if (!user) {
      console.log('❌ Пользователь не найден:', email);
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    // 7.3. ПРАВИЛЬНАЯ проверка пароля!
    // bcrypt.compare сравнивает введенный пароль с хешем из базы
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('❌ Неверный пароль для пользователя:', email);
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    // 7.4. Генерируем JWT токены
    const payload = { userId: user.id, email: user.email };
    const { accessToken, refreshToken } = generateTokens(payload);

    console.log('✅ Успешная аутентификация для:', user.email);

    // 7.5. Устанавливаем refreshToken в HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Не доступен через JavaScript (защита от XSS)
      secure: process.env.NODE_ENV === 'production', // true в production (HTTPS only)
      sameSite: 'strict', // Защита от CSRF атак
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней в миллисекундах
    });

    // 7.6. Отправляем успешный ответ
    res.json({
      success: true,
      accessToken, // Access token отправляем в теле ответа
      user: { id: user.id, email: user.email },
      expiresIn: 15 * 60 // 15 минут в секундах
    });

  } catch (error) {
    console.error('💥 Ошибка при логине:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// 8. ЭНДПОИНТ ДЛЯ ПРОВЕРКИ РАБОТЫ СЕРВЕРА
app.get('/api/health', (req, res) => {
  res.json({ 
    message: '✅ Сервер работает!', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 9. ЗАПУСК СЕРВЕРА
app.listen(PORT, () => {
  console.log('🚀 Сервер запущен!');
  console.log(`📍 Порт: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📊 Health-check: http://localhost:${PORT}/api/health`);
  console.log('────────────────────────────────────');
});

//  ЭКСПОРТ ДЛЯ ТЕСТИРОВАНИЯ
module.exports = app;