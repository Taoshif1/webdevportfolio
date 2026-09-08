import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { after, before, test } from 'node:test';
import { app } from './app.js';
import { classifyGeminiError, geminiHttpError } from './services/geminiService.js';

let server: Server;
let origin = '';
before(async () => { await new Promise<void>(resolve => { server = app.listen(0, () => { const address = server.address(); if (!address || typeof address === 'string') throw new Error('Test server did not bind.'); origin = `http://127.0.0.1:${address.port}`; resolve(); }); }); });
after(() => server.close());
const post = (path: string, body: object, headers: Record<string, string> = {}) => fetch(`${origin}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });

test('GET /api/health reports a healthy API', async () => { const response = await fetch(`${origin}/api/health`); const body = await response.json() as { data: { status: string } }; assert.equal(response.status, 200); assert.equal(body.data.status, 'ok'); });
test('POST /api/chat validates empty questions', async () => { const response = await post('/api/chat', { question: '', history: [] }, { 'X-Forwarded-For': '198.51.100.10' }); assert.equal(response.status, 400); });
test('POST /api/chat reports a missing API key safely', async () => { if (process.env.GEMINI_API_KEY) return; const response = await post('/api/chat', { question: 'Who is Gazi?', history: [] }, { 'X-Forwarded-For': '198.51.100.11' }); const body = await response.json() as { error: string }; assert.equal(response.status, 503); assert.match(body.error, /not configured/i); });
test('Gemini provider failures map to safe HTTP errors', () => { assert.deepEqual(classifyGeminiError({ status: 401, message: 'invalid credential' }), { category: 'auth', status: 401 }); assert.equal(geminiHttpError('auth').status, 503); assert.equal(geminiHttpError('model').status, 503); assert.equal(geminiHttpError('quota').status, 429); assert.equal(geminiHttpError('timeout').status, 504); assert.equal(geminiHttpError('provider').status, 502); });
test('proxy headers do not trigger rate-limit validation errors', async () => { const messages: unknown[][] = []; const original = console.error; console.error = (...args: unknown[]) => messages.push(args); try { const response = await post('/api/chat', { question: '', history: [] }, { 'X-Forwarded-For': '2001:db8:1111:2200::1', Forwarded: 'for=2001:db8:1111:2200::1;proto=https' }); assert.equal(response.status, 400); assert.equal(messages.some(args => String(args[0]).includes('ERR_ERL_')), false); } finally { console.error = original; } });
test('rate limiting isolates IPv4 visitors and groups IPv6 subnets safely', async () => { for (let index = 0; index < 8; index += 1) assert.equal((await post('/api/chat', { question: '', history: [] }, { 'X-Forwarded-For': '203.0.113.20' })).status, 400); assert.equal((await post('/api/chat', { question: '', history: [] }, { 'X-Forwarded-For': '203.0.113.20' })).status, 429); assert.equal((await post('/api/chat', { question: '', history: [] }, { 'X-Forwarded-For': '203.0.113.21' })).status, 400); for (let index = 0; index < 8; index += 1) await post('/api/chat', { question: '', history: [] }, { 'X-Forwarded-For': `2001:db8:abcd:1200::${index + 1}` }); assert.equal((await post('/api/chat', { question: '', history: [] }, { 'X-Forwarded-For': '2001:db8:abcd:12ff::99' })).status, 429); });
test('POST /api/contact validates malformed input', async () => { const response = await post('/api/contact', { name: '', email: 'invalid', message: '', website: '' }, { 'X-Forwarded-For': '198.51.100.12' }); assert.equal(response.status, 400); });
