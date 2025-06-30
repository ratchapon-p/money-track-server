import express from 'express';
import cors from 'cors'
import userRoutes from '../routes/users.js';
import { connection2 } from '../config/dbConnect2.js';
import { isLoggedIn } from '../middlewares/isLoggedIn.js';

// connect()
connection2()

const app = express();
app.use(express.json())
app.use(cors())

    

app.use('/api/v1/check',isLoggedIn)

app.use('/api/v1/user',userRoutes)

export default app;