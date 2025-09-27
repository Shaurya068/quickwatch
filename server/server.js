import express from 'express'
import cors from 'cors'// to connect front end with backend
import 'dotenv/config'
import connectDb from './configs/db.js';
import { clerkMiddleware } from '@clerk/express'
import { Inngest } from "inngest";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"
import router from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';
const app = express()
const port = 3000;

try {
    await connectDb();
} catch (error) {
    console.error('Database connection failed:', error.message);
}

app.use(express.json())
app.use(cors())
app.use(clerkMiddleware())

app.get('/', (req, res) => {
    res.send('Server is live')
})
app.use('/api/inngest', serve({ client: inngest, functions }))

app.use('/api/show', router)
app.use('/api/booking', bookingRouter)
app.use('/api/admin', adminRouter)
app.use('/api/user', userRouter)



if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log('Starting port 3000')
    })
}

export default app;
