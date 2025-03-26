import api from './api';

export const getFinancialReport = async (userId: string, timeRange = 'This Month') => {
  // Calculate date range based on selected timeRange
  const endDate = new Date().toISOString();
  let startDate;
  
  switch (timeRange) {
    case 'This Month':
      startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      break;
    case 'Last Month':
      startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString();
      break;
    case 'Last 3 Months':
      startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1).toISOString();
      break;
    case 'This Year':
      startDate = new Date(new Date().getFullYear(), 0, 1).toISOString();
      break;
    default:
      startDate = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString();
  }
  
  const response = await api.get(`/api/reports/${userId}`, {
    params: { startDate, endDate },
  });
  return response.data;
};

export const exportFinancialReport = async (userId: string, timeRange = 'This Month') => {
  // Calculate date range based on selected timeRange
  const endDate = new Date().toISOString();
  let startDate;
  
  switch (timeRange) {
    case 'This Month':
      startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      break;
    case 'Last Month':
      startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString();
      break;
    case 'Last 3 Months':
      startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1).toISOString();
      break;
    case 'This Year':
      startDate = new Date(new Date().getFullYear(), 0, 1).toISOString();
      break;
    default:
      startDate = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString();
  }
  
  const response = await api.get(`/api/reports/${userId}/export`, { 
    responseType: 'blob',
    params: { startDate, endDate }
  });
  return response.data;
};