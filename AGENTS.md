# Agent Playbook

Project context and conventions for coding agents working in this repository. Guidance for people writing requests to the agent is in `README.md`.

## Project
Pocaz is a K-pop photocard marketplace and community with a Korean UI. Next.js 16 App Router + React 19 (React Compiler on) + StyleX; an Elysia API mounted at `src/app/api/[[...slugs]]/route.ts`; Prisma 7 on Supabase PostgreSQL; Supabase Auth, Realtime and Storage. The Next server runs on Node, not Bun, so server code must not depend on Bun-only behavior. `IMPLEMENTATION_GAPS.md` lists open work.

## Commands
- `bun run typecheck` — `next typegen && tsc --noEmit` (plain `tsc` fails without the generated `PageProps`/`LayoutProps` types)
- `bun run check` — Biome lint and format check (`bun run format` rewrites formatting)
- `bun test` — unit and API tests (the Elysia app is called in-process; `test/setup.ts` fakes Supabase auth via an `x-test-user` header). DB-backed tests run only when `TEST_DATABASE_URL` points to a database whose name contains `test`; web sessions get one from `.claude/hooks/session-start.sh`, and locally you migrate it with `DIRECT_URL=$TEST_DATABASE_URL bunx prisma migrate deploy`.
- `bun run db:generate` — regenerate the Prisma client

## What the agent is good at
- Editing and creating files in this repo (Next.js, Elysia API, Prisma, Supabase). 
- Running read-only commands (e.g., `rg`, `ls`, `cat`) and non-destructive scripts, including the checks under "Commands".
- Following existing patterns: StyleX styling, Elysia routes, Eden client usage, Prisma models/services.

## Preferences & conventions
- Data fetching: server components fetch through the Eden client by default. Client-only interactive views (chat list, MyPage summary sections) use React Query `queryOptions` from `src/lib/queries/*` inside `@suspensive/react` `<Suspense clientOnly>` with an error boundary. These views were moved off server rendering because SSR made them slower, so keep them client-side.
- Mutations: call the Eden client inside `useTransition`, or use a server action with `useActionState` for forms. After a mutation, refresh whatever shows that data: `invalidateQueries` for React Query data, `router.refresh()` for server-rendered data.
- Build combined initial state objects on the server before passing them to client components; avoid prop-sync `useEffect`.
- StyleX: follow the `.claude/skills/stylex` rules (no multi-value shorthands, no unsupported props, colors and sizes from tokens). They apply to every StyleX change, whether or not the request mentions them.
- Use Eden client for API calls; align with Elysia route contracts.
- Prisma changes: mirror service/route updates. `bun run db:generate` only regenerates the client and is safe to run; `db:migrate`, `db:push` and `db:reset` change the Supabase database configured in `.env`, so run them only when asked.
- Avoid destructive git commands; keep changes minimal and purposeful.

## Safety/guardrails
- Write UI copy, code comments and docs in Korean, like the surrounding files; keep identifiers and file names ASCII (kebab-case file names). Avoid reverting user edits unless asked.
- If unsure about intent, ask a brief clarifying question before large edits.
- Note sandbox/approval constraints if a command fails.
