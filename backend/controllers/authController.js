import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/email.js';

export const register = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        if (password.length < 6) {
             return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        
        const newUser = new User({
            name,
            email,
            passwordHash,
            phone,
            role: role || 'user'
        });

        const savedUser = await newUser.save();

        const token = jwt.sign({ id: savedUser._id, role: savedUser.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        const userObj = savedUser.toObject();
        delete userObj.passwordHash;

        res.status(201).json({ token, user: userObj });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        const userObj = user.toObject();
        delete userObj.passwordHash;

        // Securely trigger the automated email asynchronously so we don't freeze the UI 
        sendEmail({
            to: user.email,
            subject: "New Login Alert - ParkEase",
            text: `Hi ${user.name},\n\nYou have successfully logged in to ParkEase!\nIf this was not you, please secure your account immediately.\n\nBest,\nParkEase Security.`
        });

        res.json({ token, user: userObj });
    } catch (error) {
         console.error(error);
         res.status(500).json({ message: 'Server error' });
    }
};
