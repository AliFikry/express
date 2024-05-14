import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { resetPassword } from '../db.js';
import bcrypt from 'bcrypt';
dotenv.config();

import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express.Router();


app.route("/:token")
    .get(async (req, res) => {
        const token = req.params.token;
        console.log('token', req.params.token);
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user,) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            // next();
        });
        res.render('reset', { root: __dirname });
    })
    .post(async (req, res) => {
        const token = req.params.token;
        const jwtToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,);
        console.log("jwtToken", jwtToken.email);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        resetPassword(jwtToken.email, hashedPassword, (err, results) => {
            if (err) {
                res.status(500).json({
                    "status": "error",
                    "message": "Error resetting password"
                });
            }
            res.status(200).json({
                "status": "success",
                "message": "Password reset successfully"
            });
        });
    });

app.post("/", async (req, res) => {
    const email = req.body.email;

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Use `true` for port 465, `false` for all other ports
        auth: {
            user: "alifikry9393@gmail.com",
            pass: "qajl fwhr cpjv syws",
        },
    });
    const accessToken = jwt.sign({
        email: req.body.email
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

    const info = await transporter.sendMail({
        from: "alifikry9393@gmail.com", // sender address
        to: email, // list of receivers
        subject: "Reset Password", // Subject line
        text: `http://localhost:5000/resetPassword/${accessToken}`,
        html: `
        <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
</head>

<body>
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">

        <tr>
            <td bgcolor="#ffffff" style="padding: 40px 30px 40px 30px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td>
                            <h2 style="font-family: Arial, sans-serif; font-size: 24px; color: #333333; margin: 0;">
                                Password Reset</h2>
                            <p
                                style="font-family: Arial, sans-serif; font-size: 16px; color: #333333; margin-top: 20px;">
                                You have requested to reset your password. Please click the button below to reset it.
                            </p>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 30px;">
                                <tr>
                                    <td align="center" bgcolor="#ffffff">
                                        <table border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td align="center" bgcolor="#4CAF50" style="border-radius: 3px;">
                                                    <a href="${`http://localhost:5000/resetPassword/${accessToken}`}"
                                                        target="_blank"
                                                        style="font-family: Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 3px; border: 1px solid #4CAF50; display: inline-block;">Reset
                                                        Password</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            <p
                                style="font-family: Arial, sans-serif; font-size: 16px; color: #333333; margin-top: 30px;">
                                If you did not request a password reset, please ignore this email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#333333" style="padding: 20px 30px;">
                <p style="font-family: Arial, sans-serif; font-size: 14px; color: #ffffff; margin: 0;">Company
                    Name<br>123 Street, City<br>Country<br><br>Email: info@example.com</p>
            </td>
        </tr>
    </table>
</body>

</html>
`
    });
    res.status(200).json({
        "status": "success",
        "message": "Email sent successfully"
    });

});

export default app;