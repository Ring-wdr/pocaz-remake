# Agent Playbook

How to give the coding agent clear, low-ambiguity instructions for this project.

## What the agent is good at
- Editing and creating files in this repo (Next.js, Elysia API, Prisma, Supabase). 
- Running read-only commands (e.g., `rg`, `ls`, `cat`) and non-destructive scripts; can run tests/formatters if asked.
- Following existing patterns: StyleX styling, Elysia routes, Eden client usage, Prisma models/services.

## How to ask
- Give one primary goal, the files or areas involved, and any constraints (e.g., “don’t touch dark mode”, “no schema changes”).
- Mention expected outputs (code, docs, tests) and whether to run checks.
- If something is experimental, say so explicitly.

## Slash-style prompts you can paste
- `/plan <goal>` — ask the agent to outline a short plan before coding.
- `/task <goal>` — single clear goal without needing a plan.
- `/fix <file> <issue>` — focused bugfix in a file.
- `/review <scope>` — code review mindset: enumerate risks/bugs first.
- `/explain <file or flow>` — summarize how something works.
- `/spec <feature>` — write a brief implementation spec (scope, API, data, risks).
- `/tests <scope>` — add or propose tests for a specific area.

## Preferences & conventions
- Favor server components and server-side data fetching when possible.
- On client component, use `useActionState` or `useTransition` for client-side data mutation.
- StyleX: follow `claude/skills/stylex` rules every time (no shorthands, no unsupported props, keep tokens). If a command touches StyleX, assume these rules apply without extra prompting.
- Use Eden client for API calls; align with Elysia route contracts.
- Prisma changes: mirror service/route updates and regen if needed (but don’t auto-run without being asked).
- Avoid destructive git commands; keep changes minimal and purposeful.

## Safety/guardrails
- Default to ASCII; avoid reverting user edits unless asked.
- If unsure about intent, ask a brief clarifying question before large edits.
- Note sandbox/approval constraints if a command fails.
