import React, { useState } from 'react';
import { UploadCloud, Plus, Trash2, FileText, MessageSquare, Smartphone, Zap, Edit2 } from 'lucide-react';
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
  { value: 'other', label: 'Other' },
];

const UPLOAD_TYPES = [
  { id: 'csv', label: 'CSV/Excel', icon: FileText, accept: '.csv,.xlsx' },
  { id: 'invoice', label: 'PDF Invoice', icon: FileText, accept: '.pdf' },
  { id: 'sms', label: 'Bank SMS', icon: MessageSquare, accept: '.txt' },
  { id: 'upi', label: 'UPI Logs', icon: Smartphone, accept: '.txt' },
];

export default function Transactions() {
  const { transactions, loading, submitting, addTransaction, editTransaction, uploadFile, categorizeAll, removeTransaction } = useTransactions();
  const [formData, setFormData] = useState({ type: 'income', category: 'salary', description: '', amount: '' });
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
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ type: 'income', category: 'salary', description: '', amount: '' });
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
        transaction_date: new Date().toISOString().split('T')[0],
      });
      setFormData((f) => ({ ...f, description: '', amount: '' }));
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
      e.target.value = ''; // Reset file input
    }
  };

  const currentUploadType = UPLOAD_TYPES.find((t) => t.id === uploadType);

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] overflow-y-auto">


      <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1600px] w-full mx-auto">
        {/* Left Col: Add Form & Uploads */}
        <div className="space-y-6">
          {/* Manual Transaction */}
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
                label="Amount ($)"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData((f) => ({ ...f, amount: e.target.value }))}
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

          {/* Bulk Upload Options */}
          <Card>
            <h3 className="text-sm font-semibold text-surface-foreground mb-4 flex items-center gap-2">
              <UploadCloud size={16} className="text-brand" /> Bulk Import
            </h3>
            
            {/* Upload Type Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {UPLOAD_TYPES.map((type) => {
                const isActive = uploadType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setUploadType(type.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1 ${
                      isActive
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

            {/* File Upload Area */}
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

            <p className="text-xs text-surface-muted-foreground mt-3 leading-relaxed">
              {uploadType === 'csv' && 'Upload CSV or Excel files with columns: Date, Type, Amount, Category, Description'}
              {uploadType === 'invoice' && 'Extract invoice data automatically with OCR. Vendor, amount, and date will be detected.'}
              {uploadType === 'sms' && 'Paste bank transaction SMS messages. Debit/credit, amount, and date will be extracted.'}
              {uploadType === 'upi' && 'Upload UPI/WhatsApp transaction logs. Recipient, amount, and type will be extracted.'}
            </p>
          </Card>

          {/* Auto-Categorize */}
          <Card className="bg-brand/10 border border-brand/30">
            <h4 className="text-sm font-semibold text-surface-foreground mb-2 flex items-center gap-2">
              <Zap size={16} className="text-[#fbbf24]" /> Auto-Categorize
            </h4>
            <p className="text-xs text-surface-muted-foreground mb-4">
              Apply AI-powered categorization to uncategorized transactions
            </p>
            <Button
              className="w-full justify-center bg-brand hover:bg-brand-hover"
              onClick={() => categorizeAll()}
              disabled={submitting}
            >
              Categorize All
            </Button>
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
                    <th className="px-5 py-3 font-medium text-right">Amount</th>
                    <th className="px-5 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/50 text-surface-muted-foreground">
                  {loading ? (
                    <tr><td colSpan={6} className="py-8 text-center text-surface-muted-foreground">Loading...</td></tr>
                  ) : transactions?.length === 0 ? (
                    <tr><td colSpan={6} className="py-8 text-center text-surface-muted-foreground">No transactions yet. Add one manually or upload a file.</td></tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-surface-card/60 transition">
                        <td className="px-5 py-3 text-surface-muted-foreground text-xs">{tx.transaction_date || tx.date}</td>
                        <td className="px-5 py-3 font-medium text-surface-foreground">{tx.description}</td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center rounded-full bg-surface-muted px-2.5 py-0.5 text-[10px] uppercase text-surface-muted-foreground font-medium">
                            {tx.category}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] uppercase font-medium ${
                            tx.type === 'income'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className={`px-5 py-3 text-right font-semibold ${tx.type === 'income' ? 'text-green-400' : 'text-surface-foreground'}`}>
                          {tx.type === 'income' ? '+' : '-'}${(tx.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-right whitespace-nowrap">
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
