import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '') + '/',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

import { toast } from 'sonner';

api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success === true && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || 'Ocorreu um erro inesperado';

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Sessão expirada. Por favor, faça login novamente.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
