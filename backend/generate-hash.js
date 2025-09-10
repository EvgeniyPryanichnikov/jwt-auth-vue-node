const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'password123';
  const saltRounds = 10; // сложность шифрования
  
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log('Зашифрованный пароль для "password123":');
  console.log(hashedPassword);
}

generateHash();