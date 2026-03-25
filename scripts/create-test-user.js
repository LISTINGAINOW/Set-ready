const { createHash } = require('crypto');
const fs = require('fs');
const path = require('path');

function hashPassword(password) {
  const salt = 'discreet-set-static-salt';
  const hash = createHash('sha256');
  hash.update(password + salt);
  return hash.digest('hex');
}

const testUser = {
  id: 'test-user-id',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  passwordHash: hashPassword('password123'),
  createdAt: new Date().toISOString(),
};

const dataDir = path.join(__dirname, '../data');
const usersFile = path.join(dataDir, 'users.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(usersFile, JSON.stringify([testUser], null, 2));
console.log('Created test user:', testUser.email, 'password: password123');