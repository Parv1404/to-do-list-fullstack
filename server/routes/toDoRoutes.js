const express = require('express');
const {authMiddleware}= require('../middlewares/authMiddleware');
const {createToDoController, getTodoController, deleteTodoController, updateTodoController, markTodoCompletedController} = require('../controllers/toDoController');


const router = express.Router();

// create todo
router.post('/create', authMiddleware, createToDoController);

// get todo
router.post('/post', authMiddleware, getTodoController);

// delete todo
router.delete('/delete/:id', authMiddleware, deleteTodoController);

// update todo
router.patch('update/:id', authMiddleware, updateTodoController);

// update todo status
router.patch('/update-status/:id', authMiddleware, markTodoCompletedController);

module.exports = {router};

