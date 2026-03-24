import React, { useState } from 'react';
import { UploadCloud, Plus, Trash2, FileText, Edit2 } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

const CATEGORIES = [
  { value: 'food', label: 'Food' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'professional_services', label: 'Professional Services' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'salary', label: 'Salary' },
  { value: 'investment', label: 'Investment' },
  { value: 'bank', label: 'Bank/Transfer' },
  { value: 'rent', label: 'Rent' },
  { value: 'other', label: 'Other' },
];

const UPLOAD_TYPES = [
  { id: 'csv', label: 'CSV/Excel', icon: FileText, accept: '.csv,.xlsx' },
  { id: 'invoice', label: 'PDF Invoice', icon: FileText, accept: '.pdf' },
];

export default function Transactions() {
  const { transactions, loading, submitting, addTransaction, editTransaction, uploadFile, removeTransaction } = useTransactions();
  const [formData, setFormData] = useState({
    type: 'income',
    category: 'salary',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'completed'
  });
  const [pendingFormData, setPendingFormData] = useState({
    type: 'expense',
    category: 'other',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'pending'
  });
  const [uploadType, setUploadType] = useState('csv');
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleEdit = (tx) => {
    setEditingId(tx.id);
    setFormData({
      type: tx.type,
      category: tx.category,
      description: tx.description || '',
      amount: tx.amount,
      date: tx.transaction_date || tx.date,
      status: tx.status || 'completed'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ type: 'income', category: 'salary', description: '', amount: '', date: new Date().toISOString().split('T')[0], status: 'completed' });
  };

  const handleAddPending = async (e) => {
    e.preventDefault();
    if (!pendingFormData.description || !pendingFormData.amount) return;

    await addTransaction({
      ...pendingFormData,
      amount: Number(pendingFormData.amount),
      transaction_date: pendingFormData.date || new Date().toISOString().split('T')[0],
    });
    setPendingFormData((f) => ({ ...f, description: '', amount: '', date: new Date().toISOString().split('T')[0], due_date: '', status: 'pending' }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;
    if (editingId) {
      await editTransaction(editingId, {
        ...formData,
        amount: Number(formData.amount),
        transaction_date: formData.date || new Date().toISOString().split('T')[0],
      });
      handleCancelEdit();
    } else {
      await addTransaction({
        ...formData,
        amount: Number(formData.amount),
        transaction_date: formData.date || new Date().toISOString().split('T')[0],
      });
      setFormData((f) => ({ ...f, description: '', amount: '', date: new Date().toISOString().split('T')[0], status: 'completed' }));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadFile(file, uploadType);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const currentUploadType = UPLOAD_TYPES.find((t) => t.id === uploadType);

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] overflow-y-auto">
      <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1600px] w-full mx-auto">
        {/* Left Col: Add Form & Uploads */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-semibold text-surface-foreground mb-4 flex items-center gap-2">
              <Plus size={16} className="text-brand" /> {editingId ? 'Edit Transaction' : 'New Transaction'}
            </h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Type"
                  value={formData.type}
                  onChange={(e) => setFormData((f) => ({ ...f, type: e.target.value }))}
                  options={[{ value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }]}
                />
                <Select
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData((f) => ({ ...f, category: e.target.value }))}
                  options={CATEGORIES}
                />
              </div>
              <Input
                label="Description"
                placeholder="e.g. Consulting fee"
                value={formData.description}
                onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
              />
              <Input
                label="Amount (₹)"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData((f) => ({ ...f, amount: e.target.value }))}
              />
              <Input
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((f) => ({ ...f, date: e.target.value }))}
              />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 justify-center" disabled={submitting}>
                  {editingId ? 'Update Record' : 'Add Record'}
                </Button>
                {editingId && (
                  <Button type="button" onClick={handleCancelEdit} disabled={submitting} className="flex-1 justify-center bg-transparent border border-surface-border hover:bg-surface-muted text-surface-muted-foreground">
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Card>

          {/* Pending Payment Card */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <h3 className="text-sm font-semibold text-amber-500 mb-4 flex items-center gap-2">
              <Plus size={16} className="text-amber-500" /> New Pending Payment
            </h3>
            <form onSubmit={handleAddPending} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Type"
                  value={pendingFormData.type}
                  onChange={(e) => setPendingFormData((f) => ({ ...f, type: e.target.value }))}
                  options={[{ value: 'income', label: 'Incoming' }, { value: 'expense', label: 'Outgoing' }]}
                />
                <Select
                  label="Category"
                  value={pendingFormData.category}
                  onChange={(e) => setPendingFormData((f) => ({ ...f, category: e.target.value }))}
                  options={CATEGORIES}
                />
              </div>
              <Input
                label="Description"
                placeholder="e.g. Awaiting client payment"
                value={pendingFormData.description}
                onChange={(e) => setPendingFormData((f) => ({ ...f, description: e.target.value }))}
              />
              <Input
                label="Amount (₹)"
                type="number"
                placeholder="0.00"
                value={pendingFormData.amount}
                onChange={(e) => setPendingFormData((f) => ({ ...f, amount: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Due Date"
                  type="date"
                  value={pendingFormData.due_date}
                  onChange={(e) => setPendingFormData((f) => ({ ...f, due_date: e.target.value }))}
                />
                <Select
                  label="Status"
                  value={pendingFormData.status}
                  onChange={(e) => setPendingFormData((f) => ({ ...f, status: e.target.value }))}
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'completed', label: 'Completed' },
                  ]}
                />
              </div>
              <Button type="submit" className="w-full justify-center bg-amber-600 hover:bg-amber-700" disabled={submitting}>
                Record Pending
              </Button>
            </form>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-surface-foreground mb-4 flex items-center gap-2">
              <UploadCloud size={16} className="text-brand" /> Bulk Import
            </h3>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {UPLOAD_TYPES.map((type) => {
                const isActive = uploadType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setUploadType(type.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1 ${isActive
                        ? 'bg-brand text-surface-foreground'
                        : 'bg-surface-muted text-surface-muted-foreground hover:bg-surface-muted'
                      }`}
                  >
                    <type.icon size={14} />
                    <span className="hidden sm:inline">{type.label}</span>
                  </button>
                );
              })}
            </div>

            <label className="block border-2 border-dashed border-surface-border/50 hover:border-brand/50 transition bg-transparent rounded-lg text-center p-6 cursor-pointer">
              <UploadCloud size={28} className="mx-auto text-surface-muted-foreground mb-2" />
              <h4 className="text-sm font-medium text-surface-muted-foreground mb-1">{currentUploadType?.label}</h4>
              <p className="text-xs text-surface-muted-foreground mb-3">Drag and drop or click to browse</p>
              <input
                type="file"
                accept={currentUploadType?.accept}
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              {uploading && <p className="text-xs text-brand">Uploading...</p>}
            </label>
          </Card>

        </div>

        {/* Right Col: Table */}
        <div className="lg:col-span-2">
          <Card className="h-full min-h-[500px] flex flex-col p-0 overflow-hidden">
            <div className="p-4 border-b border-surface-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-surface-foreground">Recent Transactions</h3>
              <span className="text-xs text-surface-muted-foreground bg-surface-muted px-2.5 py-1 rounded">
                {transactions?.length || 0} total
              </span>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="bg-surface text-xs uppercase text-surface-muted-foreground border-b border-surface-border sticky top-0">
                  <tr>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Description</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium text-center">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Amount</th>
                    <th className="px-5 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/50 text-surface-muted-foreground">
                  {loading ? (
                    <tr><td colSpan={6} className="py-8 text-center">Loading...</td></tr>
                  ) : transactions?.length === 0 ? (
                    <tr><td colSpan={6} className="py-8 text-center">No transactions yet.</td></tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-surface-card/60 transition">
                        <td className="px-5 py-3 text-xs">{tx.transaction_date}</td>
                        <td className="px-5 py-3 font-medium text-surface-foreground">{tx.description}</td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center rounded-full bg-surface-muted px-2.5 py-0.5 text-[10px] uppercase font-medium">
                            {tx.category}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] uppercase font-medium ${tx.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] uppercase font-medium ${tx.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                            }`}>
                            {tx.status || 'completed'}
                          </span>
                        </td>
                        <td className={`px-5 py-3 text-right font-semibold ${tx.type === 'income' ? 'text-green-400' : 'text-surface-foreground'}`}>
                          {tx.type === 'income' ? '+' : '-'}₹{(tx.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => handleEdit(tx)}
                            className="text-surface-muted-foreground hover:text-blue-400 transition inline-flex p-1 mr-2"
                            title="Edit transaction"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => removeTransaction(tx.id)}
                            className="text-surface-muted-foreground hover:text-red-400 transition inline-flex p-1"
                            title="Delete transaction"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}