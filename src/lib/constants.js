export const AGENT_TYPES = {
  MANAGER: {
    id: 'manager',
    name: 'Manager Agent',
    emoji: '🧠',
    role: 'Task Orchestrator',
    description: 'Breaks down complex tasks and hires specialists',
    color: 'from-purple-500 to-indigo-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    costPerAction: 0.005,
    skills: ['Task Decomposition', 'Agent Selection', 'Quality Review'],
  },
  CODER: {
    id: 'coder',
    name: 'Coder Agent',
    emoji: '💻',
    role: 'Software Developer',
    description: 'Writes, reviews, and debugs code',
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    costPerAction: 0.008,
    skills: ['Code Generation', 'Bug Fixing', 'Code Review'],
  },
  RESEARCHER: {
    id: 'researcher',
    name: 'Researcher Agent',
    emoji: '🔍',
    role: 'Research Analyst',
    description: 'Gathers and synthesizes information',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    costPerAction: 0.004,
    skills: ['Data Gathering', 'Analysis', 'Summarization'],
  },
  WRITER: {
    id: 'writer',
    name: 'Writer Agent',
    emoji: '✍️',
    role: 'Content Creator',
    description: 'Creates written content and documentation',
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    costPerAction: 0.003,
    skills: ['Content Writing', 'Editing', 'Documentation'],
  },
  ANALYST: {
    id: 'analyst',
    name: 'Analyst Agent',
    emoji: '📊',
    role: 'Data Analyst',
    description: 'Analyzes data and generates insights',
    color: 'from-orange-500 to-amber-600',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    costPerAction: 0.006,
    skills: ['Data Analysis', 'Visualization', 'Reporting'],
  },
};

export const TASK_STATUS = {
  PENDING: 'pending',
  DECOMPOSING: 'decomposing',
  HIRING: 'hiring',
  IN_PROGRESS: 'in_progress',
  REVIEWING: 'reviewing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
};

export const DEMO_TASKS = [
  {
    title: 'Build a Landing Page',
    description: 'Create a responsive landing page for a SaaS product with hero section, features, pricing, and CTA',
    complexity: 'medium',
  },
  {
    title: 'Market Research Report',
    description: 'Analyze the AI agent market, identify top 10 competitors, their pricing, and market gaps',
    complexity: 'high',
  },
  {
    title: 'Write API Documentation',
    description: 'Create comprehensive API docs for a payment processing endpoint with examples',
    complexity: 'medium',
  },
  {
    title: 'Data Analysis Pipeline',
    description: 'Design a data pipeline to process user behavior data and generate engagement metrics',
    complexity: 'high',
  },
];
