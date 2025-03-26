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
  const formattedPeriod = budgetData.period.toLowerCase();

  const payload = {
    userId: budgetData.userId,
    category: budgetData.category,
    limit: budgetData.limit,
    period: formattedPeriod === 'monthly' ? 'monthly' : 
            formattedPeriod === 'weekly' ? 'weekly' : 'yearly'
  };
  
  const response = await api.post('/api/budgets', payload);
  return response.data;
};

export const updateBudget = async (id: string, budgetData: { 
  category?: string; 
  limit?: number; 
  period?: string; 
}) => {
  const payload = { ...budgetData };
  if (payload.period) {
    payload.period = payload.period.toLowerCase();
  }
  
  const response = await api.put(`/api/budgets/${id}`, payload);
  return response.data;
};

export const deleteBudget = async (id: string) => {
  const response = await api.delete(`/api/budgets/${id}`);
  return response.data;
};