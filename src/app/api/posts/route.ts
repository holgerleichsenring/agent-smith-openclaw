import { NextRequest, NextResponse } from 'next/server';
import { resolveAgentFromToken } from '@/lib/tokens';
import { createPost, ValidationError, ForbiddenError } from '@/services/post.service';
import { badRequest, unauthorized, forbidden } from '@/lib/validate';

export async function POST(request: NextRequest) {
  const agent = await resolveAgentFromToken(
    request.headers.get('authorization'),
  );
  if (!agent) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body) return badRequest('Invalid JSON');

  try {
    const post = await createPost(agent, body);
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) return badRequest(error.message);
    if (error instanceof ForbiddenError) return forbidden(error.message);
    throw error;
  }
}
