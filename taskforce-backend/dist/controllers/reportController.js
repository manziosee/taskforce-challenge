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
const graphGenerator_1 = require("../utils/graphGenerator");
const error_handler_1 = require("../utils/http/error-handler");
const logger_1 = __importDefault(require("../utils/logger"));
const jszip_1 = __importDefault(require("jszip"));
const stream_1 = require("stream");
const generateReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
        return error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(400, 'Missing startDate or endDate', 'ValidationError'), res);
    }
    try {
        // Get the report data
        const transactions = yield Transaction_1.default.find({
            userId,
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
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
            }
            else {
                acc[monthYear].expenses += transaction.amount;
            }
            return acc;
        }, {});
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
                labels: Object.keys(transactions
                    .filter(t => t.type === 'expense')
                    .reduce((acc, transaction) => {
                    const category = transaction.category || 'Uncategorized';
                    acc[category] = (acc[category] || 0) + transaction.amount;
                    return acc;
                }, {})),
                datasets: [{
                        data: Object.values(transactions
                            .filter(t => t.type === 'expense')
                            .reduce((acc, transaction) => {
                            const category = transaction.category || 'Uncategorized';
                            acc[category] = (acc[category] || 0) + transaction.amount;
                            return acc;
                        }, {})),
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
        // Get the report data (reuse the generateReport logic)
        const transactions = yield Transaction_1.default.find({
            userId,
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
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
            }
            else {
                acc[monthYear].expenses += transaction.amount;
            }
            return acc;
        }, {});
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
                labels: Object.keys(transactions
                    .filter(t => t.type === 'expense')
                    .reduce((acc, transaction) => {
                    const category = transaction.category || 'Uncategorized';
                    acc[category] = (acc[category] || 0) + transaction.amount;
                    return acc;
                }, {})),
                datasets: [{
                        data: Object.values(transactions
                            .filter(t => t.type === 'expense')
                            .reduce((acc, transaction) => {
                            const category = transaction.category || 'Uncategorized';
                            acc[category] = (acc[category] || 0) + transaction.amount;
                            return acc;
                        }, {})),
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
        const csvData = (0, csvExport_1.generateCSV)(transactions);
        // Generate graph images
        const { incomeVsExpenses, expenseCategories, netIncomeTrend } = yield (0, graphGenerator_1.generateReportGraphs)(reportData);
        // Create ZIP file
        const zip = new jszip_1.default();
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
        const zipContent = yield zip.generateAsync({ type: 'nodebuffer' });
        // Set response headers
        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': 'attachment; filename="financial_report.zip"',
            'Content-Length': zipContent.length
        });
        // Send the ZIP file
        const stream = stream_1.Readable.from(zipContent);
        stream.pipe(res);
    }
    catch (error) {
        logger_1.default.error(`Error exporting report: ${error}`);
        error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(500, 'Error exporting report', 'InternalServerError'), res);
    }
});
exports.exportReport = exportReport;
