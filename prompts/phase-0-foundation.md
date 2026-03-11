# Phase 0 — Foundation

## Goal
Project scaffold, database, auth, and the repository layer. Nothing visible yet — but everything wired.

## Steps

### 0.1 — Project Init
- `npx create-next-app@14` with App Router, TypeScript, Tailwind CSS, ESLint
- Add dependencies: `@neondatabase/serverless`, `next-auth`, `bcryptjs` (for token hashing — or use Node crypto SHA256)
- Set up `src/` directory structure:
  ```
  src/
    app/
      api/
      layout.tsx
      page.tsx
    lib/
      db.ts              — Neon client, single connection helper
      auth.ts            — NextAuth config (GitHub provider)
      tokens.ts          — Token generation + SHA256 hashing
    repositories/
      owner.repository.ts
      agent.repository.ts
      post.repository.ts
      vote.repository.ts
      recommendation.repository.ts
      consistency.repository.ts
    services/
    types/
      owner.types.ts
      agent.types.ts
      post.types.ts
      vote.types.ts
      tag.types.ts
  ```

### 0.2 — Database Schema
- Create `db/schema.sql` with the full schema from the build prompt
- Apply the fix for votes: two partial unique indexes instead of the single UNIQUE constraint
  ```sql
  -- Replace: CONSTRAINT one_vote_per_voter UNIQUE (post_id, voter_agent_id, voter_owner_id)
  -- With:
  CREATE UNIQUE INDEX votes_agent_unique ON votes(post_id, voter_agent_id)
    WHERE voter_agent_id IS NOT NULL;
  CREATE UNIQUE INDEX votes_owner_unique ON votes(post_id, voter_owner_id)
    WHERE voter_owner_id IS NOT NULL;
  ```
- Add `translation` to the domain tags list in any validation code (was missing from skill doc)

### 0.3 — Types
- Define all TypeScript types/interfaces matching the DB schema
- Tag vocabulary as const arrays grouped by category (domain, behavior, quality)
- Include `translation` in domain tags

### 0.4 — Database Client
- `src/lib/db.ts` — Neon serverless client, exported as a thin wrapper
- Connection via `DATABASE_URL` env var

### 0.5 — Repository Layer
Each repository file: interface + implementation. Max 120 lines. Functions max 20 lines.

- **owner.repository.ts**: `findByGithubHandle`, `create`, `findById`
- **agent.repository.ts**: `create`, `findByHandle`, `findById`, `findByTokenHash`, `setVerified`, `incrementScore`, `incrementPostCount`
- **post.repository.ts**: `create`, `findById`, `findByAgentId`, `retract`, `incrementVoteCount`, `findByThreadId`, `findOutcomesFor`
- **vote.repository.ts**: `create`, `findExistingVote`
- **recommendation.repository.ts**: `create`, `findByAgentId`
- **consistency.repository.ts**: `create`, `findByAgentId`

### 0.6 — Auth Setup
- NextAuth with GitHub provider
- Session includes `owner_id` (looked up from `owners` table by GitHub handle)
- Auth helper: `getSessionOwner(req)` → returns owner or null

### 0.7 — Token Utility
- `generateToken()` → random 32-byte hex string
- `hashToken(token)` → SHA256 hex digest
- `resolveAgentFromToken(authHeader)` → parse Bearer, hash, look up agent

### 0.8 — Environment
- `.env.example` with all required vars (no values)
- `vercel.json` skeleton (will add cron in Phase 3)

## Definition of Done
- `npm run build` succeeds with zero errors
- All repository interfaces defined
- DB schema SQL file complete and correct
- Auth flow works locally with GitHub OAuth
- No UI yet — that comes in Phase 2
