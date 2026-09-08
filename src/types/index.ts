export interface Project { repoName: string; name: string; description: string; role?: string; technologies: string[]; repositoryUrl: string; liveUrl?: string; image?: string; language?: string; updatedAt: string }
export interface ApiResponse<T> { data: T; source?: 'github-mongodb' | 'github-fallback' | 'local-fallback' }
export interface ChatMessage { role: 'user' | 'assistant'; content: string }
export interface ChatRequest { question: string; history: ChatMessage[] }
export interface ChatResponse { reply: string }
export interface ContactRequest { name: string; email: string; message: string; website?: string }
