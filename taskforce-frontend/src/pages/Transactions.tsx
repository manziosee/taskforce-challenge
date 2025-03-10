import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from '../services/transactionService';

interface Transaction {
  id: number;
  date: Date;
  description: string;
  category: string;
  account: string;
  amount: number;
  type: 'income' | 'expense';
}

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    date: new Date(Date.now()),
    description: '',
    category: '',
    account: '',
    amount: '',
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getTransactions(user?.id || '');
        setTransactions(response);
      } catch (error: unknown) {
        setError((error as Error).message || 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction({
      ...transaction,
      type: transaction.amount > 0 ? 'income' : 'expense',
    });
    setShowAddForm(true);
  };

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTransaction) {
      setLoading(true);
      setError(null);
      try {
        const response = await updateTransaction(editingTransaction.id, {
          ...editingTransaction,
          type: Number(editingTransaction.amount) > 0 ? 'income' : 'expense',
        });
        const updatedTransactions = transactions.map((t) =>
          t.id === editingTransaction.id ? response : t
        );
        setTransactions(updatedTransactions);
        setEditingTransaction(null);
        setShowAddForm(false);
      } catch (error: unknown) {
        setError((error as Error).message || 'Failed to update transaction');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setLoading(true);
      setError(null);
      try {
        await deleteTransaction(id);
        setTransactions(transactions.filter((t) => t.id !== id));
      } catch (error: unknown) {
        setError((error as Error).message || 'Failed to delete transaction');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await addTransaction({
        ...newTransaction,
        userId: user?.id || '',
        amount: Number(newTransaction.amount),
        type: Number(newTransaction.amount) > 0 ? 'income' : 'expense',
        date: new Date(newTransaction.date),
      });

      if (response && response.id) {
        setTransactions([...transactions, response]);
        setShowAddForm(false);
        setNewTransaction({
          date: new Date(Date.now()),
          description: '',
          category: '',
          account: '',
          amount: '',
        });
      } else {
        setError('Invalid response from server');
      }
    } catch (error: unknown) {
      setError((error as Error).message || 'Failed to add transaction');
      console.error('Error adding transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !transactions.length) {
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
          Transactions
        </h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="button-hover inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Transaction
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="button-hover inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <Filter className="w-5 h-5 mr-2" />
          Filter
        </button>
      </div>

      {/* Transactions Table */}
      <div className="hover-card bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {transaction.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {transaction.account}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      transaction.amount > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {transaction.amount > 0 ? '+' : '-'}
                    {Math.abs(transaction.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditTransaction(transaction)}
                        className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Transaction Modal */}
      {(showAddForm || editingTransaction) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md animate-scale-in">
            <h2 className="text-lg font-semibold mb-4">
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </h2>
            <form onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={editingTransaction ? new Date(editingTransaction.date).toISOString().split('T')[0] : new Date(newTransaction.date).toISOString().split('T')[0]}
                  onChange={(e) => {
                    if (editingTransaction) {
                      setEditingTransaction({
                        ...editingTransaction,
                        date: new Date(e.target.value),
                      });
                    } else {
                      setNewTransaction({
                        ...newTransaction,
                        date: new Date(e.target.value),
                      });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  required
                  title="Transaction Date"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editingTransaction ? editingTransaction.description : newTransaction.description}
                  onChange={(e) => {
                    if (editingTransaction) {
                      setEditingTransaction({
                        ...editingTransaction,
                        description: e.target.value,
                      });
                    } else {
                      setNewTransaction({
                        ...newTransaction,
                        description: e.target.value,
                      });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter description"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={editingTransaction ? editingTransaction.category : newTransaction.category}
                  onChange={(e) => {
                    if (editingTransaction) {
                      setEditingTransaction({
                        ...editingTransaction,
                        category: e.target.value,
                      });
                    } else {
                      setNewTransaction({
                        ...newTransaction,
                        category: e.target.value,
                      });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter category"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account
                </label>
                <input
                  type="text"
                  value={editingTransaction ? editingTransaction.account : newTransaction.account}
                  onChange={(e) => {
                    if (editingTransaction) {
                      setEditingTransaction({
                        ...editingTransaction,
                        account: e.target.value,
                      });
                    } else {
                      setNewTransaction({
                        ...newTransaction,
                        account: e.target.value,
                      });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter account"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={editingTransaction ? editingTransaction.amount : newTransaction.amount}
                  onChange={(e) => {
                    if (editingTransaction) {
                      setEditingTransaction({
                        ...editingTransaction,
                        amount: Number(e.target.value),
                      });
                    } else {
                      setNewTransaction({
                        ...newTransaction,
                        amount: e.target.value,
                      });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingTransaction(null);
                  }}
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
                      {editingTransaction ? 'Updating...' : 'Saving...'}
                    </div>
                  ) : (
                    editingTransaction ? 'Update Transaction' : 'Save Transaction'
                  )}
                </button>
              </div>
            </form>
            {error && (
              <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}