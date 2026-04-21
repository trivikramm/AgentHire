import { NextResponse } from 'next/server';
import { initializeAgents, getAgentRegistry } from '@/lib/agents';

export async function POST() {
  try {
    const agents = await initializeAgents();
    return NextResponse.json({ success: true, agents });
  } catch (error) {
    console.error('Agent init error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
