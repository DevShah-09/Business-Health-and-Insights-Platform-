/**
 * Transaction Service — wraps transaction and data ingestion APIs
 */
import api from './api';

/** Fetch all transactions (paginated) */
export const getTransactions = (params = {}) =>
  api.get('/transactions', { params }).then((r) => r.data);

/** Create a single transaction (income or expense) */
export const createTransaction = (data) =>
  api.post('/transactions', data).then((r) => r.data);

/** Upload CSV/Excel/JSON file for bulk import */
export const uploadTransactionFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api
    .post('/transactions/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

/** Upload and extract data from PDF invoice */
export const uploadInvoice = (file, autoInsert = false) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('auto_insert', autoInsert);
  return api
    .post('/transactions/upload/invoice', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

/** Upload and parse bank SMS transaction logs */
export const uploadBankSMS = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api
    .post('/transactions/upload/sms', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

/** Upload and parse UPI/WhatsApp transaction logs */
export const uploadUPILogs = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api
    .post('/transactions/upload/upi', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

/** Auto-categorize uncategorized transactions */
export const autoCategorizeTransactions = () =>
  api.post('/transactions/categorize').then((r) => r.data);

/** Delete a transaction by ID */
export const deleteTransaction = (id) =>
  api.delete(`/transactions/${id}`).then((r) => r.data);
