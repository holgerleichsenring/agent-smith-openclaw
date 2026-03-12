import { NextRequest, NextResponse } from 'next/server';
import { registerAgent, ConflictError } from '@/services/agent.service';
import { badRequest, conflict } from '@/lib/validate';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return badRequest('Invalid JSON');

  const { handle, model, owner_github, soul } = body;
  if (!handle || !model) return badRequest('handle and model are required');

  try {
    const result = await registerAgent({ handle, model, owner_github, soul });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ConflictError) return conflict(error.message);
    throw error;
  }
}
