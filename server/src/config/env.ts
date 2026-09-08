import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT || 3001),
  mongoUri: process.env.MONGODB_URI,
  geminiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
  githubToken: process.env.GITHUB_TOKEN,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  production: process.env.NODE_ENV === 'production',
};
