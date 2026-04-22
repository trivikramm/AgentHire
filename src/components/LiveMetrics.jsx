'use client';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Zap, Activity, Clock, BarChart3 } from 'lucide-react';
import { calculateMarginAnalysis } from '@/lib/payments';

export default function LiveMetrics({ task, transactions = [] }) {
  const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const txCount = transactions.length;
  const avgCost = txCount > 0 ? totalVolume / txCount : 0;

  const margin = txCount > 0 ? calculateMarginAnalysis(totalVolume, txCount) : null;

  const duration = task?.startTime && task?.endTime
    ? ((new Date(task.endTime) - new Date(task.startTime)) / 1000).toFixed(1)
    : task?.duration
      ? Number(task.duration).toFixed(1)
      : '—';

  const stats = [
    {
      icon: DollarSign,
      label: 'Total Volume',
      value: `$${totalVolume.toFixed(4)}`,
      sub: 'USDC',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Zap,
      label: 'Transactions',
      value: txCount.toString(),
      sub: 'nanopayments',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      icon: Activity,
      label: 'Avg Cost/Tx',
      value: `$${avgCost.toFixed(6)}`,
      sub: 'per action',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Clock,
      label: 'Duration',
      value: `${duration}s`,
      sub: 'total time',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-4"
          >
            <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center mb-2`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {margin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-orange-400" />
            Margin Analysis — Why This Only Works on Arc
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-400">Arc + Nanopayments</span>
                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">VIABLE ✓</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Gas Cost:</span>
                  <span className="text-green-400 font-semibold">${margin.arc.gasCost.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Cost:</span>
                  <span className="text-white">${margin.arc.totalCost.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Margin:</span>
                  <span className="text-green-400 font-bold">{margin.arc.marginPercent}%</span>
                </div>
              </div>
              <div className="mt-3 w-full bg-white/5 rounded-full h-2">
                <div className="bg-green-500 rounded-full h-2" style={{ width: `${Math.min(margin.arc.marginPercent, 100)}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-400">Ethereum L1</span>
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">NOT VIABLE ✗</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Gas Cost:</span>
                  <span className="text-red-400 font-semibold">${margin.ethereum.gasCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Cost:</span>
                  <span className="text-white">${margin.ethereum.totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Margin:</span>
                  <span className="text-red-400 font-bold">{margin.ethereum.marginPercent}%</span>
                </div>
              </div>
              <div className="mt-3 w-full bg-white/5 rounded-full h-2">
                <div className="bg-red-500 rounded-full h-2" style={{ width: '0%' }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-yellow-400">Polygon</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  margin.polygon.viable
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {margin.polygon.viable ? 'MARGINAL ~' : 'NOT VIABLE ✗'}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Gas Cost:</span>
                  <span className="text-yellow-400 font-semibold">${margin.polygon.gasCost.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Cost:</span>
                  <span className="text-white">${margin.polygon.totalCost.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Margin:</span>
                  <span className="text-yellow-400 font-bold">{margin.polygon.marginPercent}%</span>
                </div>
              </div>
              <div className="mt-3 w-full bg-white/5 rounded-full h-2">
                <div className="bg-yellow-500 rounded-full h-2" style={{ width: `${Math.max(margin.polygon.marginPercent, 0)}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-sm text-gray-400">
              <span className="text-white font-semibold">💡 Key Insight:</span> With {txCount} sub-cent transactions
              totaling ${totalVolume.toFixed(4)} USDC, Ethereum gas alone would cost
              <span className="text-red-400 font-semibold"> ${margin.ethereum.gasCost.toFixed(2)}</span> —
              that's <span className="text-red-400 font-semibold">
              {(margin.ethereum.gasCost / totalVolume * 100).toFixed(0)}x</span> the actual payment volume.
              Arc makes this economically viable with <span className="text-green-400 font-semibold">zero gas overhead</span>.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}