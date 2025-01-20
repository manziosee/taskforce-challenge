import { Request, Response } from 'express';
import Budget from '../models/Budget';
import { HttpError, ErrorHandler } from '../utils/http/error-handler';
import logger from '../utils/logger';
import BudgetNotificationEmail from '../emails/BudgetNotificationEmail';
import EmailService from '../service/emails.service';
import User from '../models/User';

export const checkBudget = async (userId: string) => {
  try {
    const budgets = await Budget.find({ userId });
    const user = await User.findById(userId);

    for (const budget of budgets) {
      if (budget.spent > budget.limit) {
        const message = `Budget exceeded for ${budget.category}. Limit: ${budget.limit}, Spent: ${budget.spent}`;
        if (user) {
          // Send email notification
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

  // Log the incoming request
  logger.info(`Fetching budgets for user ID: ${userId}`);

  try {
    const budgets = await Budget.find({ userId });
    logger.info(`Fetched budgets for user ID: ${userId}`, budgets);
    res.status(200).json(budgets);
  } catch (error) {
    logger.error(`Error fetching budgets for user ID: ${userId}`, error);
    ErrorHandler.handle(new HttpError(500, 'Error fetching budgets', 'InternalServerError'), res);
  }
};
export const addBudget = async (req: Request, res: Response) => {
  const { userId, category, limit, period } = req.body;

  try {
    const budget = new Budget({ userId, category, limit, period });
    await budget.save();
    logger.info(`Budget added for user: ${userId}`);
    res.status(201).json(budget);
  } catch (error) {
    logger.error(`Error adding budget: ${error}`);
    ErrorHandler.handle(new HttpError(500, 'Error adding budget', 'InternalServerError'), res);
  }
};

export const updateBudget = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { spent } = req.body;

  try {
    const budget = await Budget.findByIdAndUpdate(id, { spent }, { new: true });
    if (!budget) {
      return ErrorHandler.handle(new HttpError(404, 'Budget not found', 'NotFoundError'), res);
    }
    logger.info(`Budget updated: ${id}`);
    res.json(budget);
  } catch (error) {
    logger.error(`Error updating budget: ${error}`);
    ErrorHandler.handle(new HttpError(500, 'Error updating budget', 'InternalServerError'), res);
  }
};