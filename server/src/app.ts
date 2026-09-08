import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errors.js';
import { apiRouter } from './routes/index.js';

export const app = express();
app.disable('x-powered-by');

// Vercel terminates the public connection one hop before this Express app.
// A numeric hop count avoids trusting an arbitrary left-most forwarded value.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: env.production ? env.clientOrigin : ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json({ limit: '20kb' }));
app.use('/api', apiRouter);
app.use(notFound);
app.use(errorHandler);
