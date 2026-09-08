import { Router, type Request } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { z } from 'zod';
import { connectDatabase } from '../config/database.js';
import { HttpError } from '../middleware/errors.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { askGemini } from '../services/geminiService.js';
import { getProjects, localProjects } from '../services/githubService.js';

export const apiRouter = Router();
const visitorKey = (req: Request) => ipKeyGenerator(req.ip || '0.0.0.0', 56);
const chatLimit = rateLimit({ windowMs: 60_000, limit: 8, keyGenerator: visitorKey, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Too many assistant requests. Please wait a minute.' } });
const contactLimit = rateLimit({ windowMs: 15 * 60_000, limit: 5, keyGenerator: visitorKey, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Too many contact attempts. Please try again later.' } });
const clean = (value: string) => value.replace(/[<>]/g, '').trim();
const chatSchema = z.object({ question: z.string().trim().min(1).max(500), history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().trim().min(1).max(1000) })).max(10).default([]) });
const contactSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.email().max(160), message: z.string().trim().min(10).max(2000), website: z.string().max(0).optional().default('') });

apiRouter.get('/health', (_req, res) => res.json({ data: { status: 'ok', timestamp: new Date().toISOString() } }));
apiRouter.get('/projects', async (_req, res) => { try { const result = await getProjects(); res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600').json({ data: result.projects, source: result.source }); } catch { console.warn('GITHUB_PROJECT_FETCH_FAILED'); res.status(200).json({ data: localProjects(), source: 'local-fallback' }); } });
apiRouter.post('/chat', chatLimit, async (req, res, next) => { try { const input = chatSchema.parse(req.body); const reply = await askGemini(clean(input.question), input.history.map(item => ({ ...item, content: clean(item.content) }))); res.json({ reply }); } catch (error) { next(error); } });
apiRouter.post('/contact', contactLimit, async (req, res, next) => { try { const input = contactSchema.parse(req.body); let database; try { database = await connectDatabase(); } catch { return next(new HttpError(503, 'Message storage is temporarily unavailable. Please use email or LinkedIn.')); } if (!database) return next(new HttpError(503, 'Message storage is not configured. Please use email or LinkedIn.')); await ContactMessage.create({ name: clean(input.name), email: input.email.toLowerCase(), message: clean(input.message) }); res.status(201).json({ message: 'Your message was saved. Gazi can now follow up.' }); } catch (error) { next(error); } });
