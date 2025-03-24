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
exports.updateTransaction = exports.getTransactions = exports.deleteTransaction = exports.addTransaction = void 0;
const Transaction_1 = __importDefault(require("../models/Transaction"));
const Category_1 = __importDefault(require("../models/Category"));
const Budget_1 = __importDefault(require("../models/Budget"));
const error_handler_1 = require("../utils/http/error-handler");
const currency_1 = require("../utils/currency");
const logger_1 = __importDefault(require("../utils/logger"));
const addTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, amount, type, category, subcategory, account, date, description } = req.body;
    try {
        // Validate category exists and matches type
        const categoryExists = yield Category_1.default.findOne({
            userId,
            name: category,
            type // Ensure category type matches transaction type
        });
        if (!categoryExists) {
            return res.status(400).json({
                error: 'Category does not exist or type mismatch'
            });
        }
        const transaction = new Transaction_1.default({
            userId,
            amount,
            type,
            category,
            subcategory,
            account,
            date: date || new Date(),
            description
        });
        yield transaction.save();
        // Update budget if it's an expense
        if (type === 'expense') {
            yield updateBudgetSpent(userId, category, amount);
        }
        logger_1.default.info(`Transaction added for user: ${userId}`);
        res.status(201).json(transaction);
    }
    catch (error) {
        logger_1.default.error(`Error adding transaction: ${error}`);
        error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(500, 'Error adding transaction', 'InternalServerError'), res);
    }
});
exports.addTransaction = addTransaction;
// Helper function to update budget spent amount
const updateBudgetSpent = (userId, category, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const budget = yield Budget_1.default.findOne({ userId, category });
    if (budget) {
        budget.spent += amount;
        yield budget.save();
        // Check if budget is exceeded
        if (budget.spent > budget.limit) {
            logger_1.default.warn(`Budget exceeded for ${category}`);
            // You can add notification logic here
        }
    }
});
const deleteTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const transaction = yield Transaction_1.default.findById(id);
        if (!transaction) {
            return error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(404, 'Transaction not found', 'NotFoundError'), res);
        }
        // Reverse budget update if it was an expense
        if (transaction.type === 'expense') {
            yield updateBudgetSpent(transaction.userId, transaction.category, -transaction.amount);
        }
        yield Transaction_1.default.findByIdAndDelete(id);
        logger_1.default.info(`Transaction deleted: ${id}`);
        res.json({ message: 'Transaction deleted successfully' });
    }
    catch (error) {
        logger_1.default.error(`Error deleting transaction: ${error}`);
        error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(500, 'Error deleting transaction', 'InternalServerError'), res);
    }
});
exports.deleteTransaction = deleteTransaction;
const getTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { currency, type, startDate, endDate } = req.query;
    try {
        let query = { userId };
        if (type) {
            query.type = type;
        }
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        let transactions = yield Transaction_1.default.find(query).sort({ date: -1 });
        if (currency) {
            transactions = yield Promise.all(transactions.map((transaction) => __awaiter(void 0, void 0, void 0, function* () {
                const convertedAmount = yield (0, currency_1.convertCurrency)(transaction.amount, 'RWF', currency);
                const transactionObj = transaction.toObject();
                return Object.assign(Object.assign({}, transactionObj), { amount: convertedAmount });
            })));
        }
        res.json(transactions);
    }
    catch (error) {
        logger_1.default.error(`Error fetching transactions: ${error}`);
        error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(500, 'Error fetching transactions', 'InternalServerError'), res);
    }
});
exports.getTransactions = getTransactions;
const updateTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { amount, type, category, subcategory, account, date, description } = req.body;
    try {
        const originalTransaction = yield Transaction_1.default.findById(id);
        if (!originalTransaction) {
            return error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(404, 'Transaction not found', 'NotFoundError'), res);
        }
        // Validate category if changed
        if (category && category !== originalTransaction.category) {
            const categoryExists = yield Category_1.default.findOne({
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
        const updatedTransaction = yield Transaction_1.default.findByIdAndUpdate(id, {
            amount,
            type,
            category,
            subcategory,
            account,
            date,
            description
        }, { new: true });
        // Update budget if it was or is now an expense
        if (originalTransaction.type === 'expense' || type === 'expense') {
            yield updateBudgetSpent(originalTransaction.userId, category || originalTransaction.category, type === 'expense' ? amountDiff : -originalTransaction.amount);
        }
        res.json(updatedTransaction);
    }
    catch (error) {
        logger_1.default.error(`Error updating transaction: ${error}`);
        error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(500, 'Error updating transaction', 'InternalServerError'), res);
    }
});
exports.updateTransaction = updateTransaction;
