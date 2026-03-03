const db = require('../config/db');

const save = async (todo) => {
    const { title, description, createdBy } = todo;
    const [result, fields] = await db.query('INSERT INTO todo (title, description, createdBy) VALUES (?, ?, ?)', [title, description, createdBy]);
    return { id: result.insertId, title, description, createdBy };

}

const getAllTodos = async (userId) => {
    const [rows, fields] = await db.query('SELECT * FROM todo WHERE createdBy = ? ', [userId]);
    return rows;
}

const deleteToDo = async (id) => {
    const [result, fields] = await db.query('DELETE FROM todo WHERE id = ?', [id]);
    return result.affectedRows > 0;
}

const updateToDo = async (id, title, description) => {
    const [result, fields] = await db.query('UPDATE todo SET title = ?, description = ? WHERE id = ?', [title, description, id]);
    return result.affectedRows > 0;
}

const updateToDoStatus = async (id, status) => {
    if(status === "incomplete") {
        const [result, fields] = await db.query('UPDATE todo SET isCompleted = ? WHERE id = ?', [0, id]);
        return result.affectedRows > 0;
    }
    if(status === "completed") {
        const [result, fields] = await db.query('UPDATE todo SET isCompleted = ? WHERE id = ?', [1, id]);
        return result.affectedRows > 0;
    } 
}

module.exports = {save, getAllTodos, deleteToDo, updateToDo, updateToDoStatus};
