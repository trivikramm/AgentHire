'use client';
import { motion } from 'framer-motion';

export function SkeletonPulse({ className = '' }) {
  return (
    <motion.div
      className={`bg-white/5 rounded-lg ${className}`}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonPulse
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <SkeletonPulse className="w-10 h-10 rounded-xl" />
        <div className="flex-1">
          <SkeletonPulse className="h-4 w-32 mb-2" />
          <SkeletonPulse className="h-3 w-24" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

export function SkeletonMetrics() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card p-4">
          <SkeletonPulse className="w-8 h-8 rounded-lg mb-2" />
          <SkeletonPulse className="h-6 w-20 mb-1" />
          <SkeletonPulse className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <SkeletonPulse className="h-6 w-40" />
        <SkeletonPulse className="h-4 w-24" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5">
            <SkeletonPulse className="h-4 w-8" />
            <SkeletonPulse className="h-4 w-40 flex-1" />
            <SkeletonPulse className="h-4 w-20" />
            <SkeletonPulse className="h-5 w-16 rounded-full" />
            <SkeletonPulse className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonAgentNetwork() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <SkeletonPulse className="h-6 w-36" />
        <SkeletonPulse className="h-4 w-20" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <SkeletonPulse className="w-10 h-10 rounded-xl" />
              <div>
                <SkeletonPulse className="h-4 w-24 mb-1" />
                <SkeletonPulse className="h-3 w-16" />
              </div>
            </div>
            <SkeletonPulse className="h-3 w-full mb-2" />
            <SkeletonPulse className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <SkeletonPulse className="h-6 w-48 mb-4" />
            <SkeletonPulse className="h-24 w-full mb-4 rounded-xl" />
            <div className="flex justify-between items-center">
              <SkeletonPulse className="h-4 w-32" />
              <SkeletonPulse className="h-10 w-32 rounded-xl" />
            </div>
          </div>

          <SkeletonMetrics />
          <SkeletonTable rows={5} />
        </div>

        <div className="space-y-6">
          <SkeletonAgentNetwork />
        </div>
      </div>
    </div>
  );
}