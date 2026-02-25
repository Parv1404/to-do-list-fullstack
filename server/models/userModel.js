const db = require('./db');

// checking existing user
const findUserByEmail = async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
}

// creating new user
const createUser = async (username, email, password) => {
    const [result] = await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password]);
    // console.log(result);
    
    // return result.insertId;
}

module.exports = {findUserByEmail, createUser};
