'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import TaskCreator from '@/components/TaskCreator';
import AgentNetwork from '@/components/AgentNetwork';
import PaymentFlow from '@/components/PaymentFlow';
import TransactionLog from '@/components/TransactionLog';
import LiveMetrics from '@/components/LiveMetrics';
import TaskTimeline from '@/components/TaskTimeline';
import { useAgents } from '@/hooks/useAgents';
import { useTask } from '@/hooks/useTask';
import { usePayments } from '@/hooks/usePayments';
import { useTheme } from '@/context/ThemeContext';
import { Zap, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const { theme } = useTheme();
  const { agents, loading: agentsLoading, initAgents, refreshAgents } = useAgents();
  const { task, loading: taskLoading, events, createTask } = useTask();
  const { transactions, totalVolume, refreshPayments } = usePayments();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      handleInit();
    }
  }, [initialized]);

  const handleInit = async () => {
    toast.loading('Initializing agent network...', { id: 'init' });
    try {
      await initAgents();
      toast.success('Agent network ready!', { id: 'init' });
      setInitialized(true);
    } catch (error) {
      toast.error('Failed to initialize agents', { id: 'init' });
    }
  };

  const handleCreateTask = async (description) => {
    toast.loading('Agents are working on your task...', { id: 'task' });
    try {
      const result = await createTask(description);
      if (result?.status === 'completed') {
        toast.success(
          `Task completed! ${result.payments.length} payments totaling $${result.totalCost.toFixed(4)} USDC`,
          { id: 'task', duration: 5000 }
        );
      } else if (result?.status === 'failed') {
        toast.error('Task failed: ' + (result.error || 'Unknown error'), { id: 'task' });
      }
      await refreshAgents();
      await refreshPayments();
    } catch (error) {
      toast.error('Error creating task', { id: 'task' });
    }
  };

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

            {(task?.payments?.length > 0 || transactions.length > 0) && (
              <TransactionLog transactions={task?.payments || transactions} />
            )}
          </div>

          <div className="space-y-6">
            <PaymentFlow
              events={task?.events || events}
              payments={task?.payments || []}
            />

            <AgentNetwork agents={agents} />
          </div>
        </div>
      </div>
    </div>
  );
}