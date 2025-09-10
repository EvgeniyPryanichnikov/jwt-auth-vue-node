// 1. ИМПОРТИРУЕМ ВСЕ НЕОБХОДИМЫЕ МОДУЛИ
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();


const NODE_ENV = process.env.NODE_ENV || 'development';
console.log(`Режим работы: ${NODE_ENV}`);

const app = express();

const PORT = process.env.PORT
const JWT_SECRET = process.env.JWT_SECRET;


const users = [
  {
    id: 1,
    email: 'user@mail.com',
    password: '$2b$10$pLqI/c71c67ZiHrHwkXER..ErfycGyqAZwNdZ1Kz.Doqtwf/lE2pS', // jwtToken818
    role: 'user'
  },
  {
    id: 2,
    email: 'admin@mail.com',
    password: '$2b$10$MfeYMkD1O46Mm87JApTeeeb7aBuigoodhJUOnJZXG5qZKFRkrPXKu', // Vuetify403!
    role: 'admin'
  },
  {
    id: 3,
    email: 'moderator@mail.com',
    password: '$2b$10$P5LADrtCdtDLxnaZ7/96MeQkhEOhUH7EVaq7pSHOexMrIdemsFa5W', // NodeJS9999
    role: 'moderator'
  }
];

// НАСТРОЙКА MIDDLEWARE
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true // Разрешаем отправку cookies между доменами
}));
app.use(express.json());
app.use(cookieParser());


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
    
    // Получаем данные из запроса
    const { email, password } = req.body;

    // Ищем пользователя в базе
    const user = users.find(u => u.email === email);
    if (!user) {
      console.log('Пользователь не найден:', email);
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    // проверка пароля
    // bcrypt.compare сравнивает введенный пароль с хешем из базы
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Неверный пароль для пользователя:', email);
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    // Генерируем JWT токены !!!
    const payload = { userId: user.id, email: user.email };
    const { accessToken, refreshToken } = generateTokens(payload);
    console.log(`accessToken: ${accessToken}, refreshToken: ${refreshToken}`)

    console.log('Успешная аутентификация для:', user.email);

    // Устанавливаем refreshToken в HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Не доступен через JavaScript (защита от XSS)
      secure: process.env.NODE_ENV === 'production', // true в production (HTTPS only)
      sameSite: 'strict', // Защита от CSRF атак
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней в миллисекундах
    });

    res.json({
      success: true,
      accessToken, // Access token отправляем в теле ответа
      user: { id: user.id, email: user.email },
      expiresIn: 15 * 60 // 15 минут в секундах
    });

  } catch (error) {
    console.error('Ошибка при логине:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Защищенный эндпоинт - требует валидный Access Token
app.get('/api/user/me', (req, res) => {
  try {
    console.log('📨 Получен запрос на /api/user/me');
    
    // Проверяем наличие заголовка Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('Отсутствует заголовок Authorization');
      return res.status(401).json({ error: 'Токен отсутствует' });
    }

    //  Извлекаем токен из заголовка (формат: Bearer <token>)
    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('Неверный формат заголовка Authorization');
      return res.status(401).json({ error: 'Неверный формат токена' });
    }

    console.log('🔐 Получен токен:', token.substring(0, 20) + '...');

    // 3. Проверяем и декодируем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Токен верифицирован. User ID:', decoded.userId);

    // 4. Ищем пользователя в базе
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      console.log('Пользователь не найден в базе');
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    // 5. Возвращаем данные пользователя (без пароля!)
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      lastLogin: new Date().toISOString(),
      isActive: true
    };

    console.log('✅ Отправляем данные пользователя:', userData.email);
    res.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Ошибка в /api/user/me:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Токен истек' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Невалидный токен' });
    }
    
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// ЗАПУСК СЕРВЕРА
app.listen(PORT, () => {
  console.log('🚀 Сервер запущен!');
  console.log(`📍 Порт: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📊 Health-check: http://localhost:${PORT}/api/health`);
  console.log('────────────────────────────────────');
});

module.exports = app;