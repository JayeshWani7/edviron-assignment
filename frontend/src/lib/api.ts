import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default api;