const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../users.json');

function loadUsers() {
    if (!fs.existsSync(USERS_FILE)) return {};
    return JSON.parse(fs.readFileSync(USERS_FILE));
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function authenticate(role, username, password) {
    const users = loadUsers();
    const user = users[role]?.find(u => u.username === username);
    return user && user.password === password;
}

function register(role, username, password) {
    const users = loadUsers();
    users[role] = users[role] || [];
    const existing = users[role].find(u => u.username === username);
    if (existing) return false;
    users[role].push({ username, password });
    saveUsers(users);
    return true;
}

module.exports = { authenticate, register };