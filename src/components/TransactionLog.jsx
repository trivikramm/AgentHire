'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink, ArrowUpRight, Hash, Search,
  Filter, Download, ChevronDown, ChevronUp, Copy, Check,
} from 'lucide-react';

const TX_TYPES = {
  all: { label: 'All', color: 'text-white' },
  payment: { label: 'Payments', color: 'text-green-400' },
  subcontract: { label: 'Subcontracts', color: 'text-blue-400' },
};

export default function TransactionLog({ transactions = [] }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortDir, setSortDir] = useState('desc');
  const [expanded, setExpanded] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    let result = [...transactions];

    if (typeFilter !== 'all') {
      result = result.filter(tx =>
        (tx.tx_type || tx.txType || 'payment') === typeFilter
      );
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(tx =>
        (tx.from || tx.from_address || '').toLowerCase().includes(s) ||
        (tx.to || tx.to_address || '').toLowerCase().includes(s) ||
        (tx.txHash || tx.tx_hash || '').toLowerCase().includes(s) ||
        (tx.memo || '').toLowerCase().includes(s) ||
        (tx.from_label || '').toLowerCase().includes(s) ||
        (tx.to_label || '').toLowerCase().includes(s)
      );
    }

    if (sortDir === 'asc') result.reverse();

    return result;
  }, [transactions, search, typeFilter, sortDir]);

  const displayed = showAll ? filtered : filtered.slice(0, 20);

  const totalVolume = filtered.reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['#', 'From', 'To', 'Amount', 'Currency', 'Status', 'Type', 'TxHash', 'Timestamp'];
    const rows = filtered.map((tx, i) => [
      i + 1,
      tx.from || tx.from_address || '',
      tx.to || tx.to_address || '',
      parseFloat(tx.amount).toFixed(6),
      tx.currency || 'USDC',
      tx.status || 'confirmed',
      tx.tx_type || tx.txType || 'payment',
      tx.txHash || tx.tx_hash || '',
      tx.timestamp || tx.created_at || '',
    ]);

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agenthire-transactions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Hash className="w-5 h-5 text-cyan-400" />
          Transaction Log
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {filtered.length} tx · ${totalVolume.toFixed(4)} USDC
          </span>
          <button
            onClick={handleExportCSV}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            title="Export CSV"
          >
            <Download className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search address, hash, label..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        <div className="flex gap-2">
          {Object.entries(TX_TYPES).map(([key, { label, color }]) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                typeFilter === key
                  ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}

          <button
            onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
            className="px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 flex items-center gap-1"
          >
            {sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            {sortDir === 'desc' ? 'Newest' : 'Oldest'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-2 text-gray-500 font-medium">#</th>
              <th className="text-left py-2 text-gray-500 font-medium">From → To</th>
              <th className="text-right py-2 text-gray-500 font-medium">Amount</th>
              <th className="text-center py-2 text-gray-500 font-medium">Type</th>
              <th className="text-right py-2 text-gray-500 font-medium">Status</th>
              <th className="text-right py-2 text-gray-500 font-medium">Tx Hash</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {displayed.map((tx, i) => {
                const txType = tx.tx_type || tx.txType || 'payment';
                const fromAddr = tx.from || tx.from_address || '';
                const toAddr = tx.to || tx.to_address || '';
                const hash = tx.txHash || tx.tx_hash || '';
                const fromLabel = tx.from_label || '';
                const toLabel = tx.to_label || '';
                const explorerUrl = tx.blockExplorerUrl || tx.block_explorer_url || '';
                const isExpanded = expanded === (tx.id || i);

                return (
                  <motion.tr
                    key={tx.id || i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.5) }}
                    onClick={() => setExpanded(isExpanded ? null : (tx.id || i))}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="py-3 text-gray-500 font-mono text-xs">{i + 1}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          {fromLabel && (
                            <span className="text-[10px] text-gray-500">{fromLabel}</span>
                          )}
                          <span className="font-mono text-xs text-gray-400">
                            {fromAddr.substring(0, 8)}...{fromAddr.slice(-4)}
                          </span>
                        </div>
                        <ArrowUpRight className={`w-3 h-3 flex-shrink-0 ${
                          txType === 'subcontract' ? 'text-blue-400' : 'text-green-400'
                        }`} />
                        <div className="flex flex-col">
                          {toLabel && (
                            <span className="text-[10px] text-gray-500">{toLabel}</span>
                          )}
                          <span className="font-mono text-xs text-gray-400">
                            {toAddr.substring(0, 8)}...{toAddr.slice(-4)}
                          </span>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-2 p-2 rounded-lg bg-white/5 text-xs overflow-hidden"
                          >
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-gray-600">Full From:</span>
                                <div className="flex items-center gap-1">
                                  <span className="font-mono text-gray-400 truncate">{fromAddr}</span>
                                  <button onClick={(e) => { e.stopPropagation(); handleCopy(fromAddr); }}>
                                    {copiedId === fromAddr ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-gray-600" />}
                                  </button>
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">Full To:</span>
                                <div className="flex items-center gap-1">
                                  <span className="font-mono text-gray-400 truncate">{toAddr}</span>
                                  <button onClick={(e) => { e.stopPropagation(); handleCopy(toAddr); }}>
                                    {copiedId === toAddr ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-gray-600" />}
                                  </button>
                                </div>
                              </div>
                              {tx.memo && (
                                <div className="col-span-2">
                                  <span className="text-gray-600">Memo:</span>
                                  <span className="font-mono text-gray-400 ml-1">{tx.memo}</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-green-400 font-semibold font-mono">
                        ${(parseFloat(tx.amount) || 0).toFixed(4)}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        txType === 'subcontract'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {txType}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        tx.status === 'confirmed'
                          ? 'bg-green-500/20 text-green-400'
                          : tx.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {tx.status || 'confirmed'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {explorerUrl ? (
                        <a
                          href={explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs font-mono"
                        >
                          {hash.substring(0, 10)}...
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="font-mono text-xs text-gray-500">
                          {hash.substring(0, 10)}...
                        </span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            {search || typeFilter !== 'all'
              ? 'No transactions match your filters'
              : 'No transactions yet. Create a task to see nanopayments flow!'
            }
          </div>
        )}

        {!showAll && filtered.length > 20 && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full py-3 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Show all {filtered.length} transactions
          </button>
        )}

        {showAll && filtered.length > 20 && (
          <button
            onClick={() => setShowAll(false)}
            className="w-full py-3 text-sm text-gray-500 hover:text-gray-400 transition-colors"
          >
            Show less
          </button>
        )}
      </div>
    </div>
  );
}