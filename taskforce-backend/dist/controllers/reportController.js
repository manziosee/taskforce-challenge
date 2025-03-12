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
exports.exportReport = exports.generateReport = void 0;
const Transaction_1 = __importDefault(require("../models/Transaction"));
const csvExport_1 = require("../utils/csvExport");
const error_handler_1 = require("../utils/http/error-handler");
const logger_1 = __importDefault(require("../utils/logger"));
const generateReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
        return error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(400, 'Missing startDate or endDate', 'ValidationError'), res);
    }
    try {
        const transactions = yield Transaction_1.default.find({
            userId,
            date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        });
        // Group transactions by month for income vs expenses
        const monthlyData = transactions.reduce((acc, transaction) => {
            const date = new Date(transaction.date);
            const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            if (!acc[monthYear]) {
                acc[monthYear] = { income: 0, expenses: 0 };
            }
            if (transaction.type === 'income') {
                acc[monthYear].income += transaction.amount;
            }
            else {
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
            .reduce((acc, transaction) => {
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
    }
    catch (error) {
        logger_1.default.error(`Error generating report: ${error}`);
        error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(500, 'Error generating report', 'InternalServerError'), res);
    }
});
exports.generateReport = generateReport;
const exportReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
        return error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(400, 'Missing startDate or endDate', 'ValidationError'), res);
    }
    try {
        const transactions = yield Transaction_1.default.find({
            userId,
            date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        });
        const csvData = (0, csvExport_1.generateCSV)(transactions);
        res.header('Content-Type', 'text/csv');
        res.attachment('financial_report.csv');
        res.send(csvData);
    }
    catch (error) {
        logger_1.default.error(`Error exporting report: ${error}`);
        error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(500, 'Error exporting report', 'InternalServerError'), res);
    }
});
exports.exportReport = exportReport;
