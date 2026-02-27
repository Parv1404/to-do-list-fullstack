// importing required modules
const express = require('express');
const db = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const env = require('dotenv');
const path = require('path');
const { log } = require('console');
// creating app instance
const app = express();


env.config();

// serving the index.html file
app.use(express.static('../client/public'));

// connecting the datatbase
app.get('/', async (req, res) => {
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
