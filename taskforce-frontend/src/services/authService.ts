import api from './api';

export const register = async (userData: { name: string; email: string; password: string }) => {
  const response = await api.post('/api/auth/register', userData);
  return response.data;
};

export const login = async (credentials: { email: string; password: string }) => {
  const response = await api.post('/api/auth/login', credentials);
  return response.data;
};

export const changePassword = async (passwordData: { currentPassword: string; newPassword: string }) => {
  const response = await api.put('/api/auth/change-password', passwordData);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/api/auth/logout');
  return response.data;
};
export const updateProfile = async (profileData: { name: string; email: string }) => {
    const response = await api.put('/api/auth/update-profile', profileData);
    return response.data;
  };