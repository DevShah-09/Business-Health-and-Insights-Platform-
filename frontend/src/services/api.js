/**
 * Axios base instance — all services import from here.
 * Set VITE_API_BASE_URL in your .env file (default: http://localhost:8000)
 */
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 3000,  // Reduced from 15000 to 3 seconds for faster fallback
});

// Request interceptor — attach auth token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — uniform error shape
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail || error.message || 'Unknown error';
    return Promise.reject(new Error(message));
  }
);

export default api;
