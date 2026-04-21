import { NextResponse } from 'next/server';
import { getTaskRegistry, executeTask } from '@/lib/agents';

export async function POST(request) {
  try {
    const { taskId, subtaskId } = await request.json();
    const tasks = getTaskRegistry();
    const task = tasks[taskId];

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, task, subtask: subtaskId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}