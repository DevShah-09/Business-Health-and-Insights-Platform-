import React, { useState } from 'react';
import { UploadCloud, Plus, Trash2, FileText, MessageSquare, Smartphone, Zap } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { TopBar } from '../components/dashboard/TopBar';

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
  const { transactions, loading, submitting, addTransaction, uploadFile, categorizeAll, removeTransaction } = useTransactions();
  const [formData, setFormData] = useState({ type: 'income', category: 'salary', description: '', amount: '' });
  const [uploadType, setUploadType] = useState('csv');
  const [uploading, setUploading] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;
    addTransaction({
      ...formData,
      amount: Number(formData.amount),
      transaction_date: new Date().toISOString().split('T')[0],
    });
    setFormData((f) => ({ ...f, description: '', amount: '' }));
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
      <TopBar title="Transactions" subtitle="Manage income and expenses with bulk import" />

      <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1600px] w-full mx-auto">
        {/* Left Col: Add Form & Uploads */}
        <div className="space-y-6">
          {/* Manual Transaction */}
          <Card>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Plus size={16} className="text-[#6366f1]" /> New Transaction
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
              <Button type="submit" className="w-full justify-center">Add Record</Button>
            </form>
          </Card>

          {/* Bulk Upload Options */}
          <Card>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <UploadCloud size={16} className="text-[#6366f1]" /> Bulk Import
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
                        ? 'bg-[#6366f1] text-white'
                        : 'bg-[#2d3449] text-slate-400 hover:bg-[#3a4456]'
                    }`}
                  >
                    <type.icon size={14} />
                    <span className="hidden sm:inline">{type.label}</span>
                  </button>
                );
              })}
            </div>

            {/* File Upload Area */}
            <label className="block border-2 border-dashed border-[#464554]/50 hover:border-[#6366f1]/50 transition bg-transparent rounded-lg text-center p-6 cursor-pointer">
              <UploadCloud size={28} className="mx-auto text-slate-400 mb-2" />
              <h4 className="text-sm font-medium text-slate-300 mb-1">{currentUploadType?.label}</h4>
              <p className="text-xs text-slate-500 mb-3">Drag and drop or click to browse</p>
              <input
                type="file"
                accept={currentUploadType?.accept}
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              {uploading && <p className="text-xs text-[#6366f1]">Uploading...</p>}
            </label>

            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              {uploadType === 'csv' && 'Upload CSV or Excel files with columns: Date, Type, Amount, Category, Description'}
              {uploadType === 'invoice' && 'Extract invoice data automatically with OCR. Vendor, amount, and date will be detected.'}
              {uploadType === 'sms' && 'Paste bank transaction SMS messages. Debit/credit, amount, and date will be extracted.'}
              {uploadType === 'upi' && 'Upload UPI/WhatsApp transaction logs. Recipient, amount, and type will be extracted.'}
            </p>
          </Card>

          {/* Auto-Categorize */}
          <Card className="bg-[#6366f1]/10 border border-[#6366f1]/30">
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Zap size={16} className="text-[#fbbf24]" /> Auto-Categorize
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Apply AI-powered categorization to uncategorized transactions
            </p>
            <Button
              className="w-full justify-center bg-[#6366f1] hover:bg-[#4f46e5]"
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
            <div className="p-4 border-b border-[#2d3449] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
              <span className="text-xs text-slate-500 bg-[#2d3449] px-2.5 py-1 rounded">
                {transactions?.length || 0} total
              </span>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#131b2e] text-xs uppercase text-slate-500 border-b border-[#2d3449] sticky top-0">
                  <tr>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Description</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium text-right">Amount</th>
                    <th className="px-5 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2d3449]/50 text-slate-300">
                  {loading ? (
                    <tr><td colSpan={6} className="py-8 text-center text-slate-500">Loading...</td></tr>
                  ) : transactions?.length === 0 ? (
                    <tr><td colSpan={6} className="py-8 text-center text-slate-500">No transactions yet. Add one manually or upload a file.</td></tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#171f33]/60 transition">
                        <td className="px-5 py-3 text-slate-400 text-xs">{tx.transaction_date || tx.date}</td>
                        <td className="px-5 py-3 font-medium text-slate-200">{tx.description}</td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center rounded-full bg-[#2d3449] px-2.5 py-0.5 text-[10px] uppercase text-slate-300 font-medium">
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
                        <td className={`px-5 py-3 text-right font-semibold ${tx.type === 'income' ? 'text-green-400' : 'text-slate-200'}`}>
                          {tx.type === 'income' ? '+' : '-'}${(tx.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => removeTransaction(tx.id)}
                            className="text-slate-500 hover:text-red-400 transition inline-flex p-1"
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
