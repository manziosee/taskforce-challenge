import api from './api';

export const getBudgets = async (userId: string) => {
  const response = await api.get(`/api/budgets/${userId}`);
  return response.data;
};

export const addBudget = async (budgetData: {
  userId: string;
  category: string;
  limit: number;
  period: string;
}) => {
  const response = await api.post('/api/budgets', budgetData);
  return response.data;
};

export const updateBudget = async (id: string, budgetData: { category: string; limit: number; period: string }) => {
  const response = await api.put(`/api/budgets/${id}`, budgetData);
  return response.data;
};

export const deleteBudget = async (id: string) => {
  const response = await api.delete(`/api/budgets/${id}`);
  return response.data;
};