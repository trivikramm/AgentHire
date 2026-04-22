'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import TaskCreator from '@/components/TaskCreator';
import AgentNetwork from '@/components/AgentNetwork';
import PaymentFlow from '@/components/PaymentFlow';
import TransactionLog from '@/components/TransactionLog';
import LiveMetrics from '@/components/LiveMetrics';
import TaskTimeline from '@/components/TaskTimeline';
import TaskStatusBanner from '@/components/TaskStatusBanner';
import { useAgents } from '@/hooks/useAgents';
import { useTask } from '@/hooks/useTask';
import { usePayments } from '@/hooks/usePayments';
import { useTheme } from '@/context/ThemeContext';
import { Zap, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const { theme } = useTheme();
  const { agents, loading: agentsLoading, initAgents, refreshAgents } = useAgents();
  const { task, loading: taskLoading, events, taskStatus, summary: taskSummary, createTask, stopPolling } = useTask();
  const { transactions, totalVolume, refreshPayments } = usePayments();
  const initRef = useRef(false);
  const prevStatus = useRef('idle');

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      handleInit();
    }
  }, []);

  useEffect(() => {
    if (prevStatus.current === 'running' && taskStatus === 'completed') {
      toast.success(
        `Task completed! ${taskSummary?.transactionCount || 0} payments | $${(taskSummary?.totalCost || 0).toFixed(4)} USDC`,
        { id: 'task', duration: 8000 }
      );
      refreshAgents();
      refreshPayments();
    } else if (prevStatus.current === 'running' && taskStatus === 'failed') {
      toast.error('Task failed', { id: 'task' });
    }
    prevStatus.current = taskStatus;
  }, [taskStatus, taskSummary, refreshAgents, refreshPayments]);

  const handleInit = async () => {
    toast.loading('Initializing agent network...', { id: 'init' });
    try {
      await initAgents();
      toast.success('Agent network ready!', { id: 'init' });
    } catch (error) {
      toast.error('Failed to initialize agents', { id: 'init' });
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

  const handleDismissBanner = useCallback(() => {
    // Don't stop polling - let polling complete
  }, []);

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

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TaskCreator onSubmit={handleCreateTask} loading={taskLoading} />

            {(task || transactions.length > 0) && (
              <LiveMetrics
                task={task}
                transactions={task?.payments || transactions}
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
            <AgentNetwork agents={agents} />
          </div>
        </div>
      </div>
    </div>
  );
}
