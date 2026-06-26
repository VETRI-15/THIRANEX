/**
 * db.js — lightweight JSON flat-file database
 * Stores users in data/users.json
 * In production, replace with PostgreSQL / MySQL.
 */

const fs   = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'users.json');

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(users) {
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
}

module.exports = {
  // ── Users ───────────────────────────────────
  findByEmail(email) {
    return readDB().find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  findById(id) {
    return readDB().find(u => u.id === id) || null;
  },

  findByUsername(username) {
    return readDB().find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
  },

  createUser({ username, email, passwordHash }) {
    const users = readDB();
    const user = {
      id           : Date.now().toString(),
      username,
      email        : email.toLowerCase(),
      passwordHash,
      twoFAEnabled : false,
      twoFASecret  : null,
      createdAt    : new Date().toISOString(),
      loginAttempts: 0,
      lockedUntil  : null,
    };
    users.push(user);
    writeDB(users);
    return user;
  },

  updateUser(id, updates) {
    const users = readDB();
    const idx   = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    writeDB(users);
    return users[idx];
  },

  deleteUser(id) {
    const users = readDB().filter(u => u.id !== id);
    writeDB(users);
  },
};
