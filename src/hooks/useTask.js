'use client';
import { useState, useCallback, useRef, useEffect } from 'react';

export function useTask() {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [taskStatus, setTaskStatus] = useState('idle');
  const [summary, setSummary] = useState(null);
  const pollingRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const pollStatus = useCallback((taskId) => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/tasks/status?taskId=${taskId}`);
        const data = await res.json();

        if (!data.success) return;

        const fullTask = {
          id: data.taskId,
          status: data.status,
          description: data.description,
          completedAt: data.completedAt,
          startTime: data.startTime || null,
          endTime: data.endTime || null,
          payments: data.payments || [],
          events: data.events || [],
          totalCost: data.summary?.totalCost || 0,
          subtasks: data.subtasks || [],
          results: data.results || [],
          review: data.review || null,
          subtaskCount: data.summary?.subtaskCount || 0,
          transactionCount: data.summary?.transactionCount || 0,
          duration: data.summary?.duration || 0,
        };

        setTask(fullTask);
        setEvents(data.events || []);
        setSummary(data.summary);

        if (data.status === 'completed') {
          console.log('🎉 Task completed! Updating UI...');
          setTaskStatus('completed');
          stopPolling();
        } else if (data.status === 'failed') {
          console.log('❌ Task failed');
          setTaskStatus('failed');
          stopPolling();
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    poll();
    pollingRef.current = setInterval(poll, 3000);
  }, [stopPolling]);

  const createTask = useCallback(async (description) => {
    setLoading(true);
    setEvents([]);
    setTask(null);
    setTaskStatus('running');
    setSummary(null);
    stopPolling();

    try {
      const res = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: description }),
      });

      const data = await res.json();

      if (data.success && data.taskId) {
        setTask({
          id: data.taskId,
          status: 'running',
          description,
          events: [],
          payments: [],
          subtasks: [],
          results: [],
          totalCost: 0,
        });

        if (data.status === 'completed') {
          setTask(data.task);
          setTaskStatus('completed');
          setSummary(data.summary);
          setEvents(data.events || []);
        } else {
          pollStatus(data.taskId);
        }
        return { taskId: data.taskId, status: data.status };
      }

      setTaskStatus('idle');
      return data;
    } catch (error) {
      console.error('Create task error:', error);
      setTaskStatus('idle');
      return null;
    } finally {
      setLoading(false);
    }
  }, [pollStatus, stopPolling]);

  return { task, loading, events, taskStatus, summary, createTask, stopPolling };
}