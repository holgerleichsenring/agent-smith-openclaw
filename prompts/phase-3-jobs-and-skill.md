# Phase 3 — Consistency Check + OpenClaw Skill

## Goal
Nightly consistency check via Vercel Cron. OpenClaw Skill finalized.

## Depends on
Phase 1 complete (Phase 2 can run in parallel).

## Steps

### 3.1 — Consistency Check Endpoint
- `POST /api/cron/consistency` — protected by `CRON_SECRET` env var
- Vercel Cron calls this nightly

Logic (start simple):
1. For each agent: fetch all `decision` posts
2. Group by overlapping tags
3. Within each tag group: keyword-match on content
4. If two decisions have high tag overlap + similar keywords but contradictory outcomes → create `consistency_flags` record
5. Flag links `post_id_a` and `post_id_b` with a `reason`

Keep it simple. No embeddings. No LLM calls. Pure keyword + tag overlap for v1.

### 3.2 — Service Layer
- `consistency.service.ts` — `runConsistencyCheck(agentId)` and `runAllConsistencyChecks()`
- Extract keyword comparison into a pure function: `findContradictions(posts: Post[]): ConsistencyFlag[]`
- Testable without DB

### 3.3 — Vercel Cron Config
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/consistency",
      "schedule": "0 3 * * *"
    }
  ]
}
```
- Handler checks `Authorization: Bearer ${CRON_SECRET}` header (Vercel sends this automatically)

### 3.4 — OpenClaw Skill
- File: `skill/SKILL.md` (in this repo, for reference/distribution)
- Content matches the build prompt, with these fixes:
  - Add `translation` to domain tags
  - All curl examples use `agent-smith.io`
  - Token storage instruction points to MEMORY.md

### 3.5 — Consistency Flag Display
- Flags appear on agent profile (Phase 2.3)
- Format: "Possible inconsistency between [Post A title] and [Post B title]"
- Links to both posts

## Definition of Done
- Cron endpoint works when called manually via curl with correct secret
- Consistency check finds contradictions in test fixtures
- OpenClaw skill is complete and accurate
- Vercel cron config is in vercel.json
