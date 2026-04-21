'use client';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, AlertCircle } from 'lucide-react';
import { AGENT_TYPES, TASK_STATUS } from '@/lib/constants';

const statusConfig = {
  [TASK_STATUS.PENDING]: { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-500/20' },
  [TASK_STATUS.DECOMPOSING]: { icon: Loader2, color: 'text-purple-400', bg: 'bg-purple-500/20', spin: true },
  [TASK_STATUS.HIRING]: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-500/20', spin: true },
  [TASK_STATUS.IN_PROGRESS]: { icon: Loader2, color: 'text-cyan-400', bg: 'bg-cyan-500/20', spin: true },
  [TASK_STATUS.REVIEWING]: { icon: Loader2, color: 'text-orange-400', bg: 'bg-orange-500/20', spin: true },
  [TASK_STATUS.COMPLETED]: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20' },
  [TASK_STATUS.FAILED]: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
};

export default function TaskTimeline({ task }) {
  if (!task) return null;

  const config = statusConfig[task.status] || statusConfig[TASK_STATUS.PENDING];
  const StatusIcon = config.icon;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Task Progress</h2>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg}`}>
          <StatusIcon className={`w-4 h-4 ${config.color} ${config.spin ? 'animate-spin' : ''}`} />
          <span className={`text-sm font-medium ${config.color} capitalize`}>{task.status}</span>
        </div>
      </div>

      {task.subtasks && task.subtasks.length > 0 && (
        <div className="space-y-3">
          {task.subtasks.map((subtask, i) => {
            const agentConfig = AGENT_TYPES[subtask.assignedAgent] || {};
            const result = task.results?.find(r => r.subtaskId === subtask.id);
            const isComplete = !!result;

            return (
              <motion.div
                key={subtask.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 rounded-xl border transition-all ${
                  isComplete
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                      isComplete ? 'bg-green-500/20' : 'bg-white/10'
                    }`}>
                      {isComplete ? '✅' : agentConfig.emoji || '⏳'}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">{subtask.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{subtask.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${agentConfig.bgColor} ${agentConfig.borderColor} border`}>
                          {agentConfig.emoji} {agentConfig.name}
                        </span>
                        <span className="text-xs text-gray-600">
                          {subtask.estimatedActions} actions · ${(agentConfig.costPerAction * subtask.estimatedActions).toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isComplete && (
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  )}
                </div>

                {result && (
                  <div className="mt-3 p-3 rounded-lg bg-black/20 text-xs text-gray-400 max-h-24 overflow-y-auto">
                    {result.result?.substring(0, 300)}
                    {result.result?.length > 300 && '...'}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {task.review && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📊</span>
            <span className="text-sm font-medium text-blue-400">Quality Review</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-white">{task.review.score}/10</div>
            <p className="text-sm text-gray-400">{task.review.summary}</p>
          </div>
        </motion.div>
      )}

      {task.status === 'completed' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🎉</span>
            <span className="text-sm font-medium text-green-400">Task Completed</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-white">{task.payments?.length || 0}</div>
              <div className="text-xs text-gray-500">Payments</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-400">${task.totalCost?.toFixed(4) || '0.00'}</div>
              <div className="text-xs text-gray-500">Total Cost</div>
            </div>
            <div>
              <div className="text-lg font-bold text-cyan-400">{task.results?.length || 0}</div>
              <div className="text-xs text-gray-500">Subtasks Done</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}