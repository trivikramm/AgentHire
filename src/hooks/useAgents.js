'use client';
import { useState, useCallback } from 'react';

export function useAgents() {
  const [agents, setAgents] = useState(null);
  const [loading, setLoading] = useState(false);

  const initAgents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agents/create', { method: 'POST' });
      const data = await res.json();
      if (data.success) setAgents(data.agents);
      return data.agents;
    } catch (error) {
      console.error('Init agents error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/agents/status');
      const data = await res.json();
      setAgents(data.agents);
    } catch (error) {
      console.error('Refresh agents error:', error);
    }
  }, []);

  return { agents, loading, initAgents, refreshAgents };
}