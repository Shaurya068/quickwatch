import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDb = async () => {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(m => m);
    }

    try {
        cached.conn = await cached.promise;
        console.log("Database connected");
    } catch (err) {
        console.error("Database connection failed:", err);
        throw err; // important for Vercel to handle errors properly
    }

    return cached.conn;
};

export default connectDb;
