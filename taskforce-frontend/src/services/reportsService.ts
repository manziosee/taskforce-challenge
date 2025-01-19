import api from './api';

export const getFinancialReport = async (userId: string) => {
  const response = await api.get(`/api/reports/${userId}`);
  return response.data;
};

export const exportFinancialReport = async (userId: string) => {
  const response = await api.get(`/api/reports/${userId}/export`, { responseType: 'blob' });
  return response.data;
};
