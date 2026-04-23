'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import TaskCreator from '@/components/TaskCreator';
import AgentNetwork from '@/components/AgentNetwork';
import PaymentFlow from '@/components/PaymentFlow';
import TransactionLog from '@/components/TransactionLog';
import LiveMetrics from '@/components/LiveMetrics';
import TaskTimeline from '@/components/TaskTimeline';
import TaskStatusBanner from '@/components/TaskStatusBanner';
import { SkeletonDashboard } from '@/components/Skeleton';
import { useAgents } from '@/hooks/useAgents';
import { useTask } from '@/hooks/useTask';
import { usePayments } from '@/hooks/usePayments';
import { useTheme } from '@/context/ThemeContext';
import { Zap, RefreshCw, Activity, Clock } from 'lucide-react';

export default function DashboardPage() {
  const { theme } = useTheme();
  const { agents, loading: agentsLoading, initAgents, refreshAgents } = useAgents();
  const { task, loading: taskLoading, events, taskStatus, summary: taskSummary, elapsedTime, createTask, stopPolling } = useTask();
  const { transactions, totalVolume, refreshPayments } = usePayments();
  const initRef = useRef(false);
  const prevStatus = useRef('idle');
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      handleInit();
    }
  }, []);

  useEffect(() => {
    if (prevStatus.current === 'running' && taskStatus === 'completed') {
      toast.success(
        `✅ Task completed! ${taskSummary?.transactionCount || 0} payments | $${(taskSummary?.totalCost || 0).toFixed(4)} USDC | ${(taskSummary?.duration || 0).toFixed(1)}s`,
        { id: 'task', duration: 8000 }
      );
      refreshAgents();
      refreshPayments();
    } else if (prevStatus.current === 'running' && taskStatus === 'failed') {
      toast.error('❌ Task failed', { id: 'task' });
    }
    prevStatus.current = taskStatus;
  }, [taskStatus, taskSummary, refreshAgents, refreshPayments]);

  const handleInit = async () => {
    toast.loading('Initializing agent network...', { id: 'init' });
    try {
      await initAgents();
      toast.success('Agent network ready!', { id: 'init' });
      setPageReady(true);
    } catch (error) {
      toast.error('Failed to initialize agents', { id: 'init' });
      setPageReady(true);
    }
  };

  const handleCreateTask = async (description) => {
    if (!description?.trim()) return;

    toast.loading('Agents are working on your task...', { id: 'task' });

    try {
      await createTask(description);
    } catch (error) {
      console.error('Task creation error:', error);
      toast.error('Error creating task', { id: 'task' });
    }
  };

  const handleDismissBanner = useCallback(() => {}, []);

  const isRunning = taskStatus === 'running';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: theme === 'light' ? '#ffffff' : '#1e293b',
            color: theme === 'light' ? '#0f172a' : '#ffffff',
            border: theme === 'light' ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: theme === 'light' ? '0 4px 12px rgba(0,0,0,0.08)' : '0 4px 12px rgba(0,0,0,0.4)',
          },
        }}
      />

      {/* Task Status Banner */}
      <TaskStatusBanner
        status={taskStatus}
        summary={taskSummary}
        onDismiss={handleDismissBanner}
      />

      <div className="max-w-7xl mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-400" />
              AgentHire Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Autonomous AI Agent Staffing Agency — Powered by Circle Nanopayments on Arc
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isRunning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
              >
                <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-yellow-400 font-mono font-bold text-sm tabular-nums">
                  {elapsedTime.toFixed(1)}s
                </span>
                <span className="text-yellow-400/60 text-xs">running</span>
              </motion.div>
            )}

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
              <Activity className={`w-4 h-4 ${
                isRunning ? 'text-yellow-400 animate-pulse' :
                taskStatus === 'completed' ? 'text-green-400' :
                'text-gray-500'
              }`} />
              <span className="text-xs text-gray-400 capitalize">{taskStatus}</span>
            </div>

            <button
              onClick={handleInit}
              disabled={agentsLoading}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${agentsLoading ? 'animate-spin' : ''}`} />
              Reset Agents
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {!pageReady && (
          <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <SkeletonDashboard />
          </motion.div>
        )}
      </AnimatePresence>

      {pageReady && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-7xl mx-auto px-4 pb-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <TaskCreator onSubmit={handleCreateTask} loading={taskLoading || isRunning} />

              {(task || transactions.length > 0) && (
                <LiveMetrics
                  task={task}
                  transactions={task?.payments || transactions}
                  elapsedTime={elapsedTime}
                  isRunning={isRunning}
                />
              )}

              {task && <TaskTimeline task={task} />}

              <PaymentFlow
                events={events}
                payments={task?.payments || []}
                status={taskStatus}
                summary={taskSummary}
              />

              {(task?.payments?.length > 0 || transactions.length > 0) && (
                <TransactionLog transactions={task?.payments || transactions} />
              )}
            </div>

            <div className="space-y-6">
              {taskStatus === 'completed' && taskSummary && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-4 border border-green-500/20"
                >
                  <h3 className="text-sm font-semibold text-green-400 mb-3">Last Task Summary</h3>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <div className="text-lg font-bold text-white">{taskSummary.transactionCount}</div>
                      <div className="text-[10px] text-gray-500">Payments</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-400">${taskSummary.totalCost?.toFixed(4)}</div>
                      <div className="text-[10px] text-gray-500">Total Cost</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-cyan-400">{taskSummary.subtaskCount}</div>
                      <div className="text-[10px] text-gray-500">Subtasks</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-400">{taskSummary.duration?.toFixed(1)}s</div>
                      <div className="text-[10px] text-gray-500">Duration</div>
                    </div>
                  </div>
                </motion.div>
              )}

              <AgentNetwork agents={agents} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
