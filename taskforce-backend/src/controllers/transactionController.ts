import { Request, Response } from 'express';
import Transaction, { ITransaction } from '../models/Transaction';
import Category from '../models/Category';
import Budget from '../models/Budget';
import { HttpError, ErrorHandler } from '../utils/http/error-handler';
import { convertCurrency } from '../utils/currency';
import logger from '../utils/logger';
import mongoose from 'mongoose';

export const addTransaction = async (req: Request, res: Response) => {
  const { userId, amount, type, category, subcategory, account, date, description } = req.body;

  try {
    // Validate category exists and matches type
    const categoryExists = await Category.findOne({ 
      userId, 
      name: category,
      type // Ensure category type matches transaction type
    });
    
    if (!categoryExists) {
      return res.status(400).json({ 
        error: 'Category does not exist or type mismatch' 
      });
    }

    const transaction = new Transaction({ 
      userId, 
      amount, 
      type, 
      category, 
      subcategory, 
      account, 
      date: date || new Date(), 
      description 
    });
    
    await transaction.save();

    // Update budget if it's an expense
    if (type === 'expense') {
      await updateBudgetSpent(userId, category, amount);
    }

    logger.info(`Transaction added for user: ${userId}`);
    res.status(201).json(transaction);
  } catch (error) {
    logger.error(`Error adding transaction: ${error}`);
    ErrorHandler.handle(
      new HttpError(500, 'Error adding transaction', 'InternalServerError'), 
      res
    );
  }
};

// Helper function to update budget spent amount
const updateBudgetSpent = async (userId: string, category: string, amount: number) => {
  const budget = await Budget.findOne({ userId, category });
  if (budget) {
    budget.spent += amount;
    await budget.save();
    
    // Check if budget is exceeded
    if (budget.spent > budget.limit) {
      logger.warn(`Budget exceeded for ${category}`);
      // You can add notification logic here
    }
  }
};

export const deleteTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return ErrorHandler.handle(
        new HttpError(404, 'Transaction not found', 'NotFoundError'), 
        res
      );
    }

    // Reverse budget update if it was an expense
    if (transaction.type === 'expense') {
      await updateBudgetSpent(
        transaction.userId, 
        transaction.category, 
        -transaction.amount
      );
    }

    await Transaction.findByIdAndDelete(id);
    logger.info(`Transaction deleted: ${id}`);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting transaction: ${error}`);
    ErrorHandler.handle(
      new HttpError(500, 'Error deleting transaction', 'InternalServerError'), 
      res
    );
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { currency, type, startDate, endDate } = req.query;

  try {
    let query: any = { userId };
    
    if (type) {
      query.type = type;
    }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    let transactions = await Transaction.find(query).sort({ date: -1 });
    
    if (currency) {
      transactions = await Promise.all(transactions.map(async (transaction) => {
        const convertedAmount = await convertCurrency(
          transaction.amount, 
          'RWF', 
          currency as string
        );
        const transactionObj = transaction.toObject();
        return {
          ...transactionObj,
          amount: convertedAmount,
        } as mongoose.Document<unknown, {}, ITransaction> & ITransaction & { _id: unknown, __v: number };
      }));
    }
    
    res.json(transactions);
  } catch (error) {
    logger.error(`Error fetching transactions: ${error}`);
    ErrorHandler.handle(
      new HttpError(500, 'Error fetching transactions', 'InternalServerError'), 
      res
    );
  }
};

export const updateTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount, type, category, subcategory, account, date, description } = req.body;

  try {
    const originalTransaction = await Transaction.findById(id);
    if (!originalTransaction) {
      return ErrorHandler.handle(
        new HttpError(404, 'Transaction not found', 'NotFoundError'), 
        res
      );
    }

    // Validate category if changed
    if (category && category !== originalTransaction.category) {
      const categoryExists = await Category.findOne({ 
        userId: originalTransaction.userId, 
        name: category,
        type: type || originalTransaction.type
      });
      
      if (!categoryExists) {
        return res.status(400).json({ 
          error: 'Category does not exist or type mismatch' 
        });
      }
    }

    // Calculate amount difference for budget updates
    const amountDiff = amount ? (amount - originalTransaction.amount) : 0;

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { 
        amount, 
        type, 
        category, 
        subcategory, 
        account, 
        date, 
        description 
      },
      { new: true }
    );

    // Update budget if it was or is now an expense
    if (originalTransaction.type === 'expense' || type === 'expense') {
      await updateBudgetSpent(
        originalTransaction.userId,
        category || originalTransaction.category,
        type === 'expense' ? amountDiff : -originalTransaction.amount
      );
    }

    res.json(updatedTransaction);
  } catch (error) {
    logger.error(`Error updating transaction: ${error}`);
    ErrorHandler.handle(
      new HttpError(500, 'Error updating transaction', 'InternalServerError'), 
      res
    );
  }
};