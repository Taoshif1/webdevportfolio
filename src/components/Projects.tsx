import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Project } from '../types';

const FEATURED_TOPIC = 'portfolio-featured';

function projectInitials(name: string) {
    const words = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').split(/[\s_-]+/).filter(Boolean);
    return words.slice(0, 2).map(word => word[0]?.toUpperCase()).join('') || 'PR';
}

function visibleTechnologies(project: Project) {
    const language = project.language?.toLocaleLowerCase();
    const seen = new Set<string>();
    return project.technologies.filter(technology => {
        const normalized = technology.trim().toLocaleLowerCase();
        if (!normalized || normalized === FEATURED_TOPIC || normalized === language || seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
    });
}

function ProjectVisual({ project }: { project: Project }) {
    if (project.image) return <div className='project-visual project-visual-image'>
        <img src={project.image} alt={project.name + ' project preview'} loading='lazy' decoding='async' width='900' height='506' />
        <span className='project-visual-shade' aria-hidden='true' />
    </div>;
    return <div className='project-visual project-visual-fallback' role='img' aria-label={'Designed visual for ' + project.name}>
        <span className='project-wireframe' aria-hidden='true' />
        <span className='project-initials' aria-hidden='true'>{projectInitials(project.name)}</span>
        <span className='project-visual-label'>{project.language || 'Software project'}</span>
    </div>;
}

export function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
    useEffect(() => { api.projects().then(response => { setProjects(response.data); setState('ready'); }).catch(() => setState('error')); }, []);
    return <section id='projects' className='section'>
        <p className="eyebrow">Selected engineering work</p><h2>Featured Work</h2>
        {state === 'loading' && <div className="project-grid" aria-label="Loading projects">{[1, 2, 3].map(index => <div className="project-card skeleton" key={index} />)}</div>}
        {state === 'error' && <div className="notice" role="alert"><h3>Projects are temporarily unavailable.</h3><p>You can still explore the source directly on GitHub.</p><a href="https://github.com/Taoshif1">Open GitHub</a></div>}
        {state === 'ready' && projects.length === 0 && <div className="notice"><h3>No featured projects yet.</h3><p>Project curation is ready for its first selection.</p></div>}
        {state === 'ready' && projects.length > 0 && <div className='project-grid'>{projects.map(project => {
            const technologies = visibleTechnologies(project);
            return <article className='project-card' key={project.repoName}>
                <ProjectVisual project={project} />
                <div className="project-copy">
                    <div className="project-meta"><span>{project.role || 'Developer'}</span>{project.language && <span>{project.language}</span>}</div>
                    <h3>{project.name}</h3><p>{project.description}</p>
                    {technologies.length > 0 && <ul className='tags' aria-label='Additional technologies'>{technologies.map(technology => <li key={technology}>{technology}</li>)}</ul>}
                    <div className="card-links">
                        {project.relatedRepositories?.length
                            ? project.relatedRepositories.map(repo => <a key={`${repo.label}-${repo.url}`} href={repo.url} target="_blank" rel="noreferrer">{repo.label} ↗</a>)
                            : <a href={project.repositoryUrl} target="_blank" rel="noreferrer">GitHub ↗</a>}
                        {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer">Live ↗</a>}
                    </div>
                </div>
            </article>;
        })}</div>}
    </section>;
}
