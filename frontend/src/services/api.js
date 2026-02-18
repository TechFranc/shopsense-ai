import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Receipts
export const uploadReceipt = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/api/receipts/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
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

// Add this to your existing api.js file
export const getRecurringExpenses = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/recurring/analyze`);
    return response.data;
};

export default api;
