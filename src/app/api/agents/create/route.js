import { NextResponse } from 'next/server';
import { getAgentRegistry } from '@/lib/agents';

export async function POST() {
  try {
    const agents = await getAgentRegistry();
    return NextResponse.json({ success: true, agents: Object.values(agents) });
  } catch (error) {
    console.error('Agent init error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
