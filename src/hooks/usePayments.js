'use client';
import { useState, useCallback } from 'react';

export function usePayments() {
  const [transactions, setTransactions] = useState([]);
  const [totalVolume, setTotalVolume] = useState(0);

  const refreshPayments = useCallback(async () => {
    try {
      const res = await fetch('/api/payments/history');
      const data = await res.json();
      setTransactions(data.transactions);
      setTotalVolume(data.totalVolume);
    } catch (error) {
      console.error('Refresh payments error:', error);
    }
  }, []);

  return { transactions, totalVolume, refreshPayments };
}