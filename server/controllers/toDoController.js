const toDoModel = require('../models/toDoModel');

// create todo
const createToDoController = async (req, res) => {
    try {
        const { title, description} = req.body;
        const createdBy = req.user.id;
        if (!title || !description) {
        return res.status(500).send({
            success: false,
            message: "please provide title and description",
        });
        }
        const todo = {title, description, createdBy};
        const result = await toDoModel.save(todo);
        res.status(200).send({
            success: true,
            message: "Todo created successfully",
            data: result,
        });

        } catch (error) {
            res.status(500).send({
                success: false,
                message: "Error creating todo",
                error: error.message,
            });
        }
}

// get all todos
const getTodoController = async (req, res) => {
    try {
        const userId = req.user.id;
        const todos = await toDoModel.getAllTodos(userId);
        res.status(200).send({
            success: true,
            message: "Todos retrieved successfully",
            data: todos,
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error retrieving todos",
            error: error.message,
        });
    }
}

// delete todo for particular id
const deleteTodoController = async (req, res) => {
    try {
        const { id } = req.params;
        const deleteToDo = await toDoModel.deleteToDo(id);
        res.status(200).send({
            success: true,
            message: "Todo deleted successfully",
            data: deleteToDo,
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error deleting todo",
            error: error.message,
        });
    }
}

// update todo for particular id
const updateTodoController = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        const updatedTodo = await toDoModel.updateToDo(id, title, description);
        res.status(200).send({
            success: true,
            message: "Todo updated successfully",
            data: updatedTodo,
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error updating todo",
            error: error.message,
        });
    }
}

// mark todo as completed or incomplete for particular id
const markTodoCompletedController = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedTodo = await toDoModel.updateToDoStatus(id, "completed");
        res.status(200).send({
            success: true,
            message: "Todo marked as completed successfully",
            data: updatedTodo,
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error marking todo as completed",
            error: error.message,
        });
    }
}

module.exports = {createToDoController, getTodoController, deleteTodoController, updateTodoController, markTodoCompletedController};