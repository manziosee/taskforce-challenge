import { Request, Response } from 'express';
import Budget from '../models/Budget';
import { HttpError, ErrorHandler } from '../utils/http/error-handler';
import logger from '../utils/logger';
import BudgetNotificationEmail from '../emails/BudgetNotificationEmail';
import EmailService from '../service/emails.service';
import User from '../models/User';
import Category from '../models/Category';

export const checkBudget = async (userId: string) => {
  try {
    const budgets = await Budget.find({ userId });
    const user = await User.findById(userId);

    for (const budget of budgets) {
      if (budget.spent > budget.limit) {
        const message = `Budget exceeded for ${budget.category}. Limit: ${budget.limit}, Spent: ${budget.spent}`;
        if (user) {
          await EmailService.sendOTP(
            { to: user.email, subject: 'Budget Exceeded Notification' },
            await BudgetNotificationEmail({ message })
          );
        }
      }
    }
  } catch (error) {
    logger.error(`Error checking budgets: ${error}`);
  }
};

export const getBudgets = async (req: Request, res: Response) => {
  const userId = req.params.userId;

  try {
    const budgets = await Budget.find({ userId });
    res.status(200).json(budgets);
  } catch (error) {
    logger.error(`Error fetching budgets for user ID: ${userId}`, error);
    ErrorHandler.handle(new HttpError(500, 'Error fetching budgets', 'InternalServerError'), res);
  }
};

export const addBudget = async (req: Request, res: Response) => {
  const { userId, category, limit, period } = req.body;

  if (!userId || !category || !limit || !period) {
    return ErrorHandler.handle(
      new HttpError(400, 'Missing required fields', 'ValidationError'),
      res
    );
  }

  try {
    const categoryExists = await Category.findOne({ userId, name: category });
    if (!categoryExists) {
      return res.status(400).json({ error: 'Category does not exist' });
    }

    const budget = new Budget({ userId, category, limit, period, spent: 0 });
    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    logger.error(`Error adding budget: ${error}`);
    ErrorHandler.handle(
      new HttpError(500, 'Error adding budget', 'InternalServerError'),
      res
    );
  }
};

export const updateBudget = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Find the budget first to ensure it exists
    const existingBudget = await Budget.findById(id);
    if (!existingBudget) {
      return ErrorHandler.handle(new HttpError(404, 'Budget not found', 'NotFoundError'), res);
    }

    // Prevent updating spent amount directly
    if (updateData.spent !== undefined) {
      return ErrorHandler.handle(
        new HttpError(400, 'Cannot directly update spent amount', 'BadRequestError'),
        res
      );
    }

    const budget = await Budget.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    );
    
    res.json(budget);
  } catch (error) {
    logger.error(`Error updating budget: ${error}`);
    ErrorHandler.handle(new HttpError(500, 'Error updating budget', 'InternalServerError'), res);
  }
};

export const deleteBudget = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const budget = await Budget.findById(id);
    if (!budget) {
      return ErrorHandler.handle(new HttpError(404, 'Budget not found', 'NotFoundError'), res);
    }

    await Budget.findByIdAndDelete(id);
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting budget: ${error}`);
    ErrorHandler.handle(new HttpError(500, 'Error deleting budget', 'InternalServerError'), res);
  }
};