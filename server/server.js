import express from 'express'
import cors from 'cors'// to connect front end with backend
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

try {
    await connectDb();
} catch (error) {
    console.error('Database connection failed:', error.message);
    // In serverless, log and continue; app can still export
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

export default app;
