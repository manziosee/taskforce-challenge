import api from './api';

export const getFinancialReport = async (userId: string) => {
  const startDate = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(); // Last month
  const endDate = new Date().toISOString(); // Current date
  const response = await api.get(`/api/reports/${userId}`, {
    params: { startDate, endDate },
  });
  return response.data;
};

export const exportFinancialReport = async (userId: string) => {
  const response = await api.get(`/api/reports/${userId}/export`, { responseType: 'blob' });
  return response.data;
};