import api from './api';

export const getTransactions = async (userId: string) => {
  const response = await api.get(`/api/transactions/${userId}`);
  return response.data;
};

export const addTransaction = async (transactionData: {
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  subcategory?: string;
  account: string;
  date: Date;
  description: string;
}) => {
  const response = await api.post('/api/transactions', transactionData);
  return response.data;
};

export const updateTransaction = async (id: string, transactionData: {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  subcategory?: string;
  account: string;
  date: Date;
  description: string;
}) => {
  const response = await api.put(`/api/transactions/${id}`, transactionData);
  return response.data;
};

export const deleteTransaction = async (id: string) => {
  const response = await api.delete(`/api/transactions/${id}`);
  return response.data;
};