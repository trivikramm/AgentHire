'use client';
import { Zap } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function Footer() {
  const { theme } = useTheme();

  return (
    <footer className="border-t mt-20" 
      style={{
        background: theme === 'dark' ? 'rgba(6,7,20,0.5)' : 'rgba(248,250,252,0.8)',
        borderTopColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold gradient-text">AgentHire</span>
          </div>

          <div className="flex items-center gap-6 text-sm theme-text-muted">
            <span>Built for the Agentic Economy on Arc Hackathon</span>
            <span>•</span>
            <span>Powered by Circle + USDC</span>
          </div>

          <div className="flex items-center gap-4">
            <a href="https://developers.circle.com" target="_blank" className="theme-text-muted hover:theme-text transition-colors text-sm">
              Circle Docs
            </a>
            <a href="https://arc.circle.com" target="_blank" className="theme-text-muted hover:theme-text transition-colors text-sm">
              Arc
            </a>
            <a href="https://github.com" target="_blank" className="theme-text-muted hover:theme-text transition-colors text-sm">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}