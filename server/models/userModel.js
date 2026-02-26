const db = require('../config/db');

// checking existing user
const findUserByEmail = async (email) => {
    const [rows, fields] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        // emails are case-insensitive by default
        return rows[0];
}

// creating new user
const createUser = async (username, email, password) => {
    const [result, fields] = await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password]);
    
    return { id: result.insertId, username, email };
}

module.exports = {findUserByEmail, createUser};
