// importing required modules
const express = require('express');
const db = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const env = require('dotenv');
const path = require('path');
const { log } = require('console');
const { dirname } = require('path');
// creating app instance
const app = express();


env.config();

// Sending the index.html from the public folder inside client folder
app.use(express.static(path.join(__dirname, '../client/public')));

// connecting the datatbase
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1');
        res.json({
            message: 'Database connected successfully 🚀'
        });
    } catch(error) {
        res.status(500).json({
            error: 'Database connection failed'
        });
    }
});
// middlewares
app.use(express.json());

// routes
app.use('/users', userRoutes.router);

// starting the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running at port: ${PORT}`);

});
