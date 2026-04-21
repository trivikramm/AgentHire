'use client';
import { motion } from 'framer-motion';
import { ExternalLink, ArrowUpRight, ArrowDownRight, Hash } from 'lucide-react';

export default function TransactionLog({ transactions = [] }) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Hash className="w-5 h-5 text-cyan-400" />
          Transaction Log
        </h2>
        <span className="text-sm text-gray-500">{transactions.length} transactions</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-2 text-gray-500 font-medium">#</th>
              <th className="text-left py-2 text-gray-500 font-medium">From → To</th>
              <th className="text-right py-2 text-gray-500 font-medium">Amount</th>
              <th className="text-right py-2 text-gray-500 font-medium">Status</th>
              <th className="text-right py-2 text-gray-500 font-medium">Tx Hash</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, i) => (
              <motion.tr
                key={tx.id || i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-3 text-gray-500">{i + 1}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-400 max-w-[80px] truncate">
                      {tx.from?.substring(0, 10)}...
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-green-400" />
                    <span className="font-mono text-xs text-gray-400 max-w-[80px] truncate">
                      {tx.to?.substring(0, 10)}...
                    </span>
                  </div>
                </td>
                <td className="py-3 text-right">
                  <span className="text-green-400 font-semibold">
                    ${tx.amount?.toFixed(4)}
                  </span>
                  <span className="text-gray-600 ml-1">USDC</span>
                </td>
                <td className="py-3 text-right">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    tx.status === 'confirmed'
                      ? 'bg-green-500/20 text-green-400'
                      : tx.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {tx.status}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <a
                    href={tx.blockExplorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs font-mono"
                  >
                    {tx.txHash?.substring(0, 10)}...
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {transactions.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            No transactions yet. Create a task to see nanopayments flow!
          </div>
        )}
      </div>
    </div>
  );
}