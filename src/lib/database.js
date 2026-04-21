import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(process.cwd(), 'agenthire.db');

let db = null;

function getDB() {
  if (db) return db;

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT,
      emoji TEXT,
      wallet_id TEXT,
      wallet_address TEXT,
      blockchain TEXT DEFAULT 'ARC-TESTNET',
      simulated INTEGER DEFAULT 0,
      status TEXT DEFAULT 'idle',
      tasks_completed INTEGER DEFAULT 0,
      total_earned REAL DEFAULT 0,
      cost_per_action REAL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      total_cost REAL DEFAULT 0,
      payment_count INTEGER DEFAULT 0,
      subtask_count INTEGER DEFAULT 0,
      review_score INTEGER,
      review_summary TEXT,
      start_time TEXT,
      end_time TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subtasks (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      assigned_agent TEXT,
      estimated_actions INTEGER DEFAULT 2,
      priority INTEGER DEFAULT 1,
      status TEXT DEFAULT 'pending',
      result TEXT,
      completed_at TEXT,
      FOREIGN KEY (task_id) REFERENCES tasks(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      task_id TEXT,
      tx_hash TEXT,
      from_address TEXT,
      to_address TEXT,
      from_label TEXT,
      to_label TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'USDC',
      status TEXT DEFAULT 'confirmed',
      tx_type TEXT DEFAULT 'payment',
      memo TEXT,
      network TEXT DEFAULT 'ARC-TESTNET',
      simulated INTEGER DEFAULT 0,
      block_explorer_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id TEXT NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      payment_id TEXT,
      data TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id)
    );
  `);

  console.log('✅ Database initialized at:', DB_PATH);
  return db;
}

export function saveAgent(agent) {
  const db = getDB();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO agents 
    (id, type, name, role, emoji, wallet_id, wallet_address, blockchain, simulated, status, tasks_completed, total_earned, cost_per_action, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    agent.id,
    agent.type,
    agent.name,
    agent.role,
    agent.emoji,
    agent.wallet?.id,
    agent.wallet?.address,
    agent.wallet?.blockchain || 'ARC-TESTNET',
    agent.wallet?.simulated ? 1 : 0,
    agent.status || 'idle',
    agent.tasksCompleted || 0,
    agent.totalEarned || 0,
    agent.costPerAction || 0,
    agent.createdAt || new Date().toISOString()
  );
}

export function getAgents() {
  const db = getDB();
  const rows = db.prepare('SELECT * FROM agents ORDER BY created_at DESC').all();

  const agents = {};
  for (const row of rows) {
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
        simulated: row.simulated === 1,
      },
      status: row.status,
      tasksCompleted: row.tasks_completed,
      totalEarned: row.total_earned,
      costPerAction: row.cost_per_action,
      createdAt: row.created_at,
    };
  }
  return agents;
}

export function updateAgentStats(agentType, tasksCompleted, totalEarned, status = 'idle') {
  const db = getDB();
  db.prepare(`
    UPDATE agents SET tasks_completed = ?, total_earned = ?, status = ? WHERE type = ?
  `).run(tasksCompleted, totalEarned, status, agentType);
}

export function clearAgents() {
  const db = getDB();
  db.prepare('DELETE FROM agents').run();
}

export function saveTask(task) {
  const db = getDB();
  db.prepare(`
    INSERT OR REPLACE INTO tasks 
    (id, description, status, total_cost, payment_count, subtask_count, review_score, review_summary, start_time, end_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    task.id,
    task.description,
    task.status,
    task.totalCost || 0,
    task.payments?.length || 0,
    task.results?.length || task.subtasks?.length || 0,
    task.review?.score || null,
    task.review?.summary || null,
    task.startTime || null,
    task.endTime || null
  );
}

export function getTasks() {
  const db = getDB();
  return db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
}

export function saveTransaction(tx, taskId = null, fromLabel = '', toLabel = '', txType = 'payment') {
  const db = getDB();
  db.prepare(`
    INSERT OR REPLACE INTO transactions 
    (id, task_id, tx_hash, from_address, to_address, from_label, to_label, amount, currency, status, tx_type, memo, network, simulated, block_explorer_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    tx.id,
    taskId,
    tx.txHash,
    tx.from,
    tx.to,
    fromLabel,
    toLabel,
    tx.amount,
    tx.currency || 'USDC',
    tx.status || 'confirmed',
    txType,
    tx.memo || '',
    tx.network || 'ARC-TESTNET',
    tx.simulated ? 1 : 0,
    tx.blockExplorerUrl || '',
    tx.timestamp || new Date().toISOString()
  );
}

export function getTransactions(limit = 200) {
  const db = getDB();
  return db.prepare('SELECT * FROM transactions ORDER BY created_at DESC LIMIT ?').all(limit);
}

export function getTransactionsByTask(taskId) {
  const db = getDB();
  return db.prepare('SELECT * FROM transactions WHERE task_id = ? ORDER BY created_at ASC').all(taskId);
}

export function getTransactionStats() {
  const db = getDB();
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total_count,
      COALESCE(SUM(amount), 0) as total_volume,
      COALESCE(AVG(amount), 0) as avg_amount,
      SUM(CASE WHEN simulated = 0 THEN 1 ELSE 0 END) as onchain_count,
      SUM(CASE WHEN simulated = 1 THEN 1 ELSE 0 END) as simulated_count,
      SUM(CASE WHEN tx_type = 'subcontract' THEN 1 ELSE 0 END) as subcontract_count
    FROM transactions
  `).get();

  return stats;
}

export function saveEvent(taskId, event) {
  const db = getDB();
  db.prepare(`
    INSERT INTO events (task_id, type, message, payment_id, data, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    taskId,
    event.type,
    event.message,
    event.payment?.id || null,
    event.data ? JSON.stringify(event.data) : null,
    event.timestamp || new Date().toISOString()
  );
}

export function getEventsByTask(taskId) {
  const db = getDB();
  return db.prepare('SELECT * FROM events WHERE task_id = ? ORDER BY id ASC').all(taskId);
}

export function getDashboardStats() {
  const db = getDB();

  const taskStats = db.prepare(`
    SELECT 
      COUNT(*) as total_tasks,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
      COALESCE(SUM(total_cost), 0) as total_spent
    FROM tasks
  `).get();

  const txStats = getTransactionStats();

  const agentStats = db.prepare(`
    SELECT 
      COUNT(*) as total_agents,
      COALESCE(SUM(tasks_completed), 0) as total_agent_tasks,
      COALESCE(SUM(total_earned), 0) as total_agent_earned
    FROM agents
  `).get();

  return {
    tasks: taskStats,
    transactions: txStats,
    agents: agentStats,
  };
}

export function resetDatabase() {
  const db = getDB();
  db.prepare('DELETE FROM events').run();
  db.prepare('DELETE FROM transactions').run();
  db.prepare('DELETE FROM subtasks').run();
  db.prepare('DELETE FROM tasks').run();
  db.prepare('DELETE FROM agents').run();
  console.log('🗑️ Database reset complete');
}

export default getDB;