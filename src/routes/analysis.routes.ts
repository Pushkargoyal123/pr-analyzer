// external dependencies
import { Router } from 'express';

// internal dependencies
import { analyzePRController, getPrController } from '../controllers/analysis.controller.ts';
import { validateRequest } from '../middleware/validate-request.ts';
import { AnalyzePRDto } from '../dto/analyze-pr.dto.ts';

const router = Router();

/**
 * @swagger
 * /api/analyze-pr:
 *   post:
 *     summary: Analyze a GitHub Pull Request using LLM
 *     tags: [PR Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: codeSnippet
 *         description: Optional code snippet to include in the analysis response
 *         required: false
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - repo
 *               - prNumber
 *               - owner
 *             properties:
 *               repo:
 *                 type: string
 *                 description: Name of the GitHub repository
 *                 example: "ppm-admin-frontend"
 *               prNumber:
 *                 type: integer
 *                 description: Pull request number
 *                 example: 1
 *               owner:
 *                 type: string
 *                 description: Owner of the GitHub repository
 *                 example: "Pushkargoyal123"
 *     responses:
 *       200:
 *         description: Analysis result of the pull request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 issues:
 *                   type: array
 *                   items:
 *                     type: string
 *                 summary:
 *                   type: string
 *       400:
 *         description: Invalid request or missing fields
 *       401:
 *         description: Unauthorized - Missing or invalid GitHub token
 *       500:
 *         description: Internal server error
 */
router.post(
  '/',
  validateRequest(AnalyzePRDto), // Ensure validateRequest returns a middleware function, not a Promise
  analyzePRController
);

/**
 * @swagger
 * /api/analyze-pr:
 *   get:
 *     summary: Get all analyzed PRs from the database
 *     tags: [PR Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters: []
 *     responses:
 *       200:
 *         description: A list of analyzed PRs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   repo:
 *                     type: string
 *                     example: "ppm-admin-frontend"
 *                   prNumber:
 *                     type: integer
 *                     example: 1
 *                   owner:
 *                     type: string
 *                     example: "Pushkargoyal123"
 *                   issues:
 *                     type: array
 *                     items:
 *                       type: string
 *                   summary:
 *                     type: string
 *                     example: "Code is efficient and secure."
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized - Missing or invalid GitHub token
 *       500:
 *         description: Internal server error
 */
router.get('/', getPrController);

export default router;
