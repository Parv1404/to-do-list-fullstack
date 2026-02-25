// importing required modules
const express = require('express');
const db = require('./models/db')
const userRoutes = require('./routes/userRoutes')
const PORT = 8000;

// creating app instance
const app = express();

// connecting the datatbase
app.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1');
        res.json({
            message: 'Database connected successfully 🚀'
        });
    } catch(errr) {
        res.status(500).json({
            error: 'Database conection failed'
        });
    }
});

// middlewares
app.use(express.json());

// routes
app.use('/users', userRoutes.router);


app.listen(PORT, () => {
    console.log(`Server running at port: ${PORT}`);
});


