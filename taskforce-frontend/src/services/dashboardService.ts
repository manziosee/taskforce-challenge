import api from './api';

export const getDashboardData = async (userId: string) => {
  const response = await api.get(`/api/dashboard/${userId}`);
  return response.data;
};
