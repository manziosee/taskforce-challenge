import { useState, useEffect } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { ArrowUpRight, ArrowDownRight, Wallet, Calendar, CreditCard, Banknote } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { getDashboardData } from '../services/dashboardService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardData {
  incomeVsExpenses: {
    income: number[];
    expenses: number[];
  };
  expenseCategories: {
    categories: string[];
    data: number[];
  };
  recentTransactions: {
    id: number;
    description: string;
    amount: number;
    date: string;
    category: string;
  }[];
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  incomeChange: string;
  expensePercentage: number;
}

export default function Dashboard() {
  const { currency } = useCurrency();
  const { user } = useAuth();
  const [timeRange] = useState('This Month');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getDashboardData(user?.id || '');
        console.log('Dashboard data:', response);
        setDashboardData(response);
      } catch (error: unknown) {
        console.error('Error fetching dashboard data:', error);
        setError((error as Error).message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchDashboard();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-6 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  const lineChartData = dashboardData
    ? {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Income',
            data: dashboardData?.incomeVsExpenses?.income || [],
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Expenses',
            data: dashboardData?.incomeVsExpenses?.expenses || [],
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      }
    : {
        labels: [],
        datasets: [],
      };

  const pieChartData = dashboardData
    ? {
        labels: dashboardData?.expenseCategories?.categories || [],
        datasets: [
          {
            data: dashboardData?.expenseCategories?.data || [],
            backgroundColor: [
              'rgb(59, 130, 246)',
              'rgb(234, 179, 8)',
              'rgb(168, 85, 247)',
              'rgb(239, 68, 68)',
              'rgb(34, 197, 94)',
              'rgb(107, 114, 128)',
            ],
          },
        ],
      }
    : {
        labels: [],
        datasets: [],
      };

  const recentTransactions = dashboardData?.recentTransactions || [];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Here's your financial overview</p>
        </div>
        <div className="flex items-center space-x-2 glass-effect rounded-lg px-4 py-2">
          <Calendar className="w-5 h-5 text-primary-500" />
          <select
            aria-label="Time Range"
            className="bg-transparent border-none focus:ring-0 text-sm"
          >
            <option>{timeRange}</option>
            <option>Last Month</option>
            <option>Last 3 Months</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="hover-card gradient-primary p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
              Total Balance
            </span>
          </div>
          <p className="text-3xl font-bold mb-1">
            {currency} {dashboardData?.totalBalance?.toLocaleString()}
          </p>
          <p className="text-sm text-blue-100">Across all accounts</p>
        </div>

        <div className="hover-card gradient-success p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">Income</span>
          </div>
          <p className="text-3xl font-bold mb-1">
            {currency} {dashboardData?.totalIncome?.toLocaleString()}
          </p>
          <p className="text-sm text-green-100">{dashboardData?.incomeChange}</p>
        </div>

        <div className="hover-card gradient-danger p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Banknote className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">Expenses</span>
          </div>
          <p className="text-3xl font-bold mb-1">
            {currency} {dashboardData?.totalExpenses?.toLocaleString()}
          </p>
          <p className="text-sm text-red-100">{dashboardData?.expensePercentage}% of monthly budget</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="hover-card bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-6">Income vs Expenses</h2>
          <Line
            data={lineChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => `${currency} ${value.toLocaleString()}`,
                  },
                },
              },
            }}
          />
        </div>
        <div className="hover-card bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-6">Expense Categories</h2>
          <Pie
            data={pieChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
            }}
          />
        </div>
      </div>

      <div className="hover-card bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
            View all
          </button>
        </div>
        <div className="space-y-4">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`p-2 rounded-lg ${
                    transaction.amount > 0
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  }`}
                >
                  {transaction.amount > 0 ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-medium ${
                    transaction.amount > 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {transaction.amount > 0 ? '+' : ''}
                  {currency} {Math.abs(transaction.amount).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}