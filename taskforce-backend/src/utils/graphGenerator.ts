import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

// Register Chart.js components
Chart.register(...registerables);

export const generateGraphImage = async (
  config: ChartConfiguration,
  width: number = 800,
  height: number = 400
): Promise<Buffer> => {
  // Create a canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create the chart
  new Chart(ctx as any, config);

  // Return the image buffer
  return canvas.toBuffer('image/png');
};

export const generateReportGraphs = async (reportData: any): Promise<{ 
  incomeVsExpenses: Buffer, 
  expenseCategories: Buffer,
  netIncomeTrend: Buffer 
}> => {
  // Income vs Expenses graph
  const incomeVsExpensesConfig: ChartConfiguration = {
    type: 'bar',
    data: reportData.incomeVsExpenses,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Income vs Expenses'
        }
      }
    }
  };

  // Expense Categories graph
  const expenseCategoriesConfig: ChartConfiguration = {
    type: 'pie',
    data: reportData.expenseCategories,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Expense Categories'
        }
      }
    }
  };

  // Net Income Trend graph
  const netIncomeTrendConfig: ChartConfiguration = {
    type: 'line',
    data: reportData.netIncomeTrend,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Net Income Trend'
        }
      }
    }
  };

  const [incomeVsExpenses, expenseCategories, netIncomeTrend] = await Promise.all([
    generateGraphImage(incomeVsExpensesConfig),
    generateGraphImage(expenseCategoriesConfig),
    generateGraphImage(netIncomeTrendConfig)
  ]);

  return { incomeVsExpenses, expenseCategories, netIncomeTrend };
};