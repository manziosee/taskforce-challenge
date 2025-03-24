import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { generateReport, exportReport } from '../controllers/reportController';
import { ErrorHandler } from '../utils/http/error-handler';

const router = express.Router();

router.use(authMiddleware);

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
router.get('/:userId', async (req, res) => {
  try {
    await generateReport(req, res);
  } catch (error) {
    ErrorHandler.handle(error as Error, res);
  }
});

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
router.get('/:userId/export', async (req, res) => {
  try {
    await exportReport(req, res);
  } catch (error) {
    ErrorHandler.handle(error as Error, res);
  }
});

export default router;