'use client';
import { useState, useCallback, useRef, useEffect } from 'react';

export function useTask() {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [taskStatus, setTaskStatus] = useState('idle');
  const [summary, setSummary] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const pollingRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    startTimeRef.current = Date.now();
    setElapsedTime(0);
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setElapsedTime((Date.now() - startTimeRef.current) / 1000);
      }
    }, 100);
  }, [stopTimer]);

  useEffect(() => {
    return () => {
      stopPolling();
      stopTimer();
    };
  }, [stopPolling, stopTimer]);

  const pollStatus = useCallback((taskId, taskStartTime) => {
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
          startTime: data.startTime || taskStartTime || null,
          endTime: data.endTime || null,
          payments: (data.payments || []).map(p => ({
            ...p,
            amount: parseFloat(p.amount) || 0,
          })),
          events: data.events || [],
          totalCost: data.summary?.totalCost || 0,
          subtasks: data.subtasks || [],
          results: data.results || [],
          review: data.review || null,
          subtaskCount: data.summary?.subtaskCount || 0,
          transactionCount: data.summary?.transactionCount || 0,
          duration: data.summary?.duration || 0,
          agentsUsed: data.summary?.agentsUsed || 0,
          avgCostPerTx: data.summary?.avgCostPerTx || 0,
        };

        setTask(fullTask);
        setEvents(data.events || []);
        setSummary(data.summary);

        if (data.status === 'completed') {
          console.log('🎉 Task completed! Updating UI...');
          setTaskStatus('completed');
          stopPolling();
          stopTimer();
          if (data.summary?.duration) {
            setElapsedTime(data.summary.duration);
          }
        } else if (data.status === 'failed') {
          console.log('❌ Task failed');
          setTaskStatus('failed');
          stopPolling();
          stopTimer();
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    poll();
    pollingRef.current = setInterval(poll, 3000);
  }, [stopPolling, stopTimer]);

  const createTask = useCallback(async (description) => {
    setLoading(true);
    setEvents([]);
    setTask(null);
    setTaskStatus('running');
    setSummary(null);
    setElapsedTime(0);
    stopPolling();
    stopTimer();
    startTimer();

    try {
      const res = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: description }),
      });

      const data = await res.json();

      if (data.success && data.taskId) {
        const taskStartTime = data.startTime || new Date().toISOString();

        setTask({
          id: data.taskId,
          status: 'running',
          description,
          startTime: taskStartTime,
          endTime: null,
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
          stopTimer();
        } else {
          pollStatus(data.taskId, taskStartTime);
        }
        return { taskId: data.taskId, status: data.status };
      }

      setTaskStatus('idle');
      stopTimer();
      return data;
    } catch (error) {
      console.error('Create task error:', error);
      setTaskStatus('idle');
      stopTimer();
      return null;
    } finally {
      setLoading(false);
    }
  }, [pollStatus, stopPolling, stopTimer, startTimer]);

  return {
    task,
    loading,
    events,
    taskStatus,
    summary,
    elapsedTime,
    createTask,
    stopPolling,
  };
}