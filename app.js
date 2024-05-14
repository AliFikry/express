import express from 'express';
import dotenv from 'dotenv';
import authenticateToken from './middleware/JWTAuth.js';

import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import resetRoute from './routes/reset.js';



const app = express();
const port = process.env.PORT || 3000;
dotenv.config();


//In memory

app.use(express.json());
app.set('view engine', 'ejs');

// const authRouter = 

app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/resetPassword', resetRoute);

// app.get('/', (req, res) => {
//     res.sendFile('views/reset.html', { root: '.' });
// });






app.post('/users', authenticateToken, (req, res) => {
    res.status(200).json({
        "status": "success",
        "message": "Users retrieved successfully",
        "data": [
            {
                "id": 1,
                "name": "John Doe",
                "email": ""
            },
        ]
    });

});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
