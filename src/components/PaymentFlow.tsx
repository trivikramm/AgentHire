'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, CircleDollarSign, Loader2, AlertCircle, ExternalLink } from 'lucide-react';

const EVENT_ICONS: Record<string, string> = {
  decomposing: '🧠',
  decomposed: '📋',
  hiring: '🤝',
  executing: '⚡',
  completed: '✅',
  review: '🧠',
  review_complete: '📊',
  task_complete: '🎉',
  payment: '💸',
  payment_initiated: '💸',
  transfer_submitted: '⏳',
  transfer_pending: '⏳',
  transfer_confirmed: '✅',
  transfer_timeout: '⚠️',
  funding: '💰',
  error: '❌',
  subcontract: '🔄',
};

const EVENT_COLORS: Record<string, string> = {
  decomposing: 'text-purple-400',
  decomposed: 'text-blue-400',
  hiring: 'text-yellow-400',
  executing: 'text-cyan-400',
  completed: 'text-green-400',
  review: 'text-orange-400',
  review_complete: 'text-blue-400',
  task_complete: 'text-emerald-400',
  payment: 'text-green-400',
  payment_initiated: 'text-cyan-400',
  transfer_submitted: 'text-orange-400',
  transfer_pending: 'text-yellow-400',
  transfer_confirmed: 'text-green-500',
  transfer_timeout: 'text-yellow-500',
  funding: 'text-amber-400',
  error: 'text-red-400',
  subcontract: 'text-purple-400',
};

interface TaskEvent {
  id: string;
  timestamp?: string;
  type: string;
  message: string;
  payment?: {
    id: string;
    txHash?: string;
    amount: number;
    status: string;
    simulated?: boolean;
  };
  data?: any;
}

interface PaymentFlowProps {
  events?: TaskEvent[];
  payments?: any[];
  status?: 'idle' | 'running' | 'completed';
  summary?: {
    totalCost: number;
    transactionCount: number;
    duration: number;
    subtaskCount: number;
    agentsUsed: number;
    avgCostPerTx: number;
  };
}

export default function PaymentFlow({ events = [], payments = [], status = 'idle', summary }: PaymentFlowProps) {
  const displayEvents = events.length > 0 ? events : payments.map((p, i) => ({
    id: p.id || `pay_${i}`,
    type: p.simulated ? 'payment' : 'transfer_confirmed',
    message: `${p.simulated ? '🎲 Simulated' : '✅ Real'} transfer: $${p.amount?.toFixed(3)} USDC`,
    payment: p,
    timestamp: p.timestamp,
  }));

  return (
    <div className="bg-gray-900/80 border border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-green-400" />
            Payment Flow
          </h3>
          {status === 'running' && (
            <span className="flex items-center gap-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
              <span className="h-2 w-2 bg-blue-400 rounded-full animate-pulse" />
              Live
            </span>
          )}
          {status === 'completed' && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
              ✓ Complete
            </span>
          )}
        </div>
        <span className="text-gray-400 text-xs">
          {displayEvents.length} events
        </span>
      </div>

      {/* Events List */}
      <div className="max-h-[500px] overflow-y-auto p-3 space-y-1">
        <AnimatePresence>
          {displayEvents.map((event, index) => (
            <EventRow key={event.id || index} event={event} isNew={index === displayEvents.length - 1} />
          ))}
        </AnimatePresence>

        {status === 'running' && displayEvents.length === 0 && (
          <div className="flex items-center gap-2 py-2 px-3 text-gray-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Waiting for events...
          </div>
        )}

        {status === 'completed' && displayEvents.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            <CircleDollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No events recorded</p>
          </div>
        )}
      </div>

      {/* Completion Summary */}
      {status === 'completed' && summary && (
        <div className="border-t border-gray-700 p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard label="Total Cost" value={`$${summary.totalCost.toFixed(4)}`} color="text-green-400" />
            <SummaryCard label="Transactions" value={String(summary.transactionCount)} color="text-blue-400" />
            <SummaryCard label="Duration" value={`${summary.duration}s`} color="text-purple-400" />
            <SummaryCard label="Subtasks" value={String(summary.subtaskCount)} color="text-yellow-400" />
          </div>
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-400">
              Avg cost per tx: <span className="text-green-400">${summary.avgCostPerTx.toFixed(6)}</span>
              {' | '}
              Agents used: <span className="text-blue-400">{summary.agentsUsed}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// 📝 Event Row Component
// ============================================
function EventRow({ event, isNew }: { event: TaskEvent; isNew: boolean }) {
  const icon = EVENT_ICONS[event.type] || '📌';
  const color = EVENT_COLORS[event.type] || 'text-gray-400';
  const time = event.timestamp ? new Date(event.timestamp).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }) : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`
        flex items-start gap-2 py-1.5 px-2 rounded-lg text-sm
        hover:bg-gray-800/40 transition-colors
        ${event.type === 'error' ? 'bg-red-900/10' : ''}
        ${event.type === 'task_complete' ? 'bg-green-900/20 border border-green-800/50' : ''}
      `}
    >
      <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`${color} break-words`}>
          {formatMessage(event.message)}
        </p>
        {event.payment?.txHash && (
          <a
            href={`https://testnet.arcscan.app/tx/${event.payment.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-0.5 text-xs text-blue-400 hover:text-blue-300"
          >
            <span className="font-mono truncate max-w-[200px]">{event.payment.txHash.substring(0, 16)}...</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        )}
      </div>
      {time && (
        <span className="text-gray-600 text-xs flex-shrink-0 font-mono">{time}</span>
      )}
    </motion.div>
  );
}

function formatMessage(msg: string): string {
  // Remove leading emoji duplicates (we show icon separately)
  return msg.replace(/^[🚀🧩🔄✅💸⏳💰❌🎉⚠️📊📋🧠⚡]\s*/, '');
}

// ============================================
// 📊 Summary Card
// ============================================
function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-black/30 rounded-lg p-2 text-center">
      <p className={`${color} font-bold text-sm`}>{value}</p>
      <p className="text-gray-500 text-xs">{label}</p>
    </div>
  );
}
