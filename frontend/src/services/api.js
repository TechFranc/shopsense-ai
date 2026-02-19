import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 👇 Add this interceptor — attaches token to EVERY request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Receipts
export const uploadReceipt = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/receipts/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getReceipts = async () => {
  const response = await api.get('/api/receipts/');
  return response.data;
};

export const getReceipt = async (id) => {
  const response = await api.get(`/api/receipts/${id}`);
  return response.data;
};

export const deleteReceipt = async (id) => {
  const response = await api.delete(`/api/receipts/${id}`);
  return response.data;
};

// Analytics
export const getSpendingAnalytics = async () => {
  const response = await api.get('/api/analytics/spending');
  return response.data;
};

export const getCategoryBreakdown = async () => {
  const response = await api.get('/api/analytics/categories');
  return response.data;
};

export const getBudgets = async () => {
  const response = await api.get('/api/analytics/budgets');
  return response.data;
};

export const createBudget = async (budgetData) => {
  const response = await api.post('/api/analytics/budgets', budgetData);
  return response.data;
};

export const deleteBudget = async (id) => {
  const response = await api.delete(`/api/analytics/budgets/${id}`);
  return response.data;
};

// Insights
export const generateInsights = async () => {
  const response = await api.post('/api/insights/generate');
  return response.data;
};

export const getInsights = async () => {
  const response = await api.get('/api/insights/');
  return response.data;
};

export const getRecommendations = async () => {
  const response = await api.get('/api/insights/recommendations');
  return response.data;
};

export const deleteInsight = async (id) => {
  const response = await api.delete(`/api/insights/${id}`);
  return response.data;
};

// Recurring
export const getRecurringExpenses = async () => {
  const response = await api.get('/api/recurring/analyze');  // 👈 use api not axios
  return response.data;
};

// Receipt detail
export const getReceiptDetail = async (receiptId) => {
  const response = await api.get(`/api/receipts/${receiptId}`);
  return response.data;
};

// Profile
export const updateProfile = async (data) => {
  const response = await api.put('/api/auth/profile', data);
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.put('/api/auth/change-password', data);
  return response.data;
};

export default api;