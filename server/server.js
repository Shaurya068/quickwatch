const express = require('express')
const cors = require('cors')
const connectDb = require('./configs/db.js');
const { clerkMiddleware } = require('@clerk/express')
const { Inngest } = require("inngest");
const { serve } = require("inngest/express");
const { inngest, functions } = require("./inngest/index.js")
const router = require('./routes/showRoutes.js');
const bookingRouter = require('./routes/bookingRoutes.js');
const adminRouter = require('./routes/adminRoutes.js');
const userRouter = require('./routes/userRoutes.js');

const app = express()

connectDb().then(() => {
    console.log('DB connected in serverless');
}).catch((error) => {
    console.error('Database connection failed:', error.message);
});

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

module.exports = app;
