// src/pages/Reports.tsx
import { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Calendar, Download } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { getFinancialReport, exportFinancialReport } from '../services/reportsService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ReportData {
  incomeVsExpenses: {
    labels: string[];
    income: number[];
    expenses: number[];
  };
  expenseCategories: {
    categories: string[];
    data: number[];
  };
  monthlyTrend: {
    labels: string[];
    data: number[];
  };
}

export default function Reports() {
  const { currency } = useCurrency();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('This Month');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const startDate = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(); // Last month
        const endDate = new Date().toISOString(); // Current date
  
        // Debugging log
        console.log('Fetching report for user:', user?.id, 'with startDate:', startDate, 'and endDate:', endDate);
  
        const response = await getFinancialReport(user?.id || '');
        console.log('Report data:', response); // Debugging line
        setReportData(response);
      } catch (error: unknown) {
        console.error('Error fetching report data:', error); // Debugging line
        setError((error as Error).message || 'Failed to fetch report data');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchReports();
    }
  }, [user]);

  const handleExport = async () => {
    try {
      const response = await exportFinancialReport(user?.id || '');
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `financial_report_${user?.id}.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (error: unknown) {
      setError((error as Error).message || 'Failed to export report data');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  const incomeExpenseData = reportData
    ? {
        labels: reportData?.incomeVsExpenses?.labels || [],
        datasets: [
          {
            label: 'Income',
            data: reportData?.incomeVsExpenses?.income || [],
            backgroundColor: 'rgba(34, 197, 94, 0.5)',
          },
          {
            label: 'Expenses',
            data: reportData?.incomeVsExpenses?.expenses || [],
            backgroundColor: 'rgba(239, 68, 68, 0.5)',
          },
        ],
      }
    : {
        labels: [],
        datasets: [],
      };

  const categoryData = reportData
    ? {
        labels: reportData?.expenseCategories?.categories || [],
        datasets: [
          {
            data: reportData?.expenseCategories?.data || [],
            backgroundColor: [
              'rgba(59, 130, 246, 0.5)',
              'rgba(234, 179, 8, 0.5)',
              'rgba(168, 85, 247, 0.5)',
              'rgba(239, 68, 68, 0.5)',
              'rgba(34, 197, 94, 0.5)',
              'rgba(107, 114, 128, 0.5)',
            ],
          },
        ],
      }
    : {
        labels: [],
        datasets: [],
      };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Financial Reports</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-700">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select
              aria-label="Select Time Range"
              className="bg-transparent border-none focus:ring-0 text-sm"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option>This Month</option>
              <option>Last Month</option>
              <option>Last 3 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <button
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={handleExport}
          >
            <Download className="w-5 h-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-6">Income vs Expenses</h2>
          <Bar
            data={incomeExpenseData}
            options={{
              responsive: true,
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

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-6">Expense Categories</h2>
          <Bar
            data={categoryData}
            options={{
              responsive: true,
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
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Monthly Trend</h2>
        <Line
          data={
            reportData
              ? {
                  labels: reportData?.monthlyTrend?.labels || [],
                  datasets: [
                    {
                      label: 'Net Income',
                      data: reportData?.monthlyTrend?.data || [],
                      borderColor: 'rgb(59, 130, 246)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.4,
                      fill: true,
                    },
                  ],
                }
              : {
                  labels: [],
                  datasets: [],
                }
          }
          options={{
            responsive: true,
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
    </div>
  );
}