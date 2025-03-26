import { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import Budget from '../models/Budget';
import { HttpError, ErrorHandler } from '../utils/http/error-handler';
import { convertCurrency } from '../utils/currency';
import logger from '../utils/logger';

export const getDashboardData = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { currency } = req.query;

  try {
    // Get current month's start and end dates
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get transactions for current month
    const transactions = await Transaction.find({ 
      userId,
      date: { $gte: firstDay, $lte: lastDay }
    });

    // Calculate totals
    let income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    let expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Get budgets
    const budgets = await Budget.find({ userId });
    
    // Convert currency if requested
    if (currency) {
      income = await convertCurrency(income, 'RWF', currency as string);
      expenses = await convertCurrency(expenses, 'RWF', currency as string);
    }

    // Get recent transactions
    const recentTransactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(5);

    // Get budget status
    const budgetStatus = budgets.map(budget => ({
      category: budget.category,
      limit: budget.limit,
      spent: budget.spent,
      remaining: budget.limit - budget.spent,
      percentage: Math.min(100, (budget.spent / budget.limit) * 100),
      status: budget.spent > budget.limit ? 'exceeded' : 
              budget.spent > budget.limit * 0.8 ? 'warning' : 'good'
    }));

    res.json({
      summary: {
        income,
        expenses,
        net: income - expenses
      },
      budgetStatus,
      recentTransactions,
      chartData: {
        labels: ['Income', 'Expenses'],
        datasets: [{
          data: [income, expenses],
          backgroundColor: ['#4CAF50', '#F44336']
        }]
      }
    });
  } catch (error) {
    logger.error(`Error fetching dashboard data: ${error}`);
    ErrorHandler.handle(
      new HttpError(500, 'Error fetching dashboard data', 'InternalServerError'), 
      res
    );
  }
};