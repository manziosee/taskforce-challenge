import { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import { generateCSV } from '../utils/csvExport';
import { generateReportGraphs } from '../utils/graphGenerator';
import { HttpError, ErrorHandler } from '../utils/http/error-handler';
import logger from '../utils/logger';
import JSZip from 'jszip';
import { Readable } from 'stream';

export const generateReport = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return ErrorHandler.handle(
      new HttpError(400, 'Missing startDate or endDate', 'ValidationError'),
      res
    );
  }

  try {
    // Get the report data
    const transactions = await Transaction.find({
      userId,
      date: { 
        $gte: new Date(startDate as string), 
        $lte: new Date(endDate as string) 
      },
    }).sort({ date: 1 });

    const monthlyData = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = { 
          income: 0, 
          expenses: 0,
          label: date.toLocaleString('default', { month: 'short', year: 'numeric' })
        };
      }
      
      if (transaction.type === 'income') {
        acc[monthYear].income += transaction.amount;
      } else {
        acc[monthYear].expenses += transaction.amount;
      }
      
      return acc;
    }, {} as Record<string, { income: number; expenses: number; label: string }>);

    // Format data for charts
    const reportData = {
      incomeVsExpenses: {
        labels: Object.values(monthlyData).map(data => data.label),
        datasets: [
          {
            label: 'Income',
            data: Object.values(monthlyData).map(data => data.income),
            backgroundColor: '#4CAF50',
            borderColor: '#388E3C',
            borderWidth: 1
          },
          {
            label: 'Expenses',
            data: Object.values(monthlyData).map(data => data.expenses),
            backgroundColor: '#F44336',
            borderColor: '#D32F2F',
            borderWidth: 1
          }
        ]
      },
      expenseCategories: {
        labels: Object.keys(
          transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, transaction) => {
              const category = transaction.category || 'Uncategorized';
              acc[category] = (acc[category] || 0) + transaction.amount;
              return acc;
            }, {} as Record<string, number>)
        ),
        datasets: [{
          data: Object.values(
            transactions
              .filter(t => t.type === 'expense')
              .reduce((acc, transaction) => {
                const category = transaction.category || 'Uncategorized';
                acc[category] = (acc[category] || 0) + transaction.amount;
                return acc;
              }, {} as Record<string, number>)
          ),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#8AC249', '#EA5F89', '#00BFFF', '#A0522D'
          ]
        }]
      },
      netIncomeTrend: {
        labels: Object.values(monthlyData).map(data => data.label),
        datasets: [{
          label: 'Net Income',
          data: Object.values(monthlyData).map(data => data.income - data.expenses),
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          fill: true,
          tension: 0.4
        }]
      }
    };

    // Return the report data as JSON
    res.json({
      incomeVsExpenses: reportData.incomeVsExpenses,
      expenseCategories: reportData.expenseCategories,
      netIncomeTrend: reportData.netIncomeTrend,
      totalIncome: transactions.reduce((sum, transaction) => sum + (transaction.type === 'income' ? transaction.amount : 0), 0),
      totalExpenses: transactions.reduce((sum, transaction) => sum + (transaction.type === 'expense' ? transaction.amount : 0), 0),
      transactions
    });
  } catch (error) {
    logger.error(`Error generating report: ${error}`);
    ErrorHandler.handle(
      new HttpError(500, 'Error generating report', 'InternalServerError'),
      res
    );
  }
};

export const exportReport = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return ErrorHandler.handle(
      new HttpError(400, 'Missing startDate or endDate', 'ValidationError'),
      res
    );
  }

  try {
    // Get the report data (reuse the generateReport logic)
    const transactions = await Transaction.find({
      userId,
      date: { 
        $gte: new Date(startDate as string), 
        $lte: new Date(endDate as string) 
      },
    }).sort({ date: 1 });

    const monthlyData = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = { 
          income: 0, 
          expenses: 0,
          label: date.toLocaleString('default', { month: 'short', year: 'numeric' })
        };
      }
      
      if (transaction.type === 'income') {
        acc[monthYear].income += transaction.amount;
      } else {
        acc[monthYear].expenses += transaction.amount;
      }
      
      return acc;
    }, {} as Record<string, { income: number; expenses: number; label: string }>);

    // Format data for charts
    const reportData = {
      incomeVsExpenses: {
        labels: Object.values(monthlyData).map(data => data.label),
        datasets: [
          {
            label: 'Income',
            data: Object.values(monthlyData).map(data => data.income),
            backgroundColor: '#4CAF50',
            borderColor: '#388E3C',
            borderWidth: 1
          },
          {
            label: 'Expenses',
            data: Object.values(monthlyData).map(data => data.expenses),
            backgroundColor: '#F44336',
            borderColor: '#D32F2F',
            borderWidth: 1
          }
        ]
      },
      expenseCategories: {
        labels: Object.keys(
          transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, transaction) => {
              const category = transaction.category || 'Uncategorized';
              acc[category] = (acc[category] || 0) + transaction.amount;
              return acc;
            }, {} as Record<string, number>)
        ),
        datasets: [{
          data: Object.values(
            transactions
              .filter(t => t.type === 'expense')
              .reduce((acc, transaction) => {
                const category = transaction.category || 'Uncategorized';
                acc[category] = (acc[category] || 0) + transaction.amount;
                return acc;
              }, {} as Record<string, number>)
          ),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#8AC249', '#EA5F89', '#00BFFF', '#A0522D'
          ]
        }]
      },
      netIncomeTrend: {
        labels: Object.values(monthlyData).map(data => data.label),
        datasets: [{
          label: 'Net Income',
          data: Object.values(monthlyData).map(data => data.income - data.expenses),
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          fill: true,
          tension: 0.4
        }]
      }
    };

    // Generate CSV
    const csvData = generateCSV(transactions);

    // Generate graph images
    const { incomeVsExpenses, expenseCategories, netIncomeTrend } = 
      await generateReportGraphs(reportData);

    // Create ZIP file
    const zip = new JSZip();
    zip.file('financial_report.csv', csvData);
    zip.file('income_vs_expenses.png', incomeVsExpenses);
    zip.file('expense_categories.png', expenseCategories);
    zip.file('net_income_trend.png', netIncomeTrend);

    // Generate README.txt with description
    const readmeContent = `Financial Report Export
========================

This ZIP file contains:
1. financial_report.csv - All transactions in CSV format
2. income_vs_expenses.png - Bar chart comparing income and expenses
3. expense_categories.png - Pie chart of expense breakdown
4. net_income_trend.png - Line chart showing net income over time

Generated on: ${new Date().toISOString()}
Time Period: ${startDate} to ${endDate}
`;
    zip.file('README.txt', readmeContent);

    // Generate the ZIP file
    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

    // Set response headers
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="financial_report.zip"',
      'Content-Length': zipContent.length
    });

    // Send the ZIP file
    const stream = Readable.from(zipContent);
    stream.pipe(res);
  } catch (error) {
    logger.error(`Error exporting report: ${error}`);
    ErrorHandler.handle(
      new HttpError(500, 'Error exporting report', 'InternalServerError'),
      res
    );
  }
};