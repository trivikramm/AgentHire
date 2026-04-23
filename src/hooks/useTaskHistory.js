'use client';
import { useState, useCallback } from 'react';

export function useTaskHistory() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [aggregates, setAggregates] = useState(null);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        limit: params.limit || 20,
        offset: params.offset || 0,
        ...(params.status && params.status !== 'all' ? { status: params.status } : {}),
        ...(params.search ? { search: params.search } : {}),
        sortBy: params.sortBy || 'created_at',
        sortDir: params.sortDir || 'desc',
      });

      const res = await fetch(`/api/tasks/list?${query}`);
      const json = await res.json();

      if (json.success) {
        setTasks(json.tasks);
        setTotal(json.total);
        setAggregates(json.aggregates);
      } else {
        setError(json.error || 'Failed to fetch tasks');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { tasks, loading, total, aggregates, error, fetchTasks };
}