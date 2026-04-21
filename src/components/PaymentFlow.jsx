'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ExternalLink, CheckCircle2, CircleDollarSign, Loader2 } from 'lucide-react';

export default function PaymentFlow({ events = [], payments = [] }) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <CircleDollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Live Payment Flow</h2>
            <p className="text-sm text-gray-500">{payments.length} nanopayments processed</p>
          </div>
        </div>
        {payments.length > 0 && (
          <div className="text-right">
            <div className="text-sm text-green-400 font-semibold">
              ${payments.reduce((s, p) => s + p.amount, 0).toFixed(4)} USDC
            </div>
            <div className="text-xs text-gray-500">Total volume</div>
          </div>
        )}
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
        <AnimatePresence>
          {events.map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-start gap-3 p-3 rounded-xl ${
                event.type === 'payment' || event.type === 'subcontract'
                  ? 'bg-green-500/5 border border-green-500/10'
                  : event.type === 'error'
                  ? 'bg-red-500/5 border border-red-500/10'
                  : event.type === 'task_complete'
                  ? 'bg-blue-500/5 border border-blue-500/10'
                  : 'bg-white/5 border border-white/5'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {event.type === 'payment' || event.type === 'subcontract' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : event.type === 'executing' ? (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300">{event.message}</p>
                {event.payment && (
                  <a
                    href={event.payment.blockExplorerUrl}
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
                {new Date(event.timestamp).toLocaleTimeString()}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {events.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <CircleDollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Payment events will appear here in real-time</p>
          </div>
        )}
      </div>
    </div>
  );
}