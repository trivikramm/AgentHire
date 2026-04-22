import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;
let hasWarned = false;

function getDB() {
  if (supabase) return supabase;

  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_url') {
    if (!hasWarned) {
      console.warn('⚠️ Supabase not configured — add SUPABASE_URL and SUPABASE_SERVICE_KEY to .env.local');
      hasWarned = true;
    }
    return null;
  }

  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase connected:', supabaseUrl);
  return supabase;
}

// ===== AGENT OPERATIONS =====

export async function saveAgent(agent) {
  const db = getDB();
  if (!db) return;

  const { error } = await db.from('agents').upsert({
    id: agent.id,
    type: agent.type,
    name: agent.name,
    role: agent.role,
    emoji: agent.emoji,
    wallet_id: agent.wallet?.id,
    wallet_address: agent.wallet?.address,
    blockchain: agent.wallet?.blockchain || 'ARC-TESTNET',
    simulated: agent.wallet?.simulated || false,
    status: agent.status || 'idle',
    tasks_completed: agent.tasksCompleted || 0,
    total_earned: agent.totalEarned || 0,
    cost_per_action: agent.costPerAction || 0,
    created_at: agent.createdAt || new Date().toISOString(),
  });

  if (error) console.error('Save agent error:', error.message);
}

export async function getAgents() {
  const db = getDB();
  if (!db) return {};

  const { data, error } = await db
    .from('agents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get agents error:', error.message);
    return {};
  }

  const agents = {};
  for (const row of data || []) {
    agents[row.type] = {
      id: row.id,
      type: row.type,
      name: row.name,
      role: row.role,
      emoji: row.emoji,
      wallet: {
        id: row.wallet_id,
        address: row.wallet_address,
        blockchain: row.blockchain,
        simulated: row.simulated,
      },
      status: row.status,
      tasksCompleted: row.tasks_completed,
      totalEarned: parseFloat(row.total_earned) || 0,
      costPerAction: parseFloat(row.cost_per_action) || 0,
      createdAt: row.created_at,
    };
  }
  return agents;
}

export async function updateAgentStats(agentType, tasksCompleted, totalEarned, status = 'idle') {
  const db = getDB();
  if (!db) return;

  const { error } = await db
    .from('agents')
    .update({
      tasks_completed: tasksCompleted,
      total_earned: totalEarned,
      status,
    })
    .eq('type', agentType);

  if (error) console.error('Update agent error:', error.message);
}

export async function clearAgents() {
  const db = getDB();
  if (!db) return;

  const { error } = await db.from('agents').delete().neq('id', '');
  if (error) console.error('Clear agents error:', error.message);
}

// ===== TASK OPERATIONS =====

export async function saveTask(task) {
  const db = getDB();
  if (!db) return;

  const { error } = await db.from('tasks').upsert({
    id: task.id,
    description: task.description,
    status: task.status,
    total_cost: task.totalCost || 0,
    payment_count: task.payments?.length || 0,
    transaction_count: task.payments?.filter((p) => !p.simulated).length || 0,
    subtask_count: task.results?.length || task.subtasks?.length || 0,
    subtasks_data: task.subtasks ? JSON.stringify(task.subtasks) : null,
    results_data: task.results ? JSON.stringify(task.results) : null,
    review_score: task.review?.score || null,
    review_summary: task.review?.summary || null,
    review_data: task.review ? JSON.stringify(task.review) : null,
    start_time: task.startTime || null,
    end_time: task.endTime || null,
    duration_seconds: task.durationSeconds || null,
  });

  if (error) console.error('Save task error:', error.message);
}

export async function getTasks() {
  const db = getDB();
  if (!db) return [];

  const { data, error } = await db
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get tasks error:', error.message);
    return [];
  }
  return data || [];
}

// ===== TRANSACTION OPERATIONS =====

export async function saveTransaction(tx, taskId = null, fromLabel = '', toLabel = '', txType = 'payment') {
  const db = getDB();
  if (!db) return;

  const { error } = await db.from('transactions').upsert({
    id: tx.id,
    task_id: taskId,
    tx_hash: tx.txHash,
    from_address: tx.from,
    to_address: tx.to,
    from_label: fromLabel,
    to_label: toLabel,
    amount: tx.amount,
    currency: tx.currency || 'USDC',
    status: tx.status || 'confirmed',
    tx_type: txType,
    memo: tx.memo || '',
    network: tx.network || 'ARC-TESTNET',
    simulated: tx.simulated || false,
    block_explorer_url: tx.blockExplorerUrl || '',
    created_at: tx.timestamp || new Date().toISOString(),
  });

  if (error) console.error('Save tx error:', error.message);
}

export async function getTransactions(limit = 200) {
  const db = getDB();
  if (!db) return [];

  const { data, error } = await db
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Get transactions error:', error.message);
    return [];
  }
  return data || [];
}

export async function getTransactionsByTask(taskId) {
  const db = getDB();
  if (!db) return [];

  const { data, error } = await db
    .from('transactions')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (error) return [];
  return data || [];
}

export async function getTransactionStats() {
  const db = getDB();
  if (!db) return { total_count: 0, total_volume: 0, avg_amount: 0, onchain_count: 0, simulated_count: 0, subcontract_count: 0 };

  const { data, error } = await db.from('transactions').select('amount, simulated, tx_type');

  if (error) {
    console.error('Get stats error:', error.message);
    return { total_count: 0, total_volume: 0, avg_amount: 0, onchain_count: 0, simulated_count: 0, subcontract_count: 0 };
  }

  const rows = data || [];
  const totalVolume = rows.reduce((sum, r) => sum + parseFloat(r.amount), 0);

  return {
    total_count: rows.length,
    total_volume: totalVolume,
    avg_amount: rows.length > 0 ? totalVolume / rows.length : 0,
    onchain_count: rows.filter(r => !r.simulated).length,
    simulated_count: rows.filter(r => r.simulated).length,
    subcontract_count: rows.filter(r => r.tx_type === 'subcontract').length,
  };
}

// ===== EVENT OPERATIONS =====

export async function saveEvent(taskId, event) {
  const db = getDB();
  if (!db) return;

  const { error } = await db.from('events').insert({
    task_id: taskId,
    type: event.type,
    message: event.message,
    payment_id: event.payment?.id || null,
    data: event.data || null,
    created_at: event.timestamp || new Date().toISOString(),
  });

  if (error) console.error('Save event error:', error.message);
}

export async function getEventsByTask(taskId) {
  const db = getDB();
  if (!db) return [];

  const { data, error } = await db
    .from('events')
    .select('*')
    .eq('task_id', taskId)
    .order('id', { ascending: true });

  if (error) return [];
  return data || [];
}

// ===== DASHBOARD STATS =====

export async function getDashboardStats() {
  const db = getDB();
  if (!db) return null;

  const [tasksRes, txStats, agentsRes] = await Promise.all([
    db.from('tasks').select('status, total_cost'),
    getTransactionStats(),
    db.from('agents').select('tasks_completed, total_earned'),
  ]);

  const tasks = tasksRes.data || [];
  const agents = agentsRes.data || [];

  return {
    tasks: {
      total_tasks: tasks.length,
      completed_tasks: tasks.filter(t => t.status === 'completed').length,
      total_spent: tasks.reduce((sum, t) => sum + parseFloat(t.total_cost || 0), 0),
    },
    transactions: txStats,
    agents: {
      total_agents: agents.length,
      total_agent_tasks: agents.reduce((sum, a) => sum + (a.tasks_completed || 0), 0),
      total_agent_earned: agents.reduce((sum, a) => sum + parseFloat(a.total_earned || 0), 0),
    },
  };
}

// ===== RESET =====

export async function resetDatabase() {
  const db = getDB();
  if (!db) return;

  await db.from('events').delete().neq('id', 0);
  await db.from('transactions').delete().neq('id', '');
  await db.from('tasks').delete().neq('id', '');
  await db.from('agents').delete().neq('id', '');
  console.log('🗑️ Database reset complete');
}

export default getDB;
