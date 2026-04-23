import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (url && key && url !== 'your_supabase_url') return createClient(url, key);
  return null;
}

export async function GET() {
  const db = getSupabase();
  if (!db) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
  }

  try {
    const [tasksRes, txRes, agentsRes, eventsRes] = await Promise.all([
      db.from('tasks').select('*').order('created_at', { ascending: true }),
      db.from('transactions').select('*').order('created_at', { ascending: true }),
      db.from('agents').select('*'),
      db.from('events').select('type, created_at, task_id').order('created_at', { ascending: true }),
    ]);

    const tasks = tasksRes.data || [];
    const transactions = txRes.data || [];
    const agents = agentsRes.data || [];
    const events = eventsRes.data || [];

    const overview = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      failedTasks: tasks.filter(t => t.status === 'failed').length,
      runningTasks: tasks.filter(t => t.status === 'running').length,
      totalTransactions: transactions.length,
      onChainTransactions: transactions.filter(t => !t.simulated).length,
      simulatedTransactions: transactions.filter(t => t.simulated).length,
      subcontractTransactions: transactions.filter(t => t.tx_type === 'subcontract').length,
      totalVolume: transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
      totalAgents: agents.length,
      totalEvents: events.length,
      avgTaskCost: tasks.length > 0
        ? tasks.reduce((sum, t) => sum + (parseFloat(t.total_cost) || 0), 0) / tasks.length
        : 0,
      avgTaskDuration: tasks.filter(t => t.duration_seconds > 0).length > 0
        ? tasks.filter(t => t.duration_seconds > 0).reduce((sum, t) => sum + (parseFloat(t.duration_seconds) || 0), 0) / tasks.filter(t => t.duration_seconds > 0).length
        : 0,
      successRate: tasks.length > 0
        ? ((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100).toFixed(1)
        : 0,
    };

    const taskTimeline = tasks.map(t => ({
      date: t.created_at?.split('T')[0],
      cost: parseFloat(t.total_cost) || 0,
      duration: parseFloat(t.duration_seconds) || 0,
      transactions: t.transaction_count || 0,
      status: t.status,
      score: t.review_score || 0,
    }));

    const tasksByDate = {};
    for (const t of taskTimeline) {
      if (!t.date) continue;
      if (!tasksByDate[t.date]) {
        tasksByDate[t.date] = { date: t.date, tasks: 0, cost: 0, transactions: 0, completed: 0, failed: 0 };
      }
      tasksByDate[t.date].tasks += 1;
      tasksByDate[t.date].cost += t.cost;
      tasksByDate[t.date].transactions += t.transactions;
      if (t.status === 'completed') tasksByDate[t.date].completed += 1;
      if (t.status === 'failed') tasksByDate[t.date].failed += 1;
    }
    const dailyStats = Object.values(tasksByDate).sort((a, b) => a.date.localeCompare(b.date));

    const txByHour = {};
    for (const tx of transactions) {
      const hour = tx.created_at?.substring(0, 13);
      if (!hour) continue;
      if (!txByHour[hour]) {
        txByHour[hour] = { time: hour, count: 0, volume: 0, payments: 0, subcontracts: 0 };
      }
      txByHour[hour].count += 1;
      txByHour[hour].volume += parseFloat(tx.amount) || 0;
      if (tx.tx_type === 'subcontract') {
        txByHour[hour].subcontracts += 1;
      } else {
        txByHour[hour].payments += 1;
      }
    }
    const hourlyTxStats = Object.values(txByHour).sort((a, b) => a.time.localeCompare(b.time));

    const agentPerformance = agents.map(a => ({
      name: a.name,
      type: a.type,
      emoji: a.emoji,
      tasksCompleted: a.tasks_completed || 0,
      totalEarned: parseFloat(a.total_earned) || 0,
      costPerAction: parseFloat(a.cost_per_action) || 0,
      status: a.status,
      walletAddress: a.wallet_address,
    }));

    const costDistribution = agentPerformance.map(a => ({
      name: a.name,
      emoji: a.emoji,
      value: a.totalEarned,
    })).filter(a => a.value > 0);

    const amounts = transactions.map(t => parseFloat(t.amount) || 0);
    const histogram = {};
    for (const amt of amounts) {
      const bucket = (Math.floor(amt * 1000) / 1000).toFixed(3);
      histogram[bucket] = (histogram[bucket] || 0) + 1;
    }
    const paymentHistogram = Object.entries(histogram)
      .map(([amount, count]) => ({ amount: parseFloat(amount), count }))
      .sort((a, b) => a.amount - b.amount);

    const taskScores = tasks
      .filter(t => t.review_score)
      .map(t => ({
        task: (t.description || '').substring(0, 40),
        score: t.review_score,
        cost: parseFloat(t.total_cost) || 0,
        duration: parseFloat(t.duration_seconds) || 0,
      }));

    const flows = {};
    for (const tx of transactions) {
      const from = tx.from_label || tx.from_address?.substring(0, 8) || 'unknown';
      const to = tx.to_label || tx.to_address?.substring(0, 8) || 'unknown';
      const key = `${from}→${to}`;
      if (!flows[key]) {
        flows[key] = { from, to, totalAmount: 0, count: 0 };
      }
      flows[key].totalAmount += parseFloat(tx.amount) || 0;
      flows[key].count += 1;
    }
    const networkFlows = Object.values(flows).sort((a, b) => b.totalAmount - a.totalAmount);

    return NextResponse.json({
      success: true,
      overview,
      dailyStats,
      hourlyTxStats,
      agentPerformance,
      costDistribution,
      paymentHistogram,
      taskScores,
      networkFlows,
      recentTasks: tasks.slice(-10).reverse().map(t => ({
        id: t.id,
        description: t.description,
        status: t.status,
        cost: parseFloat(t.total_cost) || 0,
        duration: parseFloat(t.duration_seconds) || 0,
        score: t.review_score,
        createdAt: t.created_at,
      })),
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}