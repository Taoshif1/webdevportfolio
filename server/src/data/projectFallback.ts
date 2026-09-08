import type { ProjectConfig } from '../types/index.js';
export const fallbackProjects: ProjectConfig[] = [
    { repoName: 'Taoshiflex-Studio', featured: true, displayTitle: 'Taoshiflex Studio', shortDescription: 'An ongoing studio and product platform for presenting digital services and product work.', role: 'Full-Stack Developer', image: '/images/banner3-min.png', priority: 1, technologyOverrides: ['TypeScript', 'React'], hidden: false },
    { repoName: 'WarmPaws', featured: true, displayTitle: 'WarmPaws', shortDescription: 'A responsive web application connecting pet owners with adoption, care, wellness, donation, and booking features.', role: 'Full-Stack Developer', image: '/images/new2.png', priority: 2, technologyOverrides: ['JavaScript', 'React'], hidden: false },
    { repoName: 'java-flappy-bird-game', featured: true, displayTitle: 'Flappy Bird in Java', shortDescription: 'A Java recreation of the classic side-scrolling Flappy Bird game.', role: 'Developer', image: '/images/game.png', priority: 3, technologyOverrides: ['Java'], hidden: false },
    { repoName: 'Internet-Management-System-in-Java', featured: true, displayTitle: 'Internet Management System', shortDescription: 'A Java application for managing user connections and related records.', role: 'Developer', image: '/images/web3.png', priority: 4, technologyOverrides: ['Java'], hidden: false }
];
