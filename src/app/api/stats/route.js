import { NextResponse } from 'next/server';
import { getStats } from '@/lib/agents';

export async function GET() {
  try {
    const stats = getStats();
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}