import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const sql = getDb();
  const rows = await sql`
    SELECT tag, count(*)::int AS count
    FROM post_tags
    GROUP BY tag
    ORDER BY count DESC
  `;
  return NextResponse.json(rows);
}
