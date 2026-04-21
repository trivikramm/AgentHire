import { NextResponse } from 'next/server';
import { getTaskRegistry } from '@/lib/agents';

export async function GET() {
  const tasks = getTaskRegistry();
  return NextResponse.json({ tasks: Object.values(tasks) });
}