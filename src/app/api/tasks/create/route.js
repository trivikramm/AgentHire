import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getAgentRegistry, executeTask } from '@/lib/agents';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (url && key && url !== 'your_supabase_url') {
    console.log(`✅ Supabase connected: ${url}`);
    return createClient(url, key);
  }
  console.warn('⚠️ Supabase not configured');
  return null;
}

async function processTaskInBackground(taskId, taskDescription, startTime, db) {
  try {
    const task = await executeTask(taskDescription, {
      taskId,
      background: true,
    });

    const totalCost = task.totalCost || 0;
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    const txCount = (task.payments || []).filter((p) => p?.status === 'confirmed').length;
    const subtaskCount = (task.subtasks || []).length;

    console.log('\n' + '='.repeat(60));
    console.log('🎉 TASK COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`📋 Task: ${taskDescription}`);
    console.log(`🧩 Subtasks completed: ${subtaskCount}`);
    console.log(`💰 Total cost: $${totalCost.toFixed(4)} USDC`);
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`💳 Transactions: ${(task.payments || []).length} (confirmed: ${txCount})`);
    console.log('='.repeat(60) + '\n');

    if (db) {
      const endTimeISO = new Date(endTimeMs).toISOString();
      await db.from('tasks').update({
        status: task.status === 'completed' ? 'completed' : 'failed',
        completed_at: endTimeISO,
        end_time: endTimeISO,
        total_cost: totalCost,
        duration_seconds: parseFloat(duration),
        subtask_count: subtaskCount,
        transaction_count: txCount,
        payment_count: (task.payments || []).length,
        subtasks_data: task.subtasks ? JSON.stringify(task.subtasks) : null,
        results_data: task.results ? JSON.stringify(task.results) : null,
        review_data: task.review ? JSON.stringify(task.review) : null,
        review_score: task.review?.score || null,
        review_summary: task.review?.summary || null,
      }).eq('id', taskId);

      if (task.events && task.events.length > 0) {
        for (const event of task.events) {
          try {
            await db.from('events').insert({
              task_id: taskId,
              type: event.type,
              message: event.message,
              data: event.payment || event.data || null,
              created_at: event.timestamp || new Date().toISOString(),
            });
          } catch (e) {
            // silent
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Task processing failed:', error);

    if (db) {
      try {
        await db.from('tasks').update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          end_time: new Date().toISOString(),
        }).eq('id', taskId);
      } catch (e) {
        console.error('Failed to update task status:', e.message);
      }

      try {
        await db.from('events').insert({
          task_id: taskId,
          type: 'error',
          message: `❌ Task failed: ${error.message}`,
          data: { error: error.message },
          created_at: new Date().toISOString(),
        });
      } catch (e) {
        // silent
      }
    }
  }
}

export async function POST(req) {
  const startTime = Date.now();
  const taskId = uuidv4();

  try {
    const body = await req.json();
    const { task: taskDescription } = body;

    if (!taskDescription) {
      return NextResponse.json({ error: 'Task description required' }, { status: 400 });
    }

    const db = getSupabase();

    if (db) {
      await db.from('tasks').upsert({
        id: taskId,
        description: taskDescription,
        status: 'running',
        created_at: new Date().toISOString(),
        start_time: new Date().toISOString(),
        total_cost: 0,
        duration_seconds: 0,
        subtask_count: 0,
        transaction_count: 0,
        payment_count: 0,
      });
    }

    processTaskInBackground(taskId, taskDescription, startTime, db).catch((err) => {
      console.error('❌ Background task failed:', err);
    });

    return NextResponse.json({
      success: true,
      taskId,
      status: 'running',
      startTime: new Date().toISOString(),
      message: `Task started — poll /api/tasks/status?taskId=${taskId}`,
    });

  } catch (error) {
    console.error('❌ Task creation failed:', error);
    return NextResponse.json({ success: false, error: error.message, taskId }, { status: 500 });
  }
}