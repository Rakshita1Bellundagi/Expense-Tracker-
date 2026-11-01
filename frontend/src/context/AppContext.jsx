import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getTransactions, getSummary as fetchSummary } from '../api/client';
import { getApiError } from '../utils/helpers';
import toast from 'react-hot-toast';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError]               = useState(null);

  // ── Fetch transactions ──────────────────────────────────────────────────────
  const refreshTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (err) {
      const msg = getApiError(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch summary ───────────────────────────────────────────────────────────
  const refreshSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const data = await fetchSummary();
      setSummary(data);
    } catch (err) {
      // Silent fail; summary will show dashes
      console.error('Summary fetch error:', err);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // ── Refresh everything ──────────────────────────────────────────────────────
  const refreshAll = useCallback(async () => {
    await Promise.all([refreshTransactions(), refreshSummary()]);
  }, [refreshTransactions, refreshSummary]);

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const value = {
    transactions,
    summary,
    loading,
    summaryLoading,
    error,
    refreshAll,
    refreshTransactions,
    refreshSummary,
    setTransactions,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
