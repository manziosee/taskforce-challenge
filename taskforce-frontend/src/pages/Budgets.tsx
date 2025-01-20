// src/pages/Budget.tsx
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { getBudgets, addBudget, deleteBudget } from '../services/budgetService';

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: string;
}

export default function Budgets() {
  const { currency } = useCurrency();
  const { user } = useAuth(); // Get user from useAuth
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: '',
    limit: 0,
    period: 'Monthly',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBudgets = async () => {
      setLoading(true);
      try {
        console.log('Fetching budgets for user ID:', user?.id);
        const data = await getBudgets(user?.id || ''); // Use the actual user ID
        console.log('Fetched budgets:', data);
        setBudgets(data);
      } catch (err) {
        setError('Failed to fetch budgets');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBudgets();
    }
  }, [user]);

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await addBudget(newBudget);
      setBudgets([...budgets, data]);
      setShowAddForm(false);
      setNewBudget({ category: '', limit: 0, period: 'Monthly' });
    } catch (err) {
      setError('Failed to add budget');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    setLoading(true);
    try {
      await deleteBudget(id);
      setBudgets(budgets.filter((budget) => budget.id !== id));
    } catch (err) {
      setError('Failed to delete budget');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {error && <div className="text-red-500">{error}</div>}
      {loading && <div>Loading...</div>}

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

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Create New Budget</h2>
            <form onSubmit={handleAddBudget} className="space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter category"
                  required
                />
              </div>
              <div>
                <label htmlFor="limit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Limit
                </label>
                <input
                  type="number"
                  id="limit"
                  value={newBudget.limit}
                  onChange={(e) => setNewBudget({ ...newBudget, limit: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter limit"
                  required
                />
              </div>
              <div>
                <label htmlFor="period" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Period
                </label>
                <select
                  id="period"
                  value={newBudget.period}
                  onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Yearly">Yearly</option>
                </select>
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
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => (
          <div key={budget.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{budget.category}</h3>
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
                <span className="text-gray-500 dark:text-gray-400">{budget.period}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}