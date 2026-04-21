'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, ArrowRight, CircleDollarSign, Bot, Cpu } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function HeroSection() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: isLight ? '#f4f6fb' : '#060714' }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl ${
        isLight ? 'bg-blue-200/30' : 'bg-blue-500/10'
      }`} />
      <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl ${
        isLight ? 'bg-purple-200/30' : 'bg-purple-500/10'
      }`} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{
            background: isLight ? '#ffffff' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
          }}
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            Powered by Circle Nanopayments + Arc
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
        >
          <span style={{ color: isLight ? '#0f172a' : '#ffffff' }}>Hire AI Agents.</span>
          <br />
          <span className="gradient-text">Pay Per Action.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`text-lg md:text-xl max-w-3xl mx-auto mb-12 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}
        >
          The autonomous AI staffing agency where specialist agents bid, work, and get paid
          in sub-cent USDC nanopayments on Arc — creating chains of machine-to-machine commerce
          that are impossible with traditional gas costs.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/dashboard" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
            Launch AgentHire
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            className="btn-secondary flex items-center gap-2 text-lg px-8 py-4"
          >
            View on GitHub
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {[
            { icon: CircleDollarSign, label: 'Cost Per Action', value: '$0.003', color: 'text-green-400' },
            { icon: Zap, label: 'Settlement', value: '<1 sec', color: 'text-cyan-400' },
            { icon: Bot, label: 'Agent Types', value: '5', color: 'text-purple-400' },
            { icon: Cpu, label: 'Gas Cost', value: '$0.00', color: 'text-blue-400' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-4 text-center">
              <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}