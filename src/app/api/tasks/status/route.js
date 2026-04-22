import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (url && key) return createClient(url, key);
  return null;
}

export async function GET(req) {
  const taskId = req.nextUrl.searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json({ error: 'taskId required' }, { status: 400 });
  }

  const db = getSupabase();
  if (!db) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const { data: task, error: taskError } = await db
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found', detail: taskError?.message }, { status: 404 });
    }

    let allEvents = [];

    const { data: events1 } = await db
      .from('events')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    const { data: events2 } = await db
      .from('task_events')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    const seen = new Set();
    for (const e of [...(events1 || []), ...(events2 || [])]) {
      const key = `${e.type}:${e.message}`;
      if (!seen.has(key)) {
        seen.add(key);
        allEvents.push({
          id: e.id,
          timestamp: new Date(e.created_at).getTime(),
          type: e.type,
          message: e.message,
          data: e.data,
          payment: e.data?.payment || null,
        });
      }
    }

    allEvents.sort((a, b) => a.timestamp - b.timestamp);

    const { data: payments } = await db
      .from('transactions')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    const totalCost = parseFloat(task.total_cost) || 0;
    const txCount = task.transaction_count || (payments?.length || 0);
    const duration = parseFloat(task.duration_seconds) || 0;

    let subtasks = [];
    let results = [];
    let review = null;

    try {
      subtasks = task.subtasks_data ? (typeof task.subtasks_data === 'string' ? JSON.parse(task.subtasks_data) : task.subtasks_data) : [];
    } catch (e) { subtasks = []; }

    try {
      results = task.results_data ? (typeof task.results_data === 'string' ? JSON.parse(task.results_data) : task.results_data) : [];
    } catch (e) { results = []; }

    try {
      review = task.review_data ? (typeof task.review_data === 'string' ? JSON.parse(task.review_data) : task.review_data) : null;
      if (!review && task.review_score) {
        review = { score: task.review_score, summary: task.review_summary || '' };
      }
    } catch (e) { review = null; }

    console.log(`📡 Status: task=${taskId.slice(0, 8)}... status=${task.status} events=${allEvents.length} cost=$${totalCost.toFixed(4)}`);

    return NextResponse.json({
      success: true,
      taskId: task.id,
      status: task.status,
      description: task.description,
      completedAt: task.completed_at || task.end_time,
      startTime: task.start_time,
      endTime: task.end_time,
      events: allEvents,
      payments: payments || [],
      subtasks,
      results,
      review,
      summary: {
        totalCost,
        transactionCount: txCount,
        duration,
        subtaskCount: task.subtask_count || subtasks.length || 0,
        agentsUsed: [...new Set((payments || []).map((p) => p.to_address))].length,
        avgCostPerTx: txCount > 0 ? totalCost / txCount : 0,
      },
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}