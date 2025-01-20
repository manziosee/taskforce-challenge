import { useState, useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getCategories,
  addCategory,
  deleteCategory,
  updateSubcategory,
  deleteSubcategory,
} from '../services/categoryService';

export default function Categories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<{ id: string; name: string; subcategories: string[] }[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    subcategories: '',
  });
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

  const handleEditSubcategory = (categoryId: string, subcategoryIndex: number, value: string) => {
    setEditingSubcategory({ categoryId, subcategoryIndex, value });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Add Category Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div>
                <label htmlFor="subcategories" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subcategories (comma-separated)
                </label>
                <input
                  type="text"
                  id="subcategories"
                  value={newCategory.subcategories}
                  onChange={(e) => setNewCategory({ ...newCategory, subcategories: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Groceries, Restaurants, Fast Food"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Category'}
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Edit Subcategory</h2>
            <form onSubmit={handleUpdateSubcategory} className="space-y-4">
              <div>
                <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subcategory
                </label>
                <input
                  type="text"
                  id="subcategory"
                  value={editingSubcategory.value}
                  onChange={(e) =>
                    setEditingSubcategory({ ...editingSubcategory, value: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <div className="flex items-center space-x-2">
                  <button
                    className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    title="Delete"
                    onClick={() => handleDeleteCategory(category.id)}
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
                        className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                        onClick={() =>
                          handleEditSubcategory(category.id, index, subcategory)
                        }
                        title="Edit Subcategory"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        onClick={() => handleDeleteSubcategory(category.id, index)}
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
    </div>
  );
}