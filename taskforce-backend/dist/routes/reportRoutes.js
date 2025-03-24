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
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const reportController_1 = require("../controllers/reportController");
const error_handler_1 = require("../utils/http/error-handler");
const router = express_1.default.Router();
router.use(authMiddleware_1.authMiddleware);
/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Financial report generation
 */
/**
 * @swagger
 * /api/reports/{userId}:
 *   get:
 *     summary: Generate a financial report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         required: true
 *         description: Start date in YYYY-MM-DD format
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         description: End date in YYYY-MM-DD format
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: currency
 *         description: Currency code to convert amounts to (optional)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Financial report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 incomeVsExpenses:
 *                   type: object
 *                   properties:
 *                     labels:
 *                       type: array
 *                       items:
 *                         type: string
 *                     datasets:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                           data:
 *                             type: array
 *                             items:
 *                               type: number
 *                           backgroundColor:
 *                             type: string
 *                           borderColor:
 *                             type: string
 *                           borderWidth:
 *                             type: number
 *                 expenseCategories:
 *                   type: object
 *                   properties:
 *                     labels:
 *                       type: array
 *                       items:
 *                         type: string
 *                     datasets:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           data:
 *                             type: array
 *                             items:
 *                               type: number
 *                           backgroundColor:
 *                             type: array
 *                             items:
 *                               type: string
 *                 netIncomeTrend:
 *                   type: object
 *                   properties:
 *                     labels:
 *                       type: array
 *                       items:
 *                         type: string
 *                     datasets:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                           data:
 *                             type: array
 *                             items:
 *                               type: number
 *                           borderColor:
 *                             type: string
 *                           backgroundColor:
 *                             type: string
 *                           fill:
 *                             type: boolean
 *                           tension:
 *                             type: number
 *                 totalIncome:
 *                   type: number
 *                   description: Total income for the period
 *                 totalExpenses:
 *                   type: number
 *                   description: Total expenses for the period
 *                 transactions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Missing startDate or endDate
 *       500:
 *         description: Error generating report
 */
router.get('/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, reportController_1.generateReport)(req, res);
    }
    catch (error) {
        error_handler_1.ErrorHandler.handle(error, res);
    }
}));
/**
 * @swagger
 * /api/reports/{userId}/export:
 *   get:
 *     summary: Export financial report as ZIP (CSV + graphs)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         required: true
 *         description: Start date in YYYY-MM-DD format
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         description: End date in YYYY-MM-DD format
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: ZIP file containing financial report
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             schema:
 *               type: string
 *             description: Attachment with filename financial_report.zip
 *       400:
 *         description: Missing startDate or endDate
 *       500:
 *         description: Error exporting report
 */
router.get('/:userId/export', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, reportController_1.exportReport)(req, res);
    }
    catch (error) {
        error_handler_1.ErrorHandler.handle(error, res);
    }
}));
exports.default = router;
