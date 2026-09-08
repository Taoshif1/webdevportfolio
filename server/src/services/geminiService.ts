import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { HttpError } from '../middleware/errors.js';
import { getProjects } from './githubService.js';

type HistoryItem = { role: 'user' | 'assistant'; content: string };
type ProviderError = Error & { status?: number; code?: number | string };
export type GeminiErrorCategory = 'auth' | 'model' | 'quota' | 'timeout' | 'provider';

export function classifyGeminiError(error: unknown, timedOut = false): { category: GeminiErrorCategory; status?: number } {
  if (timedOut || (error instanceof Error && (error.name === 'AbortError' || error.name === 'RequestAbortedError'))) return { category: 'timeout' };
  const providerError = error as Partial<ProviderError>;
  const status = typeof providerError.status === 'number' ? providerError.status : typeof providerError.code === 'number' ? providerError.code : undefined;
  const message = typeof providerError.message === 'string' ? providerError.message.toLowerCase() : '';
  if (status === 401 || status === 403 || message.includes('api key') || message.includes('credential')) return { category: 'auth', status };
  if (status === 404 || message.includes('model') && (message.includes('not found') || message.includes('deprecated') || message.includes('unavailable'))) return { category: 'model', status };
  if (status === 429 || message.includes('quota') || message.includes('rate limit')) return { category: 'quota', status };
  return { category: 'provider', status };
}

export function geminiHttpError(category: GeminiErrorCategory): HttpError {
  switch (category) {
    case 'quota': return new HttpError(429, 'The portfolio assistant is busy right now. Please try again shortly.');
    case 'timeout': return new HttpError(504, 'The portfolio assistant took too long to respond. Please try again shortly.');
    case 'auth': return new HttpError(503, 'The portfolio assistant is temporarily unavailable. Please try again shortly.');
    case 'model': return new HttpError(503, 'The portfolio assistant is temporarily unavailable. Please try again shortly.');
    default: return new HttpError(502, 'The portfolio assistant is temporarily unavailable. Please try again shortly.');
  }
}

export async function askGemini(question: string, history: HistoryItem[]) {
  if (!env.geminiKey) throw new HttpError(503, 'The portfolio assistant is not configured yet.');
  let projectText = 'Project data is temporarily unavailable.';
  try {
    const result = await getProjects();
    projectText = result.projects.map(project => `${project.name}: ${project.description}; technologies: ${project.technologies.join(', ')}`).join('\n');
  } catch { /* The assistant remains useful without live project metadata. */ }
  const prompt = `You are the portfolio assistant for Gazi Taoshif. Be concise, conversational, factual, and professional. You may speak in first person as Gazi when helpful. Verified profile: CSE student at East West University in Bangladesh; software engineer and full-stack developer; core work uses JavaScript, TypeScript, React, Node.js, Express, MongoDB, REST APIs, Git and GitHub. Programming background includes Java, C, C++ and Python. Current work includes personal software projects, university CSE work, and Taoshiflex Studio. Never invent employment, internships, clients, awards, revenue, users, performance metrics, affiliations, or outcomes. Say when information is unknown. Featured projects:\n${projectText}\nRecent conversation:\n${history.slice(-6).map(item => `${item.role}: ${item.content}`).join('\n')}\nQuestion: ${question}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const ai = new GoogleGenAI({ apiKey: env.geminiKey });
    const response = await ai.models.generateContent({ model: env.geminiModel, contents: prompt, config: { maxOutputTokens: 220, temperature: 0.35, abortSignal: controller.signal } });
    const reply = response.text?.trim();
    if (!reply) throw new Error('Gemini returned no text.');
    return reply;
  } catch (error) {
    const mapped = classifyGeminiError(error, controller.signal.aborted);
    console.error(`[gemini] category=${mapped.category}${mapped.status ? ` status=${mapped.status}` : ''} model=${env.geminiModel}`);
    throw geminiHttpError(mapped.category);
  } finally {
    clearTimeout(timer);
  }
}
