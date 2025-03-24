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
exports.getDashboardData = void 0;
const Transaction_1 = __importDefault(require("../models/Transaction"));
const Budget_1 = __importDefault(require("../models/Budget"));
const error_handler_1 = require("../utils/http/error-handler");
const currency_1 = require("../utils/currency");
const logger_1 = __importDefault(require("../utils/logger"));
const getDashboardData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { currency } = req.query;
    try {
        // Get current month's start and end dates
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        // Get transactions for current month
        const transactions = yield Transaction_1.default.find({
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
        const budgets = yield Budget_1.default.find({ userId });
        // Convert currency if requested
        if (currency) {
            income = yield (0, currency_1.convertCurrency)(income, 'RWF', currency);
            expenses = yield (0, currency_1.convertCurrency)(expenses, 'RWF', currency);
        }
        // Get recent transactions
        const recentTransactions = yield Transaction_1.default.find({ userId })
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
    }
    catch (error) {
        logger_1.default.error(`Error fetching dashboard data: ${error}`);
        error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(500, 'Error fetching dashboard data', 'InternalServerError'), res);
    }
});
exports.getDashboardData = getDashboardData;
