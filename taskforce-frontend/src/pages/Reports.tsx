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
      if (!user?.id) return;
      
      setLoading(true);
      setError(null);
      try {
        // Pass the timeRange to the API call
        const response = await getFinancialReport(user.id, timeRange);
        setReportData(response);
      } catch (error: unknown) {
        setError((error as Error).message || 'Failed to fetch report data');
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchReports();
    }
  }, [user, timeRange]); // Re-fetch when timeRange changes

  const handleExport = async () => {
    if (!user?.id) return;
    
    try {
      // Pass the timeRange to the export function
      const response = await exportFinancialReport(user.id, timeRange);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `financial_report_${timeRange.replace(/\s+/g, '_').toLowerCase()}.csv`);
      document.body.appendChild(link);
      link.click();
      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);
    } catch (error: unknown) {
      console.error('Error exporting report:', error);
      setError('Failed to export report');
    }
  };

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value);
  };

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

  // Check if there's any data to display
  const hasIncomeExpenseData = (reportData?.incomeVsExpenses?.labels?.length ?? 0) > 0;
  const hasExpenseCategoryData = (reportData?.expenseCategories?.categories?.length ?? 0) > 0;
  const hasMonthlyTrendData = (reportData?.monthlyTrend?.labels?.length ?? 0) > 0;
  
  // Show a message if no data is available for any chart
  const noDataAvailable = !hasIncomeExpenseData && !hasExpenseCategoryData && !hasMonthlyTrendData;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          Financial Reports
        </h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 glass-effect rounded-lg px-4 py-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            <select
              aria-label="Select Time Range"
              className="bg-transparent border-none focus:ring-0 text-sm"
              value={timeRange}
              onChange={handleTimeRangeChange}
            >
              <option>This Month</option>
              <option>Last Month</option>
              <option>Last 3 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <button
            className="button-hover inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            onClick={handleExport}
            disabled={noDataAvailable}
          >
            <Download className="w-5 h-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {noDataAvailable ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <div className="text-4xl text-gray-300 dark:text-gray-600 mb-4">📊</div>
          <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300">No Data Available</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-center">
            There are no transactions for the selected time period. Try selecting a different time range or add some transactions.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="hover-card bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
              <h2 className="text-lg font-semibold mb-6">Income vs Expenses</h2>
              {hasIncomeExpenseData ? (
                <Bar
                  data={{
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
                  }}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => `${currency} ${Number(value).toLocaleString()}`,
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  No income or expense data available for this period
                </div>
              )}
            </div>

            <div className="hover-card bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
              <h2 className="text-lg font-semibold mb-6">Expense Categories</h2>
              {hasExpenseCategoryData ? (
                <Bar
                  data={{
                    labels: reportData?.expenseCategories?.categories || [],
                    datasets: [
                      {
                        label: 'Expenses',
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
                  }}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => `${currency} ${Number(value).toLocaleString()}`,
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  No expense category data available for this period
                </div>
              )}
            </div>
          </div>

          <div className="hover-card bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-lg font-semibold mb-6">Monthly Trend</h2>
            {hasMonthlyTrendData ? (
              <Line
                data={{
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
                }}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `${currency} ${Number(value).toLocaleString()}`,
                      },
                    },
                  },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                No monthly trend data available for this period
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}