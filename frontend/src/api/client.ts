import axios, { type InternalAxiosRequestConfig } from 'axios';

const apiBaseUrl: string =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:3000/api';

const client = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('notes_auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isPublicOrAuthRoute =
        typeof window !== 'undefined' &&
        (window.location.pathname === '/' ||
          window.location.pathname.startsWith('/login') ||
          window.location.pathname.startsWith('/signup') ||
          window.location.pathname.startsWith('/register') ||
          window.location.pathname.startsWith('/scratchpad'));
      if (!isPublicOrAuthRoute && typeof window !== 'undefined') {
        localStorage.removeItem('notes_auth_token');
        localStorage.removeItem('notes_user_data');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
