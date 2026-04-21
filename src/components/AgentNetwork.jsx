'use client';
import { motion } from 'framer-motion';
import AgentCard from './AgentCard';
import { AGENT_TYPES } from '@/lib/constants';

export default function AgentNetwork({ agents }) {
  const agentList = agents
    ? Object.values(agents)
    : Object.entries(AGENT_TYPES).map(([type, config]) => ({
        type,
        ...config,
        status: 'idle',
        tasksCompleted: 0,
        totalEarned: 0,
        wallet: { address: '0x...' },
      }));

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-semibold text-white">🤖 Agent Network</h2>
          <p className="text-xs text-gray-500">{agentList.length} specialist agents ready</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400">All Online</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {agentList.map((agent, i) => (
          <AgentCard key={agent.type || i} agent={agent} index={i} compact={true} />
        ))}
      </div>
    </div>
  );
}