import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Transactions ────────────────────────────────────────────────────────────

export const getTransactions = () => API.get('/transactions').then(r => r.data.data);

export const createTransaction = (payload) =>
  API.post('/transactions', payload).then(r => r.data);

export const deleteTransaction = (id) =>
  API.delete(`/transactions/${id}`).then(r => r.data);

export const getCategories = () =>
  API.get('/transactions/categories').then(r => r.data.data);

// ─── Summary ─────────────────────────────────────────────────────────────────

export const getSummary = () => API.get('/summary').then(r => r.data.data);

// Attach auth token if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Authentication ──────────────────────────────────────────────────────────

export const loginUser = (credentials) =>
  API.post('/auth/login', credentials).then(r => r.data);

export const registerUser = (userData) =>
  API.post('/auth/register', userData).then(r => r.data);

// ─── Health ───────────────────────────────────────────────────────────────────

export const checkHealth = () => API.get('/health').then(r => r.data);

export default API;
