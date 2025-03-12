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
  subcategories: string[];
}

export default function Categories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    subcategories: '',
  });
  const [editingCategoryName, setEditingCategoryName] = useState<{ id: string; name: string } | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<{
    categoryId: string;
    subcategoryIndex: number;
    value: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getCategories(user?.id || '');
        setCategories(data);
      } catch (err) {
        setError('Failed to fetch categories');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await addCategory({
        userId: user?.id || '',
        name: newCategory.name,
        subcategories: newCategory.subcategories.split(',').map((s) => s.trim()),
      });
      setCategories([...categories, response]);
      setShowAddForm(false);
      setNewCategory({ name: '', subcategories: '' });
    } catch (err) {
      setError('Failed to add category');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategoryName) {
      setLoading(true);
      setError('');
      try {
        const response = await updateCategory(editingCategoryName.id, editingCategoryName.name);
        const updatedCategories = categories.map((category) =>
          category.id === editingCategoryName.id ? { ...category, name: response.name } : category
        );
        setCategories(updatedCategories);
        setEditingCategoryName(null);
      } catch (err) {
        setError('Failed to update category');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setLoading(true);
      setError('');
      try {
        await deleteCategory(id);
        setCategories(categories.filter((category) => category.id !== id));
      } catch (err) {
        setError('Failed to delete category');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubcategory) {
      setLoading(true);
      setError('');
      try {
        const response = await updateSubcategory(
          editingSubcategory.categoryId,
          editingSubcategory.subcategoryIndex,
          editingSubcategory.value
        );
        const updatedCategories = categories.map((category) =>
          category.id === editingSubcategory.categoryId ? response : category
        );
        setCategories(updatedCategories);
        setEditingSubcategory(null);
      } catch (err) {
        setError('Failed to update subcategory');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteSubcategory = async (categoryId: string, subcategoryIndex: number) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      setLoading(true);
      setError('');
      try {
        await deleteSubcategory(categoryId, subcategoryIndex);
        const updatedCategories = categories.map((category) => {
          if (category.id === categoryId) {
            const updatedSubcategories = category.subcategories.filter((_, index) => index !== subcategoryIndex);
            return { ...category, subcategories: updatedSubcategories };
          }
          return category;
        });
        setCategories(updatedCategories);
      } catch (err) {
        setError('Failed to delete subcategory');
        console.error(err);
      } finally {
        setLoading(false);
      }
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
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          Categories
        </h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="button-hover inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="hover-card bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingCategoryName({ id: category.id, name: category.name })}
                    className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Subcategories</h4>
                <div className="flex flex-wrap gap-2">
                  {category.subcategories.map((subcategory, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-full">
                        {subcategory}
                      </span>
                      <button
                        onClick={() =>
                          setEditingSubcategory({
                            categoryId: category.id,
                            subcategoryIndex: index,
                            value: subcategory,
                          })
                        }
                        className="p-1 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                        title="Edit Subcategory"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubcategory(category.id, index)}
                        className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                        title="Delete Subcategory"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md animate-scale-in">
            <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subcategories (comma-separated)
                </label>
                <input
                  type="text"
                  value={newCategory.subcategories}
                  onChange={(e) => setNewCategory({ ...newCategory, subcategories: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Groceries, Restaurants, Fast Food"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button-hover px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Category'
                  )}
                </button>
              </div>
            </form>
            {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
          </div>
        </div>
      )}

      {/* Edit Category Name Modal */}
      {editingCategoryName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md animate-scale-in">
            <h2 className="text-lg font-semibold mb-4">Edit Category Name</h2>
            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={editingCategoryName.name}
                  onChange={(e) => setEditingCategoryName({ ...editingCategoryName, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setEditingCategoryName(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
            {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
          </div>
        </div>
      )}

      {/* Edit Subcategory Modal */}
      {editingSubcategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md animate-scale-in">
            <h2 className="text-lg font-semibold mb-4">Edit Subcategory</h2>
            <form onSubmit={handleUpdateSubcategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subcategory Name
                </label>
                <input
                  type="text"
                  value={editingSubcategory.value}
                  onChange={(e) =>
                    setEditingSubcategory({ ...editingSubcategory, value: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter subcategory name"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setEditingSubcategory(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
            {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
}