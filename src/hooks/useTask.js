'use client';
import { useState, useCallback } from 'react';

export function useTask() {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);

  const createTask = useCallback(async (description) => {
    setLoading(true);
    setEvents([]);
    setTask(null);

    try {
      const res = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      const data = await res.json();

      if (data.success) {
        setTask(data.task);
        setEvents(data.task.events || []);
      }

      return data.task;
    } catch (error) {
      console.error('Create task error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { task, loading, events, createTask };
}