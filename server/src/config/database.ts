import mongoose from 'mongoose';
import { env } from './env.js';

type MongoCategory = 'MONGODB_AUTH_FAILED' | 'MONGODB_NETWORK_FAILED' | 'MONGODB_TIMEOUT' | 'MONGODB_CONFIG_MISSING' | 'MONGODB_CONNECTION_FAILED';
type MongoCache = { connection: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalMongo = globalThis as typeof globalThis & { __portfolioMongo?: MongoCache };
const cache = globalMongo.__portfolioMongo ??= { connection: null, promise: null };

export function classifyMongoError(error: unknown): MongoCategory {
    const value = error as { name?: string; code?: number; message?: string; reason?: { type?: string } };
    const text = `${value.name || ''} ${value.message || ''} ${value.reason?.type || ''}`.toLowerCase();
    if (value.code === 18 || /authentication failed|bad auth|auth failed/.test(text)) return 'MONGODB_AUTH_FAILED';
    if (/timed? ?out|server selection/.test(text)) return 'MONGODB_TIMEOUT';
    if (/network|enotfound|econnrefused|tls|ssl|dns/.test(text)) return 'MONGODB_NETWORK_FAILED';
    return 'MONGODB_CONNECTION_FAILED';
}

export async function connectDatabase() {
    if (!env.mongoUri) { console.error('MONGODB_CONFIG_MISSING'); return null; }
    if (mongoose.connection.readyState === 1) { cache.connection = mongoose; return mongoose; }
    if (cache.connection && cache.connection.connection.readyState === 1) return cache.connection;
    if (mongoose.connection.readyState === 2 && cache.promise) return cache.promise;
    cache.promise = mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 7000, connectTimeoutMS: 7000, maxPoolSize: 5 }).then(connection => {
        cache.connection = connection;
        return connection;
    }).catch(error => {
        cache.promise = null;
        cache.connection = null;
        console.error(classifyMongoError(error));
        throw error;
    });
    return cache.promise;
}
