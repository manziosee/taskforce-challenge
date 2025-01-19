import api from './api';

export const getCategories = async (userId: string) => {
  const response = await api.get(`/api/categories/${userId}`);
  return response.data;
};

export const addCategory = async (categoryData: { name: string; subcategories: string[] }) => {
  const response = await api.post('/api/categories', categoryData);
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const response = await api.delete(`/api/categories/${id}`);
  return response.data;
};

export const updateSubcategory = async (categoryId: string, subcategoryIndex: number, value: string) => {
  const response = await api.put(`/api/categories/${categoryId}/subcategories/${subcategoryIndex}`, { value });
  return response.data;
};

export const deleteSubcategory = async (categoryId: string, subcategoryIndex: number) => {
  const response = await api.delete(`/api/categories/${categoryId}/subcategories/${subcategoryIndex}`);
  return response.data;
};
