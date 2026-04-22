'use client';

import { useEffect, useState } from 'react';

interface TaskStatusBannerProps {
  status: 'idle' | 'running' | 'completed' | 'failed';
  summary?: {
    totalCost: number;
    duration: number;
    subtaskCount: number;
    transactionCount: number;
    agentsUsed: number;
  };
  onDismiss?: () => void;
}

export default function TaskStatusBanner({ status, summary, onDismiss }: TaskStatusBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status !== 'idle' && status !== 'failed') {
      setVisible(true);
    }

    if (status === 'completed') {
      const timeout = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 20000);
      return () => clearTimeout(timeout);
    }

    if (status === 'failed') {
      const timeout = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [status, onDismiss]);

  if (!visible || status === 'idle' || status === 'failed') return null;

  return (
    <>
      {/* Backdrop overlay to prevent interaction while running */}
      {status === 'running' && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40" />
      )}

      {/* Banner — centered top, BELOW the navbar */}
      <div
        className={`
          fixed top-20 left-1/2 -translate-x-1/2 z-50
          w-[90%] max-w-lg
          rounded-xl shadow-2xl overflow-hidden
          transition-all duration-500 animate-slide-down
          ${status === 'running'
            ? 'bg-gradient-to-r from-blue-900/95 to-purple-900/95 border border-blue-500/50'
            : 'bg-gradient-to-r from-green-900/95 to-emerald-900/95 border border-green-500/50'
          }
          backdrop-blur-md
        `}
      >
        {/* Close button */}
        <button
          onClick={() => { setVisible(false); onDismiss?.(); }}
          className="absolute top-3 right-3 text-gray-400 hover:text-white 
                     w-6 h-6 flex items-center justify-center rounded-full 
                     hover:bg-white/10 transition-colors text-sm"
        >
          ✕
        </button>

        <div className="p-5">
          {status === 'running' ? (
            <div className="flex items-center gap-4">
              {/* Animated spinner */}
              <div className="relative flex-shrink-0">
                <div className="h-10 w-10 border-3 border-blue-400/30 rounded-full" />
                <div className="absolute inset-0 h-10 w-10 border-3 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
              <div>
                <p className="text-white font-semibold">⚡ Agents are working on your task...</p>
                <p className="text-blue-300/80 text-sm mt-1">Processing subtasks & sending payments</p>
                {/* Progress dots */}
                <div className="flex gap-1 mt-2">
                  <span className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                <p className="text-white font-bold text-lg">Task Completed!</p>
              </div>

              {summary && (
                <>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-black/30 rounded-lg p-2 text-center">
                      <p className="text-green-400 font-bold text-sm">
                        ${summary.totalCost.toFixed(4)}
                      </p>
                      <p className="text-gray-400 text-[10px]">Total Cost</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2 text-center">
                      <p className="text-blue-400 font-bold text-sm">
                        {summary.transactionCount}
                      </p>
                      <p className="text-gray-400 text-[10px]">Transactions</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2 text-center">
                      <p className="text-purple-400 font-bold text-sm">
                        {summary.subtaskCount}
                      </p>
                      <p className="text-gray-400 text-[10px]">Subtasks</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2 text-center">
                      <p className="text-yellow-400 font-bold text-sm">
                        {summary.duration.toFixed(1)}s
                      </p>
                      <p className="text-gray-400 text-[10px]">Duration</p>
                    </div>
                  </div>
                  <p className="text-green-300/60 text-xs text-center">
                    ✅ All payments settled on-chain
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Progress bar animation for running state */}
        {status === 'running' && (
          <div className="h-1 bg-gray-800">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-progress" />
          </div>
        )}
      </div>
    </>
  );
}
