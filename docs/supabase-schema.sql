-- ===== AGENTS TABLE =====
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  emoji TEXT,
  wallet_id TEXT,
  wallet_address TEXT,
  blockchain TEXT DEFAULT 'ARC-TESTNET',
  simulated BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'idle',
  tasks_completed INTEGER DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  cost_per_action NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== TASKS TABLE =====
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  total_cost NUMERIC DEFAULT 0,
  payment_count INTEGER DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  subtask_count INTEGER DEFAULT 0,
  subtasks_data JSONB,
  results_data JSONB,
  review_score INTEGER,
  review_summary TEXT,
  review_data JSONB,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== TRANSACTIONS TABLE =====
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  task_id TEXT REFERENCES tasks(id),
  tx_hash TEXT,
  from_address TEXT,
  to_address TEXT,
  from_label TEXT,
  to_label TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USDC',
  status TEXT DEFAULT 'confirmed',
  tx_type TEXT DEFAULT 'payment',
  memo TEXT,
  network TEXT DEFAULT 'ARC-TESTNET',
  simulated BOOLEAN DEFAULT false,
  block_explorer_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== EVENTS TABLE =====
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  payment_id TEXT,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== INDEXES =====
CREATE INDEX IF NOT EXISTS idx_transactions_task_id ON transactions(task_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_events_task_id ON events(task_id);
CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(type);

-- ===== ROW LEVEL SECURITY =====
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access" ON agents FOR ALL USING (true);
CREATE POLICY "Service role full access" ON tasks FOR ALL USING (true);
CREATE POLICY "Service role full access" ON transactions FOR ALL USING (true);
CREATE POLICY "Service role full access" ON events FOR ALL USING (true);
