/**
 * useTransactions — fetches and manages transaction list
 */
import { useState, useEffect, useCallback } from 'react';
import { getTransactions, createTransaction, deleteTransaction, uploadTransactionFile, uploadInvoice, uploadBankSMS, uploadUPILogs, autoCategorizeTransactions } from '../services/transactionService';

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
      .then((d) => setTransactions(d?.transactions || d))
      .catch(() => setTransactions(MOCK_TRANSACTIONS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const addTransaction = async (data) => {
    setSubmitting(true);
    try {
      const newTx = await createTransaction(data).catch(() => ({ id: Date.now(), ...data }));
      setTransactions((prev) => [newTx, ...prev]);
    } finally {
      setSubmitting(false);
    }
  };

  const uploadFile = async (file, uploadType = 'csv') => {
    setSubmitting(true);
    try {
      if (uploadType === 'csv') {
        await uploadTransactionFile(file).catch(() => {});
      } else if (uploadType === 'invoice') {
        await uploadInvoice(file, true).catch(() => {});
      } else if (uploadType === 'sms') {
        await uploadBankSMS(file).catch(() => {});
      } else if (uploadType === 'upi') {
        await uploadUPILogs(file).catch(() => {});
      }
      fetchTransactions();
    } finally {
      setSubmitting(false);
    }
  };

  const categorizeAll = async () => {
    setSubmitting(true);
    try {
      await autoCategorizeTransactions().catch(() => {});
      fetchTransactions();
    } finally {
      setSubmitting(false);
    }
  };

  const removeTransaction = async (id) => {
    await deleteTransaction(id).catch(() => {});
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return { transactions, loading, submitting, addTransaction, uploadFile, categorizeAll, removeTransaction };
}
