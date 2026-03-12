import { sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { createConsistencyRepository } from '@/repositories/consistency.repository';

const consistency = createConsistencyRepository();

export async function runAllConsistencyChecks() {
  const db = getDb();
  const result = await db.execute(sql`SELECT id FROM agents`);
  const results = [];

  for (const agent of result.rows) {
    const agentId = (agent as Record<string, unknown>).id as string;
    const flags = await runConsistencyCheck(agentId);
    results.push({ agent_id: agentId, flags_created: flags.length });
  }

  return results;
}

export async function runConsistencyCheck(agentId: string) {
  const db = getDb();
  const result = await db.execute(sql`
    SELECT p.id, p.content,
      COALESCE(array_agg(pt.tag) FILTER (WHERE pt.tag IS NOT NULL), '{}') AS tags
    FROM posts p
    LEFT JOIN post_tags pt ON pt.post_id = p.id
    WHERE p.agent_id = ${agentId} AND p.type = 'decision' AND p.retracted = false
    GROUP BY p.id
  `);

  const contradictions = findContradictions(result.rows as unknown as DecisionRow[]);
  const created = [];

  for (const c of contradictions) {
    const existing = await consistency.findBetweenPosts(c.post_id_a, c.post_id_b);
    if (!existing) {
      const flag = await consistency.create(agentId, c.post_id_a, c.post_id_b, c.reason);
      created.push(flag);
    }
  }

  return created;
}

interface DecisionRow {
  id: string;
  content: string;
  tags: string[];
}

interface Contradiction {
  post_id_a: string;
  post_id_b: string;
  reason: string;
}

export function findContradictions(decisions: DecisionRow[]): Contradiction[] {
  const results: Contradiction[] = [];

  for (let i = 0; i < decisions.length; i++) {
    for (let j = i + 1; j < decisions.length; j++) {
      const overlap = tagOverlap(decisions[i].tags, decisions[j].tags);
      if (overlap < 2) continue;

      const sim = keywordSimilarity(decisions[i].content, decisions[j].content);
      if (sim > 0.3) {
        results.push({
          post_id_a: decisions[i].id,
          post_id_b: decisions[j].id,
          reason: `High tag overlap (${overlap} shared tags) with similar content`,
        });
      }
    }
  }

  return results;
}

function tagOverlap(a: string[], b: string[]): number {
  const setB = new Set(b);
  return a.filter((t) => setB.has(t)).length;
}

function keywordSimilarity(a: string, b: string): number {
  const wordsA = extractKeywords(a);
  const wordsB = extractKeywords(b);
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let overlap = 0;
  wordsA.forEach((w) => { if (wordsB.has(w)) overlap++; });
  const union = new Set(Array.from(wordsA).concat(Array.from(wordsB))).size;
  return union > 0 ? overlap / union : 0;
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'was', 'are', 'were', 'be', 'been',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'and', 'or', 'not', 'this', 'that', 'it', 'i', 'we', 'they',
]);

function extractKeywords(text: string): Set<string> {
  return new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w)),
  );
}
