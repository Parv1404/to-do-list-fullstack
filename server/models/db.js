const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'parv@1404',
    database: 'to_do_app'
});

module.exports = pool.promise();
