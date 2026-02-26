const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');
const env = require('dotenv');
env.config();   

const registerController = async (req, res) => {
    try {
        const {username, email, password} = req.body;
        // validation
        if(!username || !email || !password) {
            return res.status(400).send({
                success: false,
                message: "Please provide all fields"
            });
        }
        // checking existing user
        const existingUser = await userModel.findUserByEmail(email);
        if(existingUser) {
            return res.status(409).send({
                success: false,
                message: "User already exists"
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

const loginController = async (req, res) => {
    try {
        const {email, password} = req.body;
        // validation
        if(!email || !password) {
            return res.status(400).send({
                success: false,
                message: "Please provide all fields"
            });
        }

        // finding the user
        const user = await userModel.findUserByEmail(email);
        if(!user) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }
        // comparing password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(401).send({
                success: false,
                message: "Incorrect credentials"
            });
        }   
        // token generation
        const token = await JWT.sign({id: user.id}, process.env.JWT_SECRET, {
            expiresIn: "1d",
        })
        res.status(200).send({
            success: true,
            message: "Successfully logged in",
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
            }
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in login",
            error
        });
    }
};


//export
module.exports = {registerController, loginController};
