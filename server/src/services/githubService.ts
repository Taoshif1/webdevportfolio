import { connectDatabase } from '../config/database.js';
import { env } from '../config/env.js';
import { fallbackProjects } from '../data/projectFallback.js';
import { PortfolioProject } from '../models/PortfolioProject.js';
import type { GitHubRepository, NormalizedProject, ProjectConfig, ProjectSource } from '../types/index.js';

const FEATURED_TOPIC = 'portfolio-featured';
const ADMIN_TOPICS = new Set([FEATURED_TOPIC]);
const CACHE_TTL_MS = 5 * 60_000;
let cache: { expires: number; projects: NormalizedProject[]; source: ProjectSource } | undefined;

async function fetchRepositories(): Promise<GitHubRepository[]> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
        const response = await fetch('https://api.github.com/users/Taoshif1/repos?per_page=100&sort=updated', {
            headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'Taoshif-Portfolio', ...(env.githubToken ? { Authorization: `Bearer ${env.githubToken}` } : {}) },
            signal: controller.signal
        });
        if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
        return await response.json() as GitHubRepository[];
    } finally { clearTimeout(timer); }
}

async function fetchOverrides(): Promise<ProjectConfig[]> {
    try {
        const database = await connectDatabase();
        if (!database) return [];
        return await PortfolioProject.find({}).lean<ProjectConfig[]>();
    } catch { return []; }
}

export function normalizeTopicProjects(repos: GitHubRepository[], overrides: ProjectConfig[]): NormalizedProject[] {
    const overrideMap = new Map(overrides.map(item => [item.repoName.toLowerCase(), item]));
    return repos
        .filter(repo => repo.topics.includes(FEATURED_TOPIC) && !repo.fork && !repo.archived && !repo.disabled)
        .map(repo => ({ repo, config: overrideMap.get(repo.name.toLowerCase()) }))
        .filter(({ config }) => !config?.hidden)
        .map(({ repo, config }): NormalizedProject & { priority?: number } => ({
            repoName: repo.name,
            name: config?.displayTitle || repo.name,
            description: config?.shortDescription || repo.description || 'Source code and project details are available on GitHub.',
            ...(config?.role ? { role: config.role } : {}),
            technologies: (config?.technologyOverrides?.length ? config.technologyOverrides : [repo.language, ...repo.topics.filter(topic => !ADMIN_TOPICS.has(topic))])
                .filter((item, index, items): item is string => Boolean(item) && items.indexOf(item) === index).slice(0, 6),
            repositoryUrl: repo.html_url,
            ...(repo.homepage ? { liveUrl: repo.homepage } : {}),
            ...(config?.image ? { image: config.image } : {}),
            ...(repo.language ? { language: repo.language } : {}),
            ...(config?.relatedRepositories?.length ? { relatedRepositories: config.relatedRepositories } : {}),
            updatedAt: repo.updated_at,
            ...(config?.priority !== undefined ? { priority: config.priority } : {})
        }))
        .sort((a, b) => {
            const aPrioritized = a.priority !== undefined, bPrioritized = b.priority !== undefined;
            if (aPrioritized !== bPrioritized) return aPrioritized ? -1 : 1;
            if (aPrioritized && bPrioritized && a.priority !== b.priority) return a.priority! - b.priority!;
            return b.updatedAt.localeCompare(a.updatedAt) || a.repoName.localeCompare(b.repoName);
        })
        .map(({ priority: _priority, ...project }) => project);
}

export async function getProjects(): Promise<NonNullable<typeof cache>> {
    if (cache && cache.expires > Date.now()) return cache;
    const repos = await fetchRepositories();
    const overrides = await fetchOverrides();
    const projects = normalizeTopicProjects(repos, overrides);
    if (!projects.length) {
        console.warn('GITHUB_TOPIC_PROJECTS_EMPTY');
        cache = { expires: Date.now() + CACHE_TTL_MS, projects: localProjects(), source: 'local-fallback' };
        return cache;
    }
    cache = { expires: Date.now() + CACHE_TTL_MS, projects, source: overrides.length ? 'github-topic+mongodb' : 'github-topic' };
    return cache;
}

export function localProjects(): NormalizedProject[] {
    return fallbackProjects.map(config => ({
        repoName: config.repoName, name: config.displayTitle || config.repoName,
        description: config.shortDescription || 'Project details are available on GitHub.',
        ...(config.role ? { role: config.role } : {}), technologies: config.technologyOverrides || [],
        repositoryUrl: `https://github.com/Taoshif1/${config.repoName}`,
        ...(config.image ? { image: config.image } : {}),
        ...(config.relatedRepositories?.length ? { relatedRepositories: config.relatedRepositories } : {}), updatedAt: ''
    }));
}
