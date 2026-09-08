import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Project } from '../types';

export function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
    useEffect(() => { api.projects().then(response => { setProjects(response.data); setState('ready'); }).catch(() => setState('error')); }, []);
    return <section id="projects" className="section">
        <p className="eyebrow">Selected engineering work</p><h2>Featured Work</h2>
        {state === 'loading' && <div className="project-grid" aria-label="Loading projects">{[1, 2, 3].map(index => <div className="project-card skeleton" key={index} />)}</div>}
        {state === 'error' && <div className="notice" role="alert"><h3>Projects are temporarily unavailable.</h3><p>You can still explore the source directly on GitHub.</p><a href="https://github.com/Taoshif1">Open GitHub</a></div>}
        {state === 'ready' && projects.length === 0 && <div className="notice"><h3>No featured projects yet.</h3><p>Project curation is ready for its first selection.</p></div>}
        {state === 'ready' && <div className="project-grid">{projects.map((project, index) =>
            <article className={`project-card ${index === 0 ? 'project-lead' : ''}`} key={project.repoName}>
                {project.image && <img src={project.image} alt="" loading="lazy" decoding="async" width="900" height="520" />}
                <div className="project-copy">
                    <div className="project-meta"><span>{project.role || 'Developer'}</span>{project.language && <span>{project.language}</span>}</div>
                    <h3>{project.name}</h3><p>{project.description}</p>
                    <ul className="tags" aria-label="Technologies">{project.technologies.map(technology => <li key={technology}>{technology}</li>)}</ul>
                    <div className="card-links">
                        {project.relatedRepositories?.length
                            ? project.relatedRepositories.map(repo => <a key={`${repo.label}-${repo.url}`} href={repo.url} target="_blank" rel="noreferrer">{repo.label} ↗</a>)
                            : <a href={project.repositoryUrl} target="_blank" rel="noreferrer">GitHub ↗</a>}
                        {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer">Live ↗</a>}
                    </div>
                </div>
            </article>)}</div>}
    </section>;
}
