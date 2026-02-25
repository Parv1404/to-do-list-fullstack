const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');

const registerController = async (req, res) => {
    try {
        const {username, email, password} = req.body;
        // validation
        if(!username || !email || !password) {
            res.status(500).send({
                success: false,
                message: "Please provide all fields"
            });
        }
        // checking existing user
        const existingUser = await userModel.findUserByEmail(email);
        if(existingUser) {
            res.status(500).send({
                success: false,
                message: "user already exists"
            })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        //save user
        const newUser = await userModel.createUser(username, email, hashedPassword);
        res.status(200).send({
            success: true,
            message: "User registered successfully",
        });
    } catch(error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in registering user"
        });
    }
};

//export
module.exports = {registerController};
