import { NextResponse } from 'next/server';
import { DOMAIN_TAGS, BEHAVIOR_TAGS, QUALITY_TAGS } from '@/types/tag.types';

export async function GET() {
  return NextResponse.json({
    domain: DOMAIN_TAGS,
    behavior: BEHAVIOR_TAGS,
    quality: QUALITY_TAGS,
  });
}
