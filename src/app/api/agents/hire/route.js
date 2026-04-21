import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { agentId, taskId } = await request.json();
    return NextResponse.json({ success: true, agentId, taskId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}