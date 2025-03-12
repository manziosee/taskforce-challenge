"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBudget = exports.updateBudget = exports.addBudget = exports.getBudgets = exports.checkBudget = void 0;
const Budget_1 = __importDefault(require("../models/Budget"));
const error_handler_1 = require("../utils/http/error-handler");
const logger_1 = __importDefault(require("../utils/logger"));
const BudgetNotificationEmail_1 = __importDefault(require("../emails/BudgetNotificationEmail"));
const emails_service_1 = __importDefault(require("../service/emails.service"));
const User_1 = __importDefault(require("../models/User"));
const checkBudget = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const budgets = yield Budget_1.default.find({ userId });
        const user = yield User_1.default.findById(userId);
        for (const budget of budgets) {
            if (budget.spent > budget.limit) {
                const message = `Budget exceeded for ${budget.category}. Limit: ${budget.limit}, Spent: ${budget.spent}`;
                if (user) {
                    // Send email notification
                    yield emails_service_1.default.sendOTP({ to: user.email, subject: 'Budget Exceeded Notification' }, yield (0, BudgetNotificationEmail_1.default)({ message }));
                }
            }
        }
    }
    catch (error) {
        logger_1.default.error(`Error checking budgets: ${error}`);
    }
});
exports.checkBudget = checkBudget;
const getBudgets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    // Log the incoming request
    logger_1.default.info(`Fetching budgets for user ID: ${userId}`);
    try {
        const budgets = yield Budget_1.default.find({ userId });
        logger_1.default.info(`Fetched budgets for user ID: ${userId}`, budgets);
        res.status(200).json(budgets);
    }
    catch (error) {
        logger_1.default.error(`Error fetching budgets for user ID: ${userId}`, error);
        error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(500, 'Error fetching budgets', 'InternalServerError'), res);
    }
});
exports.getBudgets = getBudgets;
const addBudget = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, category, limit, period } = req.body;
    // Validate required fields
    if (!userId || !category || !limit || !period) {
        return error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(400, 'Missing required fields', 'ValidationError'), res);
    }
    try {
        const budget = new Budget_1.default({ userId, category, limit, period });
        yield budget.save();
        logger_1.default.info(`Budget added for user: ${userId}`);
        res.status(201).json(budget);
    }
    catch (error) {
        logger_1.default.error(`Error adding budget: ${error}`);
        error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(500, 'Error adding budget', 'InternalServerError'), res);
    }
});
exports.addBudget = addBudget;
const updateBudget = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updateData = req.body;
    try {
        const budget = yield Budget_1.default.findByIdAndUpdate(id, updateData, { new: true });
        if (!budget) {
            return error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(404, 'Budget not found', 'NotFoundError'), res);
        }
        logger_1.default.info(`Budget updated: ${id}`);
        res.json(budget);
    }
    catch (error) {
        logger_1.default.error(`Error updating budget: ${error}`);
        error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(500, 'Error updating budget', 'InternalServerError'), res);
    }
});
exports.updateBudget = updateBudget;
const deleteBudget = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const budget = yield Budget_1.default.findByIdAndDelete(id);
        if (!budget) {
            return error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(404, 'Budget not found', 'NotFoundError'), res);
        }
        logger_1.default.info(`Budget deleted: ${id}`);
        res.json({ message: 'Budget deleted successfully' });
    }
    catch (error) {
        logger_1.default.error(`Error deleting budget: ${error}`);
        error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(500, 'Error deleting budget', 'InternalServerError'), res);
    }
});
exports.deleteBudget = deleteBudget;
