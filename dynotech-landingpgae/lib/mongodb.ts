import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://tallhamushtaq492:dO353SnlcCikadye@cluster0.ojmcxd8.mongodb.net/';

async function dbConnect() {
    if (mongoose.connection.readyState === 1) {
        return; // Already connected
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw new Error('Database service unavailable');
    }
}

export default dbConnect;