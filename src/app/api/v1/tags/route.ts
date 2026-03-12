import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  const result = await db.execute(sql`
    SELECT tag, count(*)::int AS count
    FROM post_tags
    GROUP BY tag
    ORDER BY count DESC
  `);
  return NextResponse.json(result.rows);
}
