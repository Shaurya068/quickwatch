import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDb from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';
import { inngest, functions } from './inngest/index.js';

// Routes
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';
import { stripeWebHooks } from './controllers/stripeWebHooks.js';

const app = express();

// ---- Middleware ---- //

// CORS
app.use(cors());

// Clerk authentication middleware
app.use(clerkMiddleware());

// Database connection middleware (lazy connect)
app.use(async (req, res, next) => {
    try {
        await connectDb();
        next();
    } catch (err) {
        console.error('Database connection error:', err);
        res.status(500).json({ success: false, message: 'Database connection failed' });
    }
});

// ---- Stripe Webhook ---- //
// Must use raw body to verify signature
app.post(
    '/api/stripe-webhook',
    express.raw({ type: 'application/json' }),
    stripeWebHooks
);

// ---- JSON parser for other routes ---- //
app.use(express.json());

// ---- Health check ---- //
app.get('/', (req, res) => res.send('Server is live'));

// ---- Inngest ---- //
app.use('/api/inngest', serve({ client: inngest, functions }));

// ---- App Routes ---- //
app.use('/api/show', showRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);

// ---- Global Error Handler ---- //
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// ---- Export app for Vercel ---- //
export default app;

// ---- Local dev server ---- //
if (process.env.NODE_ENV !== 'production') {
    const port = 3000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
}
