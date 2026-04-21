'use client';
import { motion } from 'framer-motion';
import { Wallet, CheckCircle, Loader2 } from 'lucide-react';
import { AGENT_TYPES } from '@/lib/constants';

export default function AgentCard({ agent, index = 0, compact = false }) {
  const config = AGENT_TYPES[agent?.type] || {};

  if (!agent) return null;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-all overflow-hidden"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center text-base flex-shrink-0`}>
            {config.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-semibold text-white truncate">{config.name}</h3>
            <p className="text-[10px] text-gray-500 truncate">{config.role}</p>
          </div>
        </div>

        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] mb-2 ${
          agent.status === 'working'
            ? 'bg-yellow-500/20 text-yellow-400'
            : 'bg-green-500/20 text-green-400'
        }`}>
          {agent.status === 'working' ? (
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
          ) : (
            <CheckCircle className="w-2.5 h-2.5" />
          )}
          {agent.status}
        </div>

        <div className="flex items-center justify-between text-[10px]">
          <span className="text-green-400 font-medium">
            ${config.costPerAction}/act
          </span>
          <span className="text-gray-600">
            {agent.tasksCompleted || 0}t · ${(agent.totalEarned || 0).toFixed(3)}
          </span>
        </div>

        {agent.wallet?.address && (
          <div className="mt-1.5 px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-gray-600 font-mono truncate">
            {agent.wallet.address}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card-hover p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-2xl flex-shrink-0`}>
            {config.emoji}
          </div>
          <div>
            <h3 className="font-semibold text-white">{config.name}</h3>
            <p className="text-xs text-gray-500">{config.role}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs flex-shrink-0 ${
          agent.status === 'working'
            ? 'bg-yellow-500/20 text-yellow-400'
            : agent.status === 'idle'
            ? 'bg-green-500/20 text-green-400'
            : 'bg-gray-500/20 text-gray-400'
        }`}>
          {agent.status === 'working' && <Loader2 className="w-3 h-3 animate-spin inline mr-1" />}
          {agent.status === 'idle' && <CheckCircle className="w-3 h-3 inline mr-1" />}
          {agent.status}
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-3">{config.description}</p>

      <div className="flex flex-wrap gap-1 mb-3">
        {config.skills?.map((skill, i) => (
          <span key={i} className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-gray-400">
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-gray-400">
          <Wallet className="w-3.5 h-3.5" />
          <span>${config.costPerAction}/action</span>
        </div>
        <div className="text-gray-500">
          {agent.tasksCompleted || 0} tasks · ${(agent.totalEarned || 0).toFixed(4)}
        </div>
      </div>

      {agent.wallet?.address && (
        <div className="mt-2 px-2 py-1 rounded-lg bg-white/5 text-xs text-gray-500 font-mono truncate">
          {agent.wallet.address}
        </div>
      )}
    </motion.div>
  );
}