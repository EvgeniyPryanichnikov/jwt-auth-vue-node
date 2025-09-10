const bcrypt = require('bcryptjs');

async function generateHashes() {
  const passwords = [
    'jwtToken818', // для user@mail.com
    'Vuetify403!',    // для admin@mail.com  
    'NodeJS9999' // для moderator@mail.com
  ];

  for (const pass of passwords) {
    const hash = await bcrypt.hash(pass, 10);
    console.log(`Пароль: ${pass}`);
    console.log(`Хеш:    ${hash}`);
    console.log('---');
  }
}

generateHashes();