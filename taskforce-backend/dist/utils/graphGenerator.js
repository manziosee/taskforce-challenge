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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReportGraphs = exports.generateGraphImage = void 0;
const chart_js_1 = require("chart.js");
const canvas_1 = require("canvas");
// Register Chart.js components
chart_js_1.Chart.register(...chart_js_1.registerables);
const generateGraphImage = (config_1, ...args_1) => __awaiter(void 0, [config_1, ...args_1], void 0, function* (config, width = 800, height = 400) {
    // Create a canvas
    const canvas = (0, canvas_1.createCanvas)(width, height);
    const ctx = canvas.getContext('2d');
    // Create the chart
    new chart_js_1.Chart(ctx, config);
    // Return the image buffer
    return canvas.toBuffer('image/png');
});
exports.generateGraphImage = generateGraphImage;
const generateReportGraphs = (reportData) => __awaiter(void 0, void 0, void 0, function* () {
    // Income vs Expenses graph
    const incomeVsExpensesConfig = {
        type: 'bar',
        data: reportData.incomeVsExpenses,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Income vs Expenses'
                }
            }
        }
    };
    // Expense Categories graph
    const expenseCategoriesConfig = {
        type: 'pie',
        data: reportData.expenseCategories,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Expense Categories'
                }
            }
        }
    };
    // Net Income Trend graph
    const netIncomeTrendConfig = {
        type: 'line',
        data: reportData.netIncomeTrend,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Net Income Trend'
                }
            }
        }
    };
    const [incomeVsExpenses, expenseCategories, netIncomeTrend] = yield Promise.all([
        (0, exports.generateGraphImage)(incomeVsExpensesConfig),
        (0, exports.generateGraphImage)(expenseCategoriesConfig),
        (0, exports.generateGraphImage)(netIncomeTrendConfig)
    ]);
    return { incomeVsExpenses, expenseCategories, netIncomeTrend };
});
exports.generateReportGraphs = generateReportGraphs;
