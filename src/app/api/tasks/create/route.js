import { NextResponse } from 'next/server';
import { executeTask } from '@/lib/agents';

export const maxDuration = 60;

export async function POST(request) {
  try {
    const { description } = await request.json();

    if (!description) {
      return NextResponse.json(
        { error: 'Task description is required' },
        { status: 400 }
      );
    }

    const task = await executeTask(description);

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error('Task creation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
