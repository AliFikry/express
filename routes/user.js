import express from 'express';
import authenticateToken from '../middleware/JWTAuth.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import { getUserInfo, deleteUser } from "../db.js";
import nodemailer from 'nodemailer';
// import ejs from 'ejs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express.Router();
// app.engine('html', ejs.renderFile);



app.route("/", authenticateToken)
    .post((req, res) => {
        if (req.headers && req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            getUserInfo(decoded.id, (err, results) => {
                if (err) {
                    res.status(500).json({
                        "status": "error",
                        "message": "Error retrieving user"
                    });
                }
                res.status(200).json({
                    "status": "success",
                    "message": "User retrieved successfully",
                    "data": results
                });
            }
            );
        }

    }).delete((req, res) => {
        if (req.headers && req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            deleteUser(decoded.id, (err, results) => {
                if (err) {
                    res.status(500).json({
                        "status": "error",
                        "message": "Error deleting user"
                    });
                }
                res.status(200).json({
                    "status": "success",
                    "message": "User deleted successfully"
                });
            }
            );
        }


    });

app.post("/:id", authenticateToken, (req, res) => {
    getUserInfo(req.params.id, (err, results) => {
        if (err) {
            res.status(500).json({
                "status": "error",
                "message": "Error retrieving user"
            });
        }
        res.status(200).json({
            "status": "success",
            "message": "User retrieved successfully",
            "data": results
        });
    }
    );
});



// app.param('id', (req, res, next, id) => {
//     // console.log('CALLED ONLY ONCE with', id);
//     if (isNaN(id)) {
//         res.status(400).json({
//             "status": "error",
//             "message": "Invalid ID"
//         });
//         return;
//     }
//     next();
// });

export default app;