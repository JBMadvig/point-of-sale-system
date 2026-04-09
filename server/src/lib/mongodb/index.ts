import mongoose from 'mongoose';

import { seedDatabase } from './seed';

const mongooseUrl = process.env['MONGODB_URL'];

export async function connectToMongoDB() {
    if (!mongooseUrl) {
        throw new Error('MONGODB_URL environment variable is not set');
    }

    await mongoose.connect(mongooseUrl);
    console.log('📦 Connected to MongoDB');

    // Seed database with default data
    await seedDatabase();
}

