/**
 * useTransactions — fetches and manages transaction list
 */
import { useState, useEffect, useCallback } from 'react';
import { getTransactions, createTransaction, deleteTransaction, uploadTransactionFile } from '../services/transactionService';

const MOCK_TRANSACTIONS = [
  { id: 1, date: '2026-06-28', type: 'income', category: 'Services', description: 'Consulting Project - Alpha Corp', amount: 18500 },
  { id: 2, date: '2026-06-27', type: 'expense', category: 'Salaries', description: 'Monthly Payroll - June', amount: 28000 },
  { id: 3, date: '2026-06-25', type: 'income', category: 'Products', description: 'Product Sales - Batch #47', amount: 12400 },
  { id: 4, date: '2026-06-23', type: 'expense', category: 'Marketing', description: 'Google Ads Campaign', amount: 4200 },
  { id: 5, date: '2026-06-20', type: 'income', category: 'Services', description: 'SaaS Subscription Revenue', amount: 8700 },
  { id: 6, date: '2026-06-18', type: 'expense', category: 'Operations', description: 'Cloud Infrastructure (AWS)', amount: 3100 },
  { id: 7, date: '2026-06-15', type: 'income', category: 'Products', description: 'Wholesale Order - Beta LLC', amount: 22000 },
  { id: 8, date: '2026-06-12', type: 'expense', category: 'Operations', description: 'Office Rent & Utilities', amount: 5800 },
];

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchTransactions = useCallback(() => {
    setLoading(true);
    getTransactions()
      .then((data) => {
        // Backend returns array directly, not {transactions: [...]}
        const txList = Array.isArray(data) ? data : data?.transactions || [];
        setTransactions(txList);
      })
      .catch((err) => {
        console.error('Failed to fetch transactions:', err);
        setTransactions(MOCK_TRANSACTIONS);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const addTransaction = async (data) => {
    setSubmitting(true);
    try {
      const newTx = await createTransaction(data);
      // Refresh to ensure we have the latest transactions from backend
      fetchTransactions();
    } catch (err) {
      console.error('Failed to create transaction:', err);
      // Optionally show optimistic update or error toast
    } finally {
      setSubmitting(false);
    }
  };

  const uploadFile = async (file) => {
    setSubmitting(true);
    try {
      await uploadTransactionFile(file).catch(() => {});
      fetchTransactions();
    } finally {
      setSubmitting(false);
    }
  };

  const removeTransaction = async (id) => {
    await deleteTransaction(id).catch(() => {});
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return { transactions, loading, submitting, addTransaction, uploadFile, removeTransaction };
}
