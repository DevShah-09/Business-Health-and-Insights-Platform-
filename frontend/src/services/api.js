/**
 * Axios base instance — all services import from here.
<<<<<<< HEAD
 * Set VITE_API_BASE_URL in your .env file (default: http://localhost:8001)
=======
 * Set VITE_API_BASE_URL in your .env file (default: http://localhost:8000)
>>>>>>> ff5355d3df9c89d77b889ad7199a02f8510ae0b4
 */
import axios from 'axios';

const api = axios.create({
<<<<<<< HEAD
  baseURL: 'http://localhost:8001',
=======
  baseURL: 'http://localhost:8000',
>>>>>>> ff5355d3df9c89d77b889ad7199a02f8510ae0b4
  headers: { 'Content-Type': 'application/json' },
  timeout: 3000,
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
