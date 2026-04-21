import { NextResponse } from 'next/server';
import { getAgentRegistry } from '@/lib/agents';

export async function GET() {
  const agents = getAgentRegistry();
  return NextResponse.json({ agents });
}
