'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useTaskHistory } from '@/hooks/useTaskHistory';
import { useTheme } from '@/context/ThemeContext';
import { SkeletonTable } from '@/components/Skeleton';
import {
  Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Clock, DollarSign, Zap, CheckCircle2, XCircle, Loader2, BarChart3,
  ArrowUpDown, ExternalLink, RefreshCw, ListFilter, Activity,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const STATUS_CONFIG = {
  completed: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Completed' },
  failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Failed' },
  running: { icon: Loader2, color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Running', spin: true },
  decomposing: { icon: Loader2, color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Decomposing', spin: true },
  reviewing: { icon: Loader2, color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'Reviewing', spin: true },
};

const PAGE_SIZE = 15;

export default function TaskHistoryPage() {
  const { theme } = useTheme();
  const { tasks, loading, total, aggregates, error, fetchTasks } = useTaskHistory();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);
  const [expandedTask, setExpandedTask] = useState(null);

  const fetchWithParams = (pageNum = page) => {
    fetchTasks({
      limit: PAGE_SIZE,
      offset: pageNum * PAGE_SIZE,
      status: statusFilter,
      search: search.trim() || undefined,
      sortBy,
      sortDir,
    });
  };

  useEffect(() => {
    fetchWithParams(0);
  }, [statusFilter, sortBy, sortDir]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchWithParams(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
    setPage(0);
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ArrowUpDown className="w-3 h-3 text-gray-600" />;
    return sortDir === 'desc'
      ? <ChevronDown className="w-3 h-3 text-blue-400" />
      : <ChevronUp className="w-3 h-3 text-blue-400" />;
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-12">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ListFilter className="w-6 h-6 text-blue-400" />
              Task History
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Browse, search, and analyze all your past tasks
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/analytics" className="btn-secondary flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
            <Link href="/dashboard" className="btn-primary flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4" />
              New Task
            </Link>
          </div>
        </div>

        {aggregates && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
            {[
              { label: 'Total Tasks', value: aggregates.totalTasks, icon: Activity, color: 'text-white' },
              { label: 'Completed', value: aggregates.completedTasks, icon: CheckCircle2, color: 'text-green-400' },
              { label: 'Failed', value: aggregates.failedTasks, icon: XCircle, color: 'text-red-400' },
              { label: 'Total Spent', value: `$${aggregates.totalSpent.toFixed(4)}`, icon: DollarSign, color: 'text-green-400' },
              { label: 'Avg Duration', value: `${aggregates.avgDuration?.toFixed(1)}s`, icon: Clock, color: 'text-blue-400' },
              { label: 'Total Tx', value: aggregates.totalTransactions, icon: Zap, color: 'text-cyan-400' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-gray-500">{stat.label}</span>
                </div>
                <div className={`text-lg font-bold ${stat.color} tabular-nums`}>{stat.value}</div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="glass-card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search task descriptions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            <div className="flex gap-2">
              {['all', 'completed', 'running', 'failed'].map(status => {
                const config = STATUS_CONFIG[status];
                return (
                  <button
                    key={status}
                    onClick={() => { setStatusFilter(status); setPage(0); }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                      statusFilter === status
                        ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {config && <config.icon className={`w-3 h-3 ${config.color} ${config.spin ? 'animate-spin' : ''}`} />}
                    {status === 'all' ? 'All' : config?.label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => fetchWithParams()}
              disabled={loading}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading && tasks.length === 0 && <SkeletonTable rows={8} />}

        {error && (
          <div className="glass-card p-6 text-center text-red-400">
            <XCircle className="w-8 h-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        )}

        {!loading && tasks.length === 0 && !error && (
          <div className="glass-card p-12 text-center">
            <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No tasks found</h3>
            <p className="text-gray-500 mb-4">
              {search ? 'Try a different search term' : 'Create your first task from the dashboard'}
            </p>
            <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Go to Dashboard
            </Link>
          </div>
        )}

        {tasks.length > 0 && (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-gray-500 font-medium">Task</th>
                    <th className="text-center p-4 text-gray-500 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('status')}>
                      <div className="flex items-center justify-center gap-1">Status <SortIcon field="status" /></div>
                    </th>
                    <th className="text-right p-4 text-gray-500 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('total_cost')}>
                      <div className="flex items-center justify-end gap-1">Cost <SortIcon field="total_cost" /></div>
                    </th>
                    <th className="text-right p-4 text-gray-500 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('transaction_count')}>
                      <div className="flex items-center justify-end gap-1">Tx <SortIcon field="transaction_count" /></div>
                    </th>
                    <th className="text-right p-4 text-gray-500 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('duration_seconds')}>
                      <div className="flex items-center justify-end gap-1">Duration <SortIcon field="duration_seconds" /></div>
                    </th>
                    <th className="text-center p-4 text-gray-500 font-medium">Score</th>
                    <th className="text-right p-4 text-gray-500 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('created_at')}>
                      <div className="flex items-center justify-end gap-1">Created <SortIcon field="created_at" /></div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {tasks.map((task, i) => {
                      const statusConf = STATUS_CONFIG[task.status] || STATUS_CONFIG.completed;
                      const StatusIcon = statusConf.icon;
                      const isExpanded = expandedTask === task.id;

                      return (
                        <motion.tr
                          key={task.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <td className="p-4 max-w-xs">
                            <div className="text-white font-medium truncate">{task.description}</div>
                            <div className="text-[10px] text-gray-600 font-mono mt-0.5">{task.id.substring(0, 12)}...</div>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="mt-3 overflow-hidden"
                                >
                                  <div className="p-3 rounded-xl bg-white/5 space-y-3">
                                    {task.subtasks?.length > 0 && (
                                      <div>
                                        <span className="text-xs text-gray-500 font-medium">Subtasks ({task.subtasks.length}):</span>
                                        <div className="mt-1 space-y-1">
                                          {task.subtasks.slice(0, 5).map((st, si) => (
                                            <div key={si} className="flex items-center gap-2 text-xs">
                                              <span className="text-gray-600">{si + 1}.</span>
                                              <span className="text-gray-400">{st.title}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {task.review && (
                                      <div>
                                        <span className="text-xs text-gray-500 font-medium">Review:</span>
                                        <p className="text-xs text-gray-400 mt-1">{task.review.summary}</p>
                                      </div>
                                    )}

                                    <Link
                                      href={`/tasks/${task.id}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                                    >
                                      View Details <ExternalLink className="w-3 h-3" />
                                    </Link>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </td>

                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConf.bg} ${statusConf.color}`}>
                              <StatusIcon className={`w-3 h-3 ${statusConf.spin ? 'animate-spin' : ''}`} />
                              {statusConf.label}
                            </span>
                          </td>

                          <td className="p-4 text-right">
                            <span className="text-green-400 font-semibold font-mono">
                              ${task.totalCost.toFixed(4)}
                            </span>
                          </td>

                          <td className="p-4 text-right">
                            <span className="text-cyan-400 font-mono">{task.transactionCount}</span>
                          </td>

                          <td className="p-4 text-right">
                            <span className="text-blue-400 font-mono">
                              {task.durationSeconds > 0 ? `${task.durationSeconds.toFixed(1)}s` : '—'}
                            </span>
                          </td>

                          <td className="p-4 text-center">
                            {task.reviewScore ? (
                              <span className={`font-bold ${
                                task.reviewScore >= 8 ? 'text-green-400' :
                                task.reviewScore >= 6 ? 'text-yellow-400' :
                                'text-red-400'
                              }`}>
                                {task.reviewScore}/10
                              </span>
                            ) : (
                              <span className="text-gray-600">—</span>
                            )}
                          </td>

                          <td className="p-4 text-right">
                            <span className="text-gray-500 text-xs">
                              {task.createdAt
                                ? formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })
                                : '—'
                              }
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-white/5">
                <span className="text-xs text-gray-500">
                  Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setPage(p => Math.max(0, p - 1)); fetchWithParams(Math.max(0, page - 1)); }}
                    disabled={page === 0}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const pageNum = page < 3 ? i : page - 2 + i;
                    if (pageNum >= totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => { setPage(pageNum); fetchWithParams(pageNum); }}
                        className={`w-8 h-8 rounded-lg text-xs font-medium ${
                          page === pageNum
                            ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                            : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => { setPage(p => Math.min(totalPages - 1, p + 1)); fetchWithParams(Math.min(totalPages - 1, page + 1)); }}
                    disabled={page >= totalPages - 1}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}