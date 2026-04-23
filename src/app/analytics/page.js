'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useTheme } from '@/context/ThemeContext';
import { SkeletonMetrics, SkeletonCard } from '@/components/Skeleton';
import {
  BarChart3, TrendingUp, DollarSign, Zap, Clock, Activity,
  CheckCircle2, XCircle, Users, RefreshCw, GitBranch, Target,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart as RechartPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#f97316'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900/95 border border-white/10 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(4) : entry.value}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const { data, loading, error, fetchAnalytics } = useAnalytics();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading && !data) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-12 space-y-6">
          <SkeletonMetrics />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  const overview = data?.overview || {};
  const dailyStats = data?.dailyStats || [];
  const hourlyTxStats = data?.hourlyTxStats || [];
  const agentPerformance = data?.agentPerformance || [];
  const costDistribution = data?.costDistribution || [];
  const taskScores = data?.taskScores || [];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-12">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              Analytics Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Comprehensive insights into your agent operations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link href="/tasks" className="btn-secondary flex items-center gap-2 text-sm">
              Task History
            </Link>
            <Link href="/dashboard" className="btn-primary flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4" />
              Dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          {[
            { icon: Activity, label: 'Total Tasks', value: overview.totalTasks, color: 'text-white', bgColor: 'bg-white/10' },
            { icon: CheckCircle2, label: 'Completed', value: overview.completedTasks, color: 'text-green-400', bgColor: 'bg-green-500/10' },
            { icon: Target, label: 'Success Rate', value: `${overview.successRate}%`, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
            { icon: DollarSign, label: 'Total Volume', value: `$${overview.totalVolume?.toFixed(4)}`, color: 'text-green-400', bgColor: 'bg-green-500/10' },
            { icon: Zap, label: 'Transactions', value: overview.totalTransactions, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
            { icon: GitBranch, label: 'Subcontracts', value: overview.subcontractTransactions, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
            { icon: Clock, label: 'Avg Duration', value: `${overview.avgTaskDuration?.toFixed(1)}s`, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
            { icon: DollarSign, label: 'Avg Cost', value: `$${overview.avgTaskCost?.toFixed(4)}`, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
            { icon: Users, label: 'Active Agents', value: overview.totalAgents, color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
            { icon: XCircle, label: 'Failed', value: overview.failedTasks, color: 'text-red-400', bgColor: 'bg-red-500/10' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card p-3"
            >
              <div className={`w-7 h-7 rounded-lg ${stat.bgColor} flex items-center justify-center mb-1.5`}>
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
              <div className={`text-lg font-bold ${stat.color} tabular-nums`}>{stat.value || 0}</div>
              <div className="text-[10px] text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {hourlyTxStats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Transaction Volume Over Time
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={hourlyTxStats}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                    tickFormatter={(v) => v?.split('T')[1] || v}
                  />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="volume" stroke="#22c55e" fill="url(#volumeGradient)" name="Volume (USDC)" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {dailyStats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Daily Task Stats
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="completed" fill="#22c55e" name="Completed" />
                  <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {costDistribution.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-400" />
                Cost Distribution by Agent
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <RechartPie>
                  <Pie
                    data={costDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {costDistribution.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </RechartPie>
              </ResponsiveContainer>
            </motion.div>
          )}

          {agentPerformance.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-400" />
                Agent Performance
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={agentPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} width={60} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="tasksCompleted" fill="#22c55e" name="Tasks Completed" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}