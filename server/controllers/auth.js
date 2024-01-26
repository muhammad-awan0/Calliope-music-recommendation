import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; 

// Signup
export const signup = async (req, res) => {
    try {
        const existingUser = await User.findOne({username: req.body.username});
        if (existingUser) {
            res.status(400).json({msg: "User already exists!"});
        }
        else {
            const salt = await bcrypt.genSalt();
            const passwordHash = await bcrypt.hash(req.body.password, salt); 
            const data = {
                username: req.body.username,
                password: passwordHash
            };
            const userData = await User.insertMany(data);
            res.status(200).json(userData);
        }
    }
    catch (err) {
        console.log(err);
    }
}

// Login
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username })
        if (!user) return res.status(400).json({msg: `There is no account with username ${username}`})

        // Matching the passwords
        // ** comparing the password they just sent and the one taken from req.body
        const isMatch = await bcrypt.compare(password, user.password); 
        if (!isMatch) return res.status(400).json({msg: "Invalid credentials"})

        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET);
        delete user.password; // Delete the password so it does not get sent to the frontend
        
        res.status(200).json({token, user});

    } catch (error) {
        res.status(500).json({error: error.message})
    }
}