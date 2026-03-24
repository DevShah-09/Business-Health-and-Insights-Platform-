/**
 * Transaction Service — wraps transaction and data ingestion APIs
 */
import api from './api';

// Default business ID for transactions (matches backend mock data)
const DEFAULT_BUSINESS_ID = '550e8400-e29b-41d4-a716-446655440001';
const BASE_PATH = `/api/v1/businesses/${DEFAULT_BUSINESS_ID}/transactions`;

/** Fetch all transactions (paginated) */
export const getTransactions = (params = {}) =>
  api.get(BASE_PATH, { params }).then((r) => r.data);

/** Create a single transaction (income or expense) */
export const createTransaction = (data) => {
  // Map 'date' field to 'transaction_date' for backend
  const payload = {
    ...data,
    transaction_date: data.date || data.transaction_date || new Date().toISOString().split('T')[0],
  };
  delete payload.date; // Remove date field if present
  return api.post(BASE_PATH, payload).then((r) => r.data);
};

/** Update an existing transaction */
export const updateTransaction = (id, data) => {
  const payload = {
    ...data,
    transaction_date: data.date || data.transaction_date || new Date().toISOString().split('T')[0],
  };
  delete payload.date;
  return api.put(`${BASE_PATH}/${id}`, payload).then((r) => r.data);
};

/** Upload CSV/Excel/JSON file for bulk import */
export const uploadTransactionFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api
    .post(`${BASE_PATH}/upload/file`, formData, {
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
    .post(`${BASE_PATH}/upload/invoice`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};


/** Delete a transaction by ID */
export const deleteTransaction = (id) =>
  api.delete(`${BASE_PATH}/${id}`).then((r) => r.data);
