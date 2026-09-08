import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fallbackProjects } from '../data/projectFallback.js';
import type { GitHubRepository, ProjectConfig } from '../types/index.js';
import { localProjects, normalizeTopicProjects } from './githubService.js';

const repo = (name: string, changes: Partial<GitHubRepository> = {}): GitHubRepository => ({
    name, html_url: `https://github.com/Taoshif1/${name}`, description: `${name} description`,
    homepage: null, language: 'TypeScript', topics: ['portfolio-featured', 'react'],
    updated_at: '2026-01-01T00:00:00Z', fork: false, archived: false, disabled: false, ...changes
});

test('selects exact portfolio topic and removes it from technology chips', () => {
    const projects = normalizeTopicProjects([repo('selected'), repo('untagged', { topics: ['react'] })], []);
    assert.deepEqual(projects.map(project => project.repoName), ['selected']);
    assert.deepEqual(projects[0]?.technologies, ['TypeScript', 'react']);
});

test('excludes forks, archived repositories, and disabled repositories', () => {
    const projects = normalizeTopicProjects([repo('fork', { fork: true }), repo('archived', { archived: true }), repo('disabled', { disabled: true }), repo('valid')], []);
    assert.deepEqual(projects.map(project => project.repoName), ['valid']);
});

test('merges presentation overrides while preserving GitHub repository fields', () => {
    const source = repo('product', { homepage: 'https://product.example', language: 'JavaScript' });
    const override: ProjectConfig = { repoName: 'PRODUCT', displayTitle: 'Product', shortDescription: 'Curated description', role: 'Lead', image: '/product.png', technologyOverrides: ['React'], relatedRepositories: [{ label: 'Frontend', name: 'client', url: 'https://github.com/example/client' }] };
    const [project] = normalizeTopicProjects([source], [override]);
    assert.equal(project?.name, 'Product');
    assert.equal(project?.repositoryUrl, source.html_url);
    assert.equal(project?.liveUrl, source.homepage);
    assert.equal(project?.language, source.language);
    assert.deepEqual(project?.relatedRepositories, override.relatedRepositories);
});

test('hidden overrides suppress topic-selected repositories', () => {
    assert.deepEqual(normalizeTopicProjects([repo('private-card')], [{ repoName: 'private-card', hidden: true }]), []);
});

test('defined priorities sort first and remaining repositories sort by update date', () => {
    const repos = [repo('newest', { updated_at: '2026-03-01T00:00:00Z' }), repo('priority-two'), repo('older', { updated_at: '2025-01-01T00:00:00Z' }), repo('priority-one')];
    const overrides: ProjectConfig[] = [{ repoName: 'priority-two', priority: 2 }, { repoName: 'priority-one', priority: 1 }];
    assert.deepEqual(normalizeTopicProjects(repos, overrides).map(project => project.repoName), ['priority-one', 'priority-two', 'newest', 'older']);
});

test('local fallback remains curated and usable without GitHub', () => {
    const projects = localProjects();
    assert.equal(projects.length, fallbackProjects.length);
    assert.ok(projects.every(project => project.repositoryUrl.startsWith('https://github.com/Taoshif1/')));
});
