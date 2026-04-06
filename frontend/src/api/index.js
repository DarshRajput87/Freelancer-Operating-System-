import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fos_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('fos_token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (status !== 404 && status !== 400) {
      toast.error(message);
    }

    return Promise.reject(error.response?.data || { message });
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  updateApiKey: (apiKey) => api.put('/auth/api-key', { apiKey }),
  deleteApiKey: () => api.delete('/auth/api-key'),
};

// Dashboard
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
};

// Clients
export const clientAPI = {
  getAll: (params) => api.get('/clients', { params }),
  getOne: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
  addNote: (id, content) => api.post(`/clients/${id}/notes`, { content }),
  getStats: () => api.get('/clients/stats'),
};

// Projects
export const projectAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

// Tasks
export const taskAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  bulkCreate: (data) => api.post('/tasks/bulk', data),
  reorder: (updates) => api.put('/tasks/reorder', { updates }),
};

// Invoices
export const invoiceAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  getOne: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  getStats: () => api.get('/invoices/stats'),
  downloadPDF: (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
};

// Proposals
export const proposalAPI = {
  getAll: () => api.get('/proposals'),
  getOne: (id) => api.get(`/proposals/${id}`),
  update: (id, data) => api.put(`/proposals/${id}`, data),
  delete: (id) => api.delete(`/proposals/${id}`),
  downloadPDF: (id) => api.get(`/proposals/${id}/pdf`, { responseType: 'blob' }),
};

// AI
export const aiAPI = {
  analyze: (data) => api.post('/ai/analyze', data),
  proposal: (data) => api.post('/ai/proposal', data),
  freelanceProposal: (data) => api.post('/ai/freelance-proposal', data),
  tasks: (data) => api.post('/ai/tasks', data),
  reply: (data) => api.post('/ai/reply', data),
  getLogs: (params) => api.get('/ai/logs', { params }),
};

export default api;
