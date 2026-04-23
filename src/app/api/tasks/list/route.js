import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (url && key && url !== 'your_supabase_url') return createClient(url, key);
  return null;
}

export async function GET(req) {
  const db = getSupabase();
  if (!db) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
  }

  try {
    const { searchParams } = req.nextUrl;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortDir = searchParams.get('sortDir') || 'desc';

    let query = db
      .from('tasks')
      .select('*', { count: 'exact' });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.ilike('description', `%${search}%`);
    }

    const validSorts = ['created_at', 'total_cost', 'duration_seconds', 'transaction_count', 'status'];
    const sortField = validSorts.includes(sortBy) ? sortBy : 'created_at';
    query = query.order(sortField, { ascending: sortDir === 'asc' });

    query = query.range(offset, offset + limit - 1);

    const { data: tasks, error, count } = await query;

    if (error) {
      console.error('List tasks error:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const enrichedTasks = (tasks || []).map(task => {
      let subtasks = [];
      let results = [];
      let review = null;

      try {
        subtasks = task.subtasks_data
          ? (typeof task.subtasks_data === 'string' ? JSON.parse(task.subtasks_data) : task.subtasks_data)
          : [];
      } catch { subtasks = []; }

      try {
        results = task.results_data
          ? (typeof task.results_data === 'string' ? JSON.parse(task.results_data) : task.results_data)
          : [];
      } catch { results = []; }

      try {
        review = task.review_data
          ? (typeof task.review_data === 'string' ? JSON.parse(task.review_data) : task.review_data)
          : null;
        if (!review && task.review_score) {
          review = { score: task.review_score, summary: task.review_summary || '' };
        }
      } catch { review = null; }

      return {
        id: task.id,
        description: task.description,
        status: task.status,
        totalCost: parseFloat(task.total_cost) || 0,
        durationSeconds: parseFloat(task.duration_seconds) || 0,
        transactionCount: task.transaction_count || 0,
        paymentCount: task.payment_count || 0,
        subtaskCount: task.subtask_count || 0,
        reviewScore: task.review_score || review?.score || null,
        reviewSummary: task.review_summary || review?.summary || null,
        startTime: task.start_time,
        endTime: task.end_time,
        createdAt: task.created_at,
        subtasks,
        results,
        review,
      };
    });

    const { data: allTasks } = await db.from('tasks').select('status, total_cost, duration_seconds, transaction_count');
    const allRows = allTasks || [];

    const aggregates = {
      totalTasks: count || 0,
      completedTasks: allRows.filter(t => t.status === 'completed').length,
      failedTasks: allRows.filter(t => t.status === 'failed').length,
      runningTasks: allRows.filter(t => t.status === 'running').length,
      totalSpent: allRows.reduce((sum, t) => sum + (parseFloat(t.total_cost) || 0), 0),
      totalTransactions: allRows.reduce((sum, t) => sum + (t.transaction_count || 0), 0),
      avgDuration: allRows.length > 0
        ? allRows.reduce((sum, t) => sum + (parseFloat(t.duration_seconds) || 0), 0) / allRows.length
        : 0,
      avgCost: allRows.length > 0
        ? allRows.reduce((sum, t) => sum + (parseFloat(t.total_cost) || 0), 0) / allRows.length
        : 0,
    };

    return NextResponse.json({
      success: true,
      tasks: enrichedTasks,
      total: count || 0,
      limit,
      offset,
      aggregates,
    });

  } catch (error) {
    console.error('List tasks error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}