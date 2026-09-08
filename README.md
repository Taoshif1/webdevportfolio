# Gazi Taoshif — Software Engineering Portfolio

A TypeScript MERN portfolio combining a custom React interface with an Express API, MongoDB-backed project curation and contact storage, live GitHub metadata, and a server-side Gemini assistant.

## Architecture

- Frontend: React 19, TypeScript, Vite
- API: Node.js, Express, TypeScript
- Database: MongoDB Atlas with Mongoose
- Project data: GitHub REST API merged with MongoDB curation
- AI: Google Gemini, called only from the server
- Motion: GSAP, ScrollTrigger, Three.js
- Deployment target: Vercel with MongoDB Atlas

## Structure

```text
api/index.ts                 Vercel Express entry
server/src/
  config/                    environment and database
  data/                      local project fallback
  middleware/                centralized errors
  models/                    Mongoose models
  routes/                    health, projects, chat, contact
  services/                  GitHub and Gemini
  types/                     server domain types
src/
  components/                UI and motion components
  data/                      verified profile data
  hooks/                     reduced-motion hook
  services/                  typed API client
  types/                     frontend contracts
  App.tsx, main.tsx, styles.css
public/                      resume and production assets
images/                      original source imagery (preserved)
```

## Local setup

Use Node.js 20 or newer.

```bash
npm install
npm run dev
```

The web app is at `http://localhost:5173`; the API is at `http://localhost:3001`. Vite proxies `/api` locally.

## Environment

Required server-side variables are `MONGODB_URI` and `GEMINI_API_KEY`. `GITHUB_TOKEN` is optional. Runtime configuration uses `CLIENT_ORIGIN`, `NODE_ENV`, and `PORT`.

Configure production values directly in the Vercel project's Environment Variables settings. Do not expose server secrets through browser-prefixed variables or commit local environment files. For local development, provide variables through the shell or another untracked mechanism only when needed; the portfolio and project fallbacks remain usable without secrets.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm test
```

## MongoDB Atlas setup

1. Create an Atlas cluster and database user.
2. Permit appropriate development and Vercel network access.
3. Add the connection string as `MONGODB_URI` directly in Vercel Environment Variables.
4. Add `PortfolioProject` documents to control featured state, ordering, titles, descriptions, roles, imagery, and technology overrides. The local fallback keeps development usable before seeding.
5. Contact submissions use `ContactMessage`; the API truthfully reports failure if persistence is unavailable.

GitHub stays authoritative for repository URL, description fallback, homepage, language, topics, update time, archive state, and fork state. MongoDB controls presentation. Forks, archived/disabled repositories, and hidden projects are excluded. The optional `portfolio-featured` topic may feature an otherwise unconfigured repository; MongoDB can override it.

## Gemini setup

1. Revoke and rotate the Gemini key previously committed; treat it as compromised.
2. Create a new key in Google AI Studio.
3. Store it only as server-side `GEMINI_API_KEY` in Vercel Environment Variables.

## Vercel deployment

1. Import `Taoshif1/webdevportfolio` with the repository root as Root Directory.
2. Use `npm run build` and `dist` output.
3. Add `MONGODB_URI`, `GEMINI_API_KEY`, optional `GITHUB_TOKEN`, `CLIENT_ORIGIN`, and `NODE_ENV=production`.
4. Set `CLIENT_ORIGIN` to the final HTTPS origin.
5. Deploy, then verify `/api/health`, projects, assistant, and contact persistence.

## Security

Requests are schema validated and size limited; chat and contact are rate limited; provider requests time out; production errors omit stack traces; secrets stay server-side. Removing the old credential from the current tree does not remove Git history, so manual revocation is still required.
