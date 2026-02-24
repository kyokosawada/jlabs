const db = require('./db');
const bcrypt = require('bcryptjs');

const users = [
  { name: 'Admin User', email: 'admin@example.com', password: 'password123' },
  { name: 'Test User', email: 'test@example.com', password: 'password123' },
];

const insert = db.prepare('INSERT OR IGNORE INTO users (name, email, password) VALUES (?, ?, ?)');

for (const user of users) {
  const hash = bcrypt.hashSync(user.password, 10);
  insert.run(user.name, user.email, hash);
}

console.log('Seeded users successfully.');
