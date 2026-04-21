'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { DEMO_TASKS } from '@/lib/constants';

export default function TaskCreator({ onSubmit, loading }) {
  const [description, setDescription] = useState('');
  const [showExamples, setShowExamples] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (description.trim() && !loading) {
      onSubmit(description);
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Create a Task</h2>
          <p className="text-sm text-gray-500">Describe what you need — agents will bid and execute</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Build a responsive landing page for a SaaS product with hero section, features, pricing, and CTA..."
          className="input-field min-h-[120px] resize-none mb-4"
          disabled={loading}
        />

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showExamples ? 'rotate-180' : ''}`} />
            Example tasks
          </button>

          <button
            type="submit"
            disabled={!description.trim() || loading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Agents Working...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Hire Agents
              </>
            )}
          </button>
        </div>
      </form>

      <AnimatePresence>
        {showExamples && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            {DEMO_TASKS.map((task, i) => (
              <button
                key={i}
                onClick={() => {
                  setDescription(task.description);
                  setShowExamples(false);
                }}
                className="text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all"
              >
                <div className="text-sm font-medium text-white">{task.title}</div>
                <div className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</div>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                  task.complexity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {task.complexity}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}