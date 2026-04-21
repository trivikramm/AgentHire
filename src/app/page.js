'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import { AGENT_TYPES } from '@/lib/constants';
import { useTheme } from '@/context/ThemeContext';
import {
  ArrowRight, Bot, CircleDollarSign, Zap, Shield,
  GitBranch, BarChart3, Globe, Code2
} from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'Autonomous Agent Teams',
    description: 'A Manager Agent decomposes your task, hires specialists, and coordinates delivery — all autonomously.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: CircleDollarSign,
    title: 'Sub-Cent Nanopayments',
    description: 'Every agent action triggers a USDC payment as low as $0.003. Real per-action pricing at scale.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    icon: Zap,
    title: 'Zero Gas Overhead',
    description: 'Arc provides gas-free settlement with sub-second finality. No margin lost to transaction fees.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: GitBranch,
    title: 'Agent-to-Agent Subcontracting',
    description: 'Agents can hire other agents, creating chains of nanopayments that prove machine-to-machine commerce.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Shield,
    title: 'On-Chain Verification',
    description: 'Every payment is verifiable on Arc Block Explorer. Full transparency for every sub-cent transaction.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
  {
    icon: BarChart3,
    title: 'Margin Analysis',
    description: 'Real-time proof that this model fails on Ethereum ($0.50/tx gas) but thrives on Arc ($0.00 gas).',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
];

const techStack = [
  { name: 'Arc', desc: 'Settlement Layer', icon: Globe },
  { name: 'USDC', desc: 'Value Token', icon: CircleDollarSign },
  { name: 'Circle Nanopayments', desc: 'Payment Infrastructure', icon: Zap },
  { name: 'Circle Wallets', desc: 'Agent Wallets', icon: Shield },
  { name: 'Gemini AI', desc: 'Agent Intelligence', icon: Bot },
  { name: 'Next.js', desc: 'Application Framework', icon: Code2 },
];

export default function HomePage() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <HeroSection />

      <section className="py-20 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Submit a task → Manager decomposes it → Specialists get hired and paid per action → Results delivered
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Submit Task', desc: 'Describe what you need in plain English', emoji: '📝' },
            { step: '02', title: 'Agent Decomposition', desc: 'Manager AI breaks it into subtasks and assigns specialists', emoji: '🧠' },
            { step: '03', title: 'Pay-Per-Action Execution', desc: 'Each agent action triggers a sub-cent USDC nanopayment', emoji: '💰' },
            { step: '04', title: 'Quality Review & Delivery', desc: 'Manager reviews, scores quality, and delivers results', emoji: '✅' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 text-center relative"
            >
              <div className="text-4xl mb-4">{item.emoji}</div>
              <div className="text-xs text-gray-600 mb-1">STEP {item.step}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.desc}</p>
              {i < 3 && (
                <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-700 z-10" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Meet the Agents
          </h2>
          <p className="text-gray-400">Each agent has a Circle Wallet and gets paid in USDC per action</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(AGENT_TYPES).map(([type, config], i) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-hover p-5 text-center"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center text-3xl mx-auto mb-3`}>
                {config.emoji}
              </div>
              <h3 className="font-semibold text-white">{config.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{config.role}</p>
              <div className="text-green-400 font-semibold">${config.costPerAction}/action</div>
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {config.skills.map((s, si) => (
                  <span key={si} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500">
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why AgentHire</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-hover p-6"
            >
              <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-3`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-sm text-gray-400">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Built With</h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {techStack.map((tech, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4 text-center"
            >
              <tech.icon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-white">{tech.name}</div>
              <div className="text-xs text-gray-500">{tech.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-12 neon-glow"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Hire Your Agent Team?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Watch AI agents collaborate and pay each other in real-time USDC nanopayments — powered by Arc.
          </p>
          <Link href="/dashboard" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2">
            Launch Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}