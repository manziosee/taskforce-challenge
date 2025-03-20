import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { getBudgets, addBudget, updateBudget, deleteBudget } from '../services/budgetService';
import { getCategories } from '../services/categoryService';

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: string;
  type: 'income' | 'expense';
}

interface Category {
  id: string;
  name: string;
  subcategories: string[];
}

export default function Budgets() {
  const { currency } = useCurrency();
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: '',
    limit: '',
    period: 'Monthly',
    type: 'expense' as 'income' | 'expense',
  });
  const [editBudget, setEditBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [budgetsData, categoriesData] = await Promise.all([
          getBudgets(user?.id || ''),
          getCategories(user?.id || '')
        ]);
        setBudgets(budgetsData);
        setCategories(categoriesData);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!user?.id) {
      setError('User ID is missing');
      setLoading(false);
      return;
    }

    try {
      const responseData = await addBudget({ 
        ...newBudget, 
        userId: user.id,
        limit: Number(newBudget.limit),
        period: newBudget.period.toLowerCase()
      });
      
      setBudgets([...budgets, responseData]);
      setShowAddForm(false);
      setNewBudget({ category: '', limit: '', period: 'Monthly', type: 'expense' });
    } catch (err) {
      setError('Failed to add budget');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (budget: Budget) => {
    setEditBudget(budget);
    setShowAddForm(true);
  };

  const handleUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBudget) return;
    
    setLoading(true);
    setError('');
    
    try {
      const responseData = await updateBudget(editBudget.id, {
        category: editBudget.category,
        limit: editBudget.limit,
        period: editBudget.period.toLowerCase(),

      });
      
      setBudgets(budgets.map(b => b.id === responseData.id ? responseData : b));
      setShowAddForm(false);
      setEditBudget(null);
    } catch (err) {
      setError('Failed to update budget');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      setLoading(true);
      setError('');
      
      try {
        await deleteBudget(id);
        setBudgets(budgets.filter((budget) => budget.id !== id));
      } catch (err) {
        setError('Failed to delete budget');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !budgets.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Budget Planning</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Budget
        </button>
      </div>

      {/* Add/Edit Budget Form */}
      {(showAddForm || editBudget) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editBudget ? 'Edit Budget' : 'Create New Budget'}
            </h2>
            <form onSubmit={editBudget ? handleUpdateBudget : handleAddBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  aria-label="Category"
                  value={editBudget ? editBudget.category : newBudget.category}
                  onChange={(e) => {
                    if (editBudget) {
                      setEditBudget({ ...editBudget, category: e.target.value });
                    } else {
                      setNewBudget({ ...newBudget, category: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Limit ({currency})
                </label>
                <input
                  type="number"
                  value={editBudget ? editBudget.limit : newBudget.limit}
                  onChange={(e) => {
                    if (editBudget) {
                      setEditBudget({ ...editBudget, limit: Number(e.target.value) });
                    } else {
                      setNewBudget({ ...newBudget, limit: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter budget limit"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Period
                </label>
                <select
                  aria-label="Period"
                  value={editBudget ? editBudget.period : newBudget.period}
                  onChange={(e) => {
                    if (editBudget) {
                      setEditBudget({ ...editBudget, period: e.target.value });
                    } else {
                      setNewBudget({ ...newBudget, period: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  aria-label="Type"
                  value={editBudget ? editBudget.type : newBudget.type}
                  onChange={(e) => {
                    if (editBudget) {
                      setEditBudget({ ...editBudget, type: e.target.value as 'income' | 'expense' });
                    } else {
                      setNewBudget({ ...newBudget, type: e.target.value as 'income' | 'expense' });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditBudget(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      {editBudget ? 'Updating...' : 'Saving...'}
                    </div>
                  ) : (
                    editBudget ? 'Update Budget' : 'Save Budget'
                  )}
                </button>
              </div>
            </form>
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </div>
        </div>
      )}

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => (
          <div key={budget.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{budget.category}</h3>
              <div className="flex items-center space-x-2">
                <button
                  className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  title="Edit"
                  onClick={() => handleEditClick(budget)}
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                  title="Delete"
                  onClick={() => handleDeleteBudget(budget.id)}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Spent</span>
                <span>Budget</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>{currency} {budget.spent.toLocaleString()}</span>
                <span>{currency} {budget.limit.toLocaleString()}</span>
              </div>
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                      (budget.spent / budget.limit) * 100 > 100
                        ? 'bg-red-500'
                        : (budget.spent / budget.limit) * 100 > 80
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className={(budget.spent / budget.limit) * 100 > 100 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}>
                  {((budget.spent / budget.limit) * 100).toFixed(1)}% used
                </span>
                <span className={`text-sm font-medium ${
                  budget.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {budget.period}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}