# Repository Guidelines

## Agent Workflow & Expectations
- Human reviewers run code review and tests—request specific commands (lint, build, Cypress) in PR notes.
- Ask clarifying questions when requirements are ambiguous; consult `docs/PLANS.md` for active goals and `docs/NEXT.md` for search context before starting.
- Use web search/Context7 to confirm library APIs and versions when in doubt.

## Project Structure & Module Organization
- `src/pages/` holds Next.js routes (SSR/ISR) such as `index.tsx`, `[media]/`, and API handlers under `api/`.
- `src/components/` reusable UI built with Chakra; `src/containers/` page-level composition; `src/hooks/`, `src/utils/`, `src/constants/`, and `src/types/` centralize logic, helpers, configs, and shared typings.
- `src/theme/` and `src/styles/` define design tokens and global styles; `src/assets/` imported media; `public/` houses static files served as-is.
- `src/scripts/` contains build helpers (e.g., `genSitemap.ts`); `docs/` stores architecture visuals and branding; `cypress/e2e/` holds end-to-end specs.

## Build, Test, and Development Commands
- `npm install` then `cp .env.example .env.local`; request AWS creds; `npm run setenv` pulls Vercel secrets when authorized.
- `npm run dev` launches http://localhost:3000; `npm run lint` enforces ESLint/Prettier; `npm run sitemap` runs before `npm run build`; `npm run start` serves the build.
- E2E: start dev server, then `npx cypress run --headless` (CI) or `npm run cypress:open` (authoring). Mention these for human reviewers.

## Coding Style & Naming Conventions
- TypeScript + React functional components. Prefer hooks for shared state/effects and keep data-fetching in `src/services/`.
- ESLint extends `next`/`core-web-vitals` with Prettier: no semicolons, single quotes, trailing commas (es5), 120-char print width, `arrowParens: avoid`, 2-space indent by default.
- Filenames: components/containers in `PascalCase.tsx`; hooks `useX.ts`; utilities in `camelCase.ts`; Cypress specs as `*.cy.js`. Keep exports typed and colocate minor styles with the component.
- Reuse tokens from `src/theme` instead of inline values; prefer Chakra props over raw CSS when possible.

## Testing Guidelines
- E2E specs in `cypress/e2e/` (1366×768, retries=1, 20s command timeout). Add flows for search, media/date pages, article rendering.
- Request humans to run `npm run lint` and Cypress before merge. Use stable selectors (`data-cy`) to keep tests resilient.

## Commit & Pull Request Guidelines
- Conventional commits enforced via Husky/commitlint (e.g., `fix: add whole app greyscale`). Run `npm run prepare` once to install hooks; lint-staged auto-runs on commit.
- In PRs: state intent/risk, link issues, note env/config changes, attach UI screenshots, and ask reviewers to run lint + Cypress.

## Security & Configuration Tips
- Never commit secrets; `.env.local` is git-ignored—use `.env.example` as a template. Prefer `npm run setenv` to sync managed values from Vercel.
- Cached assets and AWS resources back the content; avoid altering S3/Dynamo settings unless coordinated. When adding new config, document keys in `.env.example` and keep public files in `public/` unless they must remain private.
