# Repository Guidelines

# Project Instructions
## Generate Commit Message
- Use Korean
- Follow Conventional Commits format (feat, fix, chore, etc.)

## Project Structure & Module Organization
Use `PRD.md` as the product blueprint and `survey_schema.json` as the single source for questionnaire logic. Keep survey routes in `app/(survey)` and admin code in `app/(admin)`, with authentication handled in `app/(admin)/login` and protected dashboards in `app/(admin)/dashboard`. House shared UI, validation, and Supabase helpers in `src/lib`, store database artefacts in `supabase/`, and ignore generated CSV/JSON exports.

## Suggested Scaffolding
```
.
├─ app/
│  ├─ (survey)/
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ (admin)/
│  │  ├─ login/
│  │  │  └─ page.tsx
│  │  ├─ dashboard/
│  │  │  ├─ layout.tsx
│  │  │  └─ page.tsx
│  │  └─ exports/
│  └─ api/
├─ src/
│  ├─ components/
│  ├─ hooks/
│  └─ lib/
│     ├─ supabase/
│     ├─ validation/
│     └─ ui/
├─ supabase/
│  ├─ migrations/
│  ├─ functions/
│  └─ policies/
├─ tests/
│  ├─ unit/
│  └─ e2e/
├─ public/
└─ scripts/
```

## Build, Test, and Development Commands
Run `pnpm install` to align with Tailwind/shadcn presets. Use `pnpm dev` for the Next.js dev server, verifying `/(survey)` and `/admin` with an auth gate on dashboards. Execute `pnpm lint`, then `pnpm format` if Prettier reports fixes. Run suites via `pnpm test`, start Supabase with `supabase start`, and push migrations through `pnpm supabase db push`.

## Coding Style & Naming Conventions
Adopt TypeScript throughout. Enforce 2-space indentation and rely on Prettier + ESLint (`next/core-web-vitals`). Name React components in PascalCase, hooks/utilities in camelCase, and survey identifiers in the `A1`, `B5_1_1` pattern. Order Tailwind classes layout → spacing → typography, keep Korean labels in UTF-8, and avoid reusing survey headers/footers inside admin layouts so surfaces stay distinct. Comments stay in English.

## Testing Guidelines
Focus testing on branching logic and validation from `survey_schema.json`. Prefer Vitest or Jest for logic tests and Playwright for conditional end-to-end flows, including admin login barriers. Keep fixtures mirroring the schema and name test files `<feature>.spec.tsx`.

## Commit & Pull Request Guidelines
Start history with Conventional Commits (`feat:`, `fix:`, `chore:`). Each PR links its tracking ticket, notes behaviour changes, and shows screenshots or CLI output for `/admin` exports and validation checks. Rebase before review and confirm lint, test, and type checks locally.

## Data & Security Notes
Follow the PRD directives: isolate PII, encrypt uploads with AES-256, and enforce least-privilege roles in Supabase. Treat raw survey exports as confidential and distribute only through secured channels.
