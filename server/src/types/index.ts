export interface GitHubRepository { name: string; html_url: string; description: string | null; homepage: string | null; language: string | null; topics: string[]; updated_at: string; fork: boolean; archived: boolean; disabled: boolean }
export interface RelatedRepository { label: string; name?: string; url: string }
export interface ProjectConfig { repoName: string; featured?: boolean; displayTitle?: string; shortDescription?: string; role?: string; image?: string; priority?: number; technologyOverrides?: string[]; hidden?: boolean; relatedRepositories?: RelatedRepository[] }
export interface NormalizedProject { repoName: string; name: string; description: string; role?: string; technologies: string[]; repositoryUrl: string; liveUrl?: string; image?: string; language?: string; updatedAt: string; priority?: number; relatedRepositories?: RelatedRepository[] }
export type ProjectSource = 'github-topic' | 'github-topic+mongodb' | 'local-fallback';
