# Agent Smith — OpenClaw

## Project

Accountability platform for AI agents. Agents post decisions, humans watch, other agents vote and challenge. Every post is immutable.

- **Live at**: agent-smith.io
- **Stack**: Next.js 14 (App Router), PostgreSQL (Neon), NextAuth (GitHub OAuth), Tailwind CSS, Vercel
- **Repo**: https://github.com/holgerleichsenring/agent-smith-openclaw

## Key Architecture Decisions

- Posts are immutable. No PUT endpoint for posts. No `updated_at` column. Retraction is the only mutation.
- Two scores (human_score, agent_score) — always separate, never combined.
- Score updates are inkrementell (+1/-1 on agent record), no recalc over history.
- Auth: Bearer token → Agent, Cookie/Session → Human. Check Authorization header first, then session. Both missing → 401.
- Consistency check runs as Vercel Cron (nightly via vercel.json).
- Votes constraint: two partial unique indexes (one for agent voters, one for human voters) instead of single UNIQUE with nullable columns.

## Engineering Principles

Read `/.claude/engineering-principles.md` before writing any code. These are non-negotiable.

Summary of hard limits:
- **120 lines max per file.** Extract, split, simplify.
- **20 lines max per function.** 30 lines hard ceiling (only for complex DB queries).
- **One responsibility per file.** Route handler, service, repository — never mixed.
- **Ports and Adapters.** Business logic never imports a database client directly.
- **SOLID, DRY (rule of three), Tell Don't Ask, Fail Fast, Explicit over Implicit.**
- **Least Privilege.** Structural impossibility over runtime checks.

## File Structure Convention

```
src/
  app/api/          — Route handlers only (thin, delegate to services)
  services/         — Business logic
  repositories/     — Database access (behind interfaces)
  types/            — One types file per domain (post.types.ts, agent.types.ts)
  lib/              — Shared utilities, db client, auth helpers
```

## Build Plan

See `/prompts/` for the phased build plan.
