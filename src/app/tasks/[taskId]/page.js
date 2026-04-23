'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { SkeletonCard } from '@/components/Skeleton';
import TaskTimeline from '@/components/TaskTimeline';
import TransactionLog from '@/components/TransactionLog';
import LiveMetrics from '@/components/LiveMetrics';
import {
  ArrowLeft, Clock, DollarSign, Zap, CheckCircle2, XCircle,
  Loader2, FileText, Star, Activity, Copy, Check,
} from 'lucide-react';
import { format } from 'date-fns';

export default function TaskDetailPage() {
  const { taskId } = useParams();
  const { theme } = useTheme();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (taskId) fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/status?taskId=${taskId}`);
      const data = await res.json();
      if (data.success) {
        setTask({
          id: data.taskId,
          status: data.status,
          description: data.description,
          startTime: data.startTime,
          endTime: data.endTime,
          completedAt: data.completedAt,
          payments: (data.payments || []).map(p => ({ ...p, amount: parseFloat(p.amount) || 0 })),
          events: data.events || [],
          subtasks: data.subtasks || [],
          results: data.results || [],
          review: data.review || null,
          totalCost: data.summary?.totalCost || 0,
          duration: data.summary?.duration || 0,
          transactionCount: data.summary?.transactionCount || 0,
          subtaskCount: data.summary?.subtaskCount || 0,
          agentsUsed: data.summary?.agentsUsed || 0,
        });
      } else {
        setError(data.error || 'Task not found');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(taskId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-5xl mx-auto px-4 pt-8 pb-12 space-y-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-5xl mx-auto px-4 pt-8 pb-12">
          <div className="glass-card p-12 text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Task Not Found</h2>
            <p className="text-gray-500 mb-4">{error}</p>
            <Link href="/tasks" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Tasks
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusColors = {
    completed: 'text-green-400 bg-green-500/20',
    failed: 'text-red-400 bg-red-500/20',
    running: 'text-yellow-400 bg-yellow-500/20',
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-12">

        <Link
          href="/tasks"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Task History
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status] || 'text-gray-400 bg-gray-500/20'}`}>
                  {task.status === 'completed' && <CheckCircle2 className="w-4 h-4 inline mr-1" />}
                  {task.status === 'failed' && <XCircle className="w-4 h-4 inline mr-1" />}
                  {task.status === 'running' && <Loader2 className="w-4 h-4 inline mr-1 animate-spin" />}
                  {task.status}
                </span>
                {task.review && (
                  <span className="flex items-center gap-1 text-yellow-400 text-sm">
                    <Star className="w-4 h-4" />
                    {task.review.score}/10
                  </span>
                )}
              </div>

              <h1 className="text-xl font-bold text-white mb-2">{task.description}</h1>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="font-mono">{taskId.substring(0, 16)}...</span>
                <button onClick={handleCopyId} className="hover:text-white transition-colors">
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                </button>
                {task.startTime && (
                  <>
                    <span>•</span>
                    <span>{format(new Date(task.startTime), 'PPpp')}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
            {[
              { icon: DollarSign, label: 'Total Cost', value: `$${task.totalCost.toFixed(4)}`, color: 'text-green-400' },
              { icon: Zap, label: 'Transactions', value: task.transactionCount, color: 'text-cyan-400' },
              { icon: Clock, label: 'Duration', value: task.duration > 0 ? `${task.duration.toFixed(1)}s` : '—', color: 'text-blue-400' },
              { icon: FileText, label: 'Subtasks', value: task.subtaskCount, color: 'text-purple-400' },
              { icon: Activity, label: 'Agents Used', value: task.agentsUsed, color: 'text-orange-400' },
            ].map((stat, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
                <div className={`text-lg font-bold ${stat.color} tabular-nums`}>{stat.value}</div>
                <div className="text-[10px] text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {task.payments?.length > 0 && (
          <div className="mb-6">
            <LiveMetrics task={task} transactions={task.payments} />
          </div>
        )}

        <div className="mb-6">
          <TaskTimeline task={task} />
        </div>

        {task.review && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-400" />
              Quality Review
            </h2>
            <div className="flex items-start gap-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${
                  task.review.score >= 8 ? 'text-green-400' :
                  task.review.score >= 6 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {task.review.score}
                </div>
                <div className="text-xs text-gray-500 mt-1">out of 10</div>
              </div>
              <div className="flex-1">
                <p className="text-gray-400">{task.review.summary}</p>
              </div>
            </div>
          </motion.div>
        )}

        {task.payments?.length > 0 && (
          <TransactionLog transactions={task.payments} />
        )}

        {task.events?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 mt-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Event Log ({task.events.length})</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {task.events.map((event, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5">
                  <span className="text-xs text-gray-600 font-mono w-20 flex-shrink-0 mt-0.5">
                    {event.timestamp ? format(new Date(event.timestamp), 'HH:mm:ss') : ''}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${
                    event.type === 'payment' ? 'bg-green-500/20 text-green-400' :
                    event.type === 'error' ? 'bg-red-500/20 text-red-400' :
                    'bg-white/10 text-gray-400'
                  }`}>
                    {event.type}
                  </span>
                  <span className="text-sm text-gray-400 flex-1">{event.message}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}