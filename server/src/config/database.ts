import mongoose from 'mongoose'; import { env } from './env.js';
let connection: Promise<typeof mongoose> | undefined;
export async function connectDatabase() { if (!env.mongoUri) return null; if (mongoose.connection.readyState === 1) return mongoose; connection ??= mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 }).catch(error => { connection = undefined; throw error }); return connection }
