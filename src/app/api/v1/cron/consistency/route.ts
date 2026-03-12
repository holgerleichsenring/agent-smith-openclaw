import { NextRequest, NextResponse } from 'next/server';
import { runAllConsistencyChecks } from '@/services/consistency.service';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = await runAllConsistencyChecks();
  return NextResponse.json({ results });
}
