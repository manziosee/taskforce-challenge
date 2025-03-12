import { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import { generateCSV } from '../utils/csvExport';
import { HttpError, ErrorHandler } from '../utils/http/error-handler';
import logger from '../utils/logger';

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
    const transactions = await Transaction.find({
      userId,
      date: { $gte: new Date(startDate as string), $lte: new Date(endDate as string) },
    });

    // Group transactions by month for income vs expenses
    const monthlyData = transactions.reduce((acc: Record<string, { income: number; expenses: number }>, transaction) => {
      const date = new Date(transaction.date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        acc[monthYear].income += transaction.amount;
      } else {
        acc[monthYear].expenses += transaction.amount;
      }
      
      return acc;
    }, {});

    // Format income vs expenses data
    const months = Object.keys(monthlyData);
    const incomeVsExpenses = {
      labels: months,
      income: months.map(month => monthlyData[month].income),
      expenses: months.map(month => monthlyData[month].expenses)
    };

    // Group transactions by category for expense categories
    const categoryData = transactions
      .filter(transaction => transaction.type === 'expense')
      .reduce((acc: Record<string, number>, transaction) => {
        const category = transaction.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += transaction.amount;
        return acc;
      }, {});

    // Format expense categories data
    const categories = Object.keys(categoryData);
    const expenseCategories = {
      categories,
      data: categories.map(category => categoryData[category])
    };

    // Calculate monthly net income for trend
    const monthlyTrend = {
      labels: months,
      data: months.map(month => monthlyData[month].income - monthlyData[month].expenses)
    };

    res.json({
      incomeVsExpenses,
      expenseCategories,
      monthlyTrend
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
    const transactions = await Transaction.find({
      userId,
      date: { $gte: new Date(startDate as string), $lte: new Date(endDate as string) },
    });

    const csvData = generateCSV(transactions);
    res.header('Content-Type', 'text/csv');
    res.attachment('financial_report.csv');
    res.send(csvData);
  } catch (error) {
    logger.error(`Error exporting report: ${error}`);
    ErrorHandler.handle(
      new HttpError(500, 'Error exporting report', 'InternalServerError'),
      res
    );
  }
};