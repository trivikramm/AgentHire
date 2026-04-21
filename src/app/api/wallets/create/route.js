import { NextResponse } from 'next/server';
import { createWallet } from '@/lib/circle';

export async function POST(request) {
  try {
    const { agentId, agentName } = await request.json();

    if (!agentId || !agentName) {
      return NextResponse.json({ error: 'agentId and agentName are required' }, { status: 400 });
    }

    const wallet = await createWallet(agentId, agentName);

    return NextResponse.json({ success: true, wallet });
  } catch (error) {
    console.error('Wallet creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}