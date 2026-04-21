'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X, Zap, BarChart3, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b"
      style={{
        background: theme === 'dark' ? 'rgba(6, 7, 20, 0.8)' : 'rgba(255, 255, 255, 0.85)',
        borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">AgentHire</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="theme-text-secondary hover:theme-text transition-colors">Home</Link>
            <Link href="/dashboard" className="theme-text-secondary hover:theme-text transition-colors flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Link>
            <a
              href="https://testnet.arcscan.app"
              target="_blank"
              rel="noopener noreferrer"
              className="theme-text-secondary hover:theme-text transition-colors"
            >
              Arc Explorer ↗
            </a>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl transition-all duration-300 hover:scale-110"
              style={{
                background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              }}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600" />
              )}
            </button>

            <Link href="/dashboard" className="btn-primary text-sm">
              Launch App
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg"
              style={{
                background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
              }}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600" />
              )}
            </button>

            <button className="theme-text" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden backdrop-blur-xl px-4 py-4 space-y-3"
          style={{
            background: theme === 'dark' ? 'rgba(6, 7, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'}`,
          }}
        >
          <Link href="/" className="block theme-text-secondary hover:theme-text py-2">Home</Link>
          <Link href="/dashboard" className="block theme-text-secondary hover:theme-text py-2">Dashboard</Link>
          <Link href="/dashboard" className="block btn-primary text-center text-sm">Launch App</Link>
        </motion.div>
      )}
    </nav>
  );
}