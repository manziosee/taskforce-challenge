import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getCategories,
  addCategory,
  deleteCategory,
  updateCategory,
  updateSubcategory,
  deleteSubcategory,
} from '../services/categoryService';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  subcategories: string[];
}

export default function Categories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    subcategories: '',
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      setError('');
      try {
        const data = await getCategories(user.id);
        setCategories(data);
      } catch (err) {
        setError('Failed to fetch categories');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [user]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    setError('');
    try {
      const response = await addCategory({
        userId: user.id,
        name: newCategory.name,
        type: newCategory.type,
        subcategories: newCategory.subcategories.split(',').map(s => s.trim()).filter(Boolean)
      });
      setCategories([...categories, response]);
      setShowAddForm(false);
      setNewCategory({ name: '', type: 'expense', subcategories: '' });
    } catch (err) {
      setError('Failed to add category');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !user?.id) return;

    setLoading(true);
    setError('');
    try {
      const response = await updateCategory(editingCategory.id, editingCategory.name);
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? { ...cat, name: response.name } : cat
      ));
      setEditingCategory(null);
    } catch (err) {
      setError('Failed to update category');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    setLoading(true);
    setError('');
    try {
      await deleteCategory(id);
      setCategories(categories.filter(cat => cat.id !== id));
    } catch (err) {
      setError('Failed to delete category');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubcategory = async (
    categoryId: string,
    subcategoryIndex: number,
    newValue: string
  ) => {
    setLoading(true);
    setError('');
    try {
      const response = await updateSubcategory(categoryId, subcategoryIndex, newValue);
      setCategories(categories.map(cat => 
        cat.id === categoryId ? response : cat
      ));
    } catch (err) {
      setError('Failed to update subcategory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubcategory = async (categoryId: string, subcategoryIndex: number) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) return;

    setLoading(true);
    setError('');
    try {
      await deleteSubcategory(categoryId, subcategoryIndex);
      setCategories(categories.map(cat => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            subcategories: cat.subcategories.filter((_, index) => index !== subcategoryIndex)
          };
        }
        return cat;
      }));
    } catch (err) {
      setError('Failed to delete subcategory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !categories.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Category
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <div key={category.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <span className={`text-sm ${
                  category.type === 'income' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {category.type}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingCategory(category)}
                  className="p-2 text-gray-500 hover:text-primary-600"
                  title="Edit Category"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-2 text-gray-500 hover:text-red-600"
                  title="Delete Category"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Subcategories</h4>
              <div className="flex flex-wrap gap-2">
                {category.subcategories.map((subcategory, index) => (
                  <div key={index} className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    <span className="text-sm">{subcategory}</span>
                    <button
                      onClick={() => handleDeleteSubcategory(category.id, index)}
                      className="ml-2 text-gray-400 hover:text-red-600"
                      title="Delete Subcategory"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Category Modal */}
      {(showAddForm || editingCategory) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={editingCategory ? editingCategory.name : newCategory.name}
                    onChange={(e) => {
                      if (editingCategory) {
                        setEditingCategory({ ...editingCategory, name: e.target.value });
                      } else {
                        setNewCategory({ ...newCategory, name: e.target.value });
                      }
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                    placeholder="Enter category name"
                  />
                </div>

                {!editingCategory && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Type</label>
                      <select
                        title="Category Type"
                        value={newCategory.type}
                        onChange={(e) => setNewCategory({ 
                          ...newCategory, 
                          type: e.target.value as 'income' | 'expense'
                        })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Subcategories (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={newCategory.subcategories}
                        onChange={(e) => setNewCategory({ 
                          ...newCategory, 
                          subcategories: e.target.value 
                        })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g., Groceries, Restaurants, Fast Food"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingCategory(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : editingCategory ? 'Update' : 'Save'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}