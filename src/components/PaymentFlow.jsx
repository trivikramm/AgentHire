'use client';
import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ExternalLink, CheckCircle2, CircleDollarSign, Loader2 } from 'lucide-react';

export default function PaymentFlow({ events = [], payments = [], status = 'idle', summary = null }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events.length]);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <CircleDollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Payment Flow</h2>
            <p className="text-sm text-gray-500">{payments.length} nanopayments processed</p>
          </div>
          {status === 'running' && (
            <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
              <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
              Live
            </span>
          )}
          {status === 'completed' && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
              Complete
            </span>
          )}
        </div>
        <span className="text-gray-400 text-xs">{events.length} events</span>
      </div>

      {status === 'completed' && summary && (
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="text-green-400 font-bold text-sm">${summary.totalCost?.toFixed(4)}</div>
              <div className="text-gray-500 text-[10px]">Total Cost</div>
            </div>
            <div>
              <div className="text-blue-400 font-bold text-sm">{summary.transactionCount}</div>
              <div className="text-gray-500 text-[10px]">Transactions</div>
            </div>
            <div>
              <div className="text-purple-400 font-bold text-sm">{summary.subtaskCount}</div>
              <div className="text-gray-500 text-[10px]">Subtasks</div>
            </div>
            <div>
              <div className="text-yellow-400 font-bold text-sm">{summary.duration?.toFixed(1)}s</div>
              <div className="text-gray-500 text-[10px]">Duration</div>
            </div>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
        <AnimatePresence>
          {events.map((event, i) => (
            <motion.div
              key={event.id || i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.02, 1) }}
              className={`flex items-start gap-3 p-3 rounded-xl ${
                event.type === 'payment' || event.type === 'subcontract'
                  ? 'bg-green-500/5 border border-green-500/10'
                  : event.type === 'error'
                  ? 'bg-red-500/5 border border-red-500/10'
                  : event.type === 'task_complete' || event.type === 'review_complete'
                  ? 'bg-blue-500/5 border border-blue-500/10'
                  : 'bg-white/5 border border-white/5'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {event.type === 'payment' || event.type === 'subcontract' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : event.type === 'executing' || event.type === 'decomposing' ? (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                ) : event.type === 'task_complete' ? (
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300">{event.message}</p>
                {event.payment?.txHash && (
                  <a
                    href={event.payment.blockExplorerUrl || `https://testnet.arcscan.app/tx/${event.payment.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1 text-xs text-blue-400 hover:text-blue-300"
                  >
                    <span className="font-mono truncate max-w-[200px]">{event.payment.txHash}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                )}
              </div>

              <div className="text-xs text-gray-600 flex-shrink-0">
                {event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : ''}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {status === 'running' && (
          <div className="flex items-center gap-2 py-2 px-3 text-gray-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            Processing...
          </div>
        )}

        {events.length === 0 && status === 'idle' && (
          <div className="text-center py-12 text-gray-600">
            <CircleDollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Payment events will appear here in real-time</p>
          </div>
        )}

        {events.length === 0 && status === 'running' && (
          <div className="text-center py-8 text-gray-500">
            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-400" />
            <p>Waiting for events...</p>
          </div>
        )}
      </div>
    </div>
  );
}