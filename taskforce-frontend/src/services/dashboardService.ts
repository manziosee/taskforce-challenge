import api from './api';

export async function getDashboardData(userId: string) {
  const response = await api.get(`/api/dashboard/${userId}`);
  return response.data;
}