import { NextResponse } from 'next/server';
import { getMetrics } from '@/lib/db';

export async function GET() {
  const metrics = getMetrics();
  return NextResponse.json({ data: metrics });
}