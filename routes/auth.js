import express from 'express';
import bcrypt from 'bcrypt';
import { registerUser, searchUserByEmail } from '../db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import authenticateToken from '../middleware/JWTAuth.js';

dotenv.config();

const app = express.Router();

app.post('/register', async (req, res) => {
    try {
        searchUserByEmail(req.body.email, async (err, results) => {
            if (err) {
                console.error('Error searching for user:', err);
                return;
            }
            if (results.length > 0) {
                return res.status(400).send({
                    "status": "error",
                    "message": "User already exists"
                });
            } else {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(req.body.password, salt);
                registerUser(req.body.name, req.body.email, hashedPassword);
                res.status(201).send({
                    "status": "success",
                    "message": "User created successfully"
                });
            }
        });
    } catch {
        res.status(500).send();
    }
});

app.post('/login', async (req, res) => {
    try {
        searchUserByEmail(req.body.email, async (err, results) => {
            if (err) {
                console.error('Error searching for user:', err);
                return;
            }
            if (results.length === 0) {
                return res.status(400).send({
                    "status": "error",
                    "message": "User not found"
                });
            } else {
                const validPassword = await bcrypt.compare(req.body.password, results[0].password);
                if (!validPassword) {
                    return res.status(400).send({
                        "status": "error",
                        "message": "Invalid password"
                    });
                } else {
                    const user = {
                        "id": results[0].id,
                        "name": results[0].name,
                        "email": results[0].email,
                        "isVerified": results[0].isVerified,

                    };
                    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15d' });
                    user.accessToken = accessToken;
                    res.status(200).send({
                        "status": "success",
                        "message": "Login successful",
                        "data": user,
                    });
                }
            }
        });
    } catch {
        res.status(500).send();
    }
});

app.delete('/logout', authenticateToken, (req, res) => {
    //remove token
    res.status(200).send({
        "status": "success",
        "message": "Logout successful",
    });
});

export default app;