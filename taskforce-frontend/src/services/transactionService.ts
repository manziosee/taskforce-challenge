import api from './api';

export const getTransactions = async (userId: string) => {
  const response = await api.get(`/api/transactions/${userId}`);
  return response.data;
};

export const addTransaction = async (transactionData: {
  date: string;
  description: string;
  category: string;
  account: string;
  amount: number;
  userId: string;
  type: 'income' | 'expense';
}) => {
  const response = await api.post('/api/transactions', transactionData);
  return response.data;
};

export const updateTransaction = async (id: number, transactionData: {
  date: string;
  description: string;
  category: string;
  account: string;
  amount: number;
  type: 'income' | 'expense';
}) => {
  const response = await api.put(`/api/transactions/${id}`, transactionData);
  return response.data;
};

export const deleteTransaction = async (id: number) => {
  const response = await api.delete(`/api/transactions/${id}`);
  return response.data;
};
