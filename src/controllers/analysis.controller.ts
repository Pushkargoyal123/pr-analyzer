// external dependencies
import { Request, Response } from 'express';

// internal dependencies
import { analyzePullRequest } from '../services/analysis.service.ts';
import { internalServerError } from '../utils/index.util.ts';
import { AnalysisModel } from '../models/analysis.model.ts';
import { Analysis } from '../schemas/analysis.ts';

/**
 * Handles the analysis of a pull request by extracting the necessary parameters from the request,
 * validating the authorization token, and invoking the analysis logic.
 *
 * @param req - Express request object containing the PR analysis parameters in the body and the authorization token in the headers.
 * @param res - Express response object used to send the analysis result or error response.
 *
 * @remarks
 * - Expects `owner`, `repo`, and `prNumber` in the request body.
 * - Requires a Bearer token in the `Authorization` header.
 * - Returns a 401 error if the token is missing.
 * - Returns a 400 error if the PR has already been analyzed for the repository (duplicate key error).
 * - Returns a 200 response with the analysis result on success.
 * - Handles unexpected errors with a generic internal server error response.
 */
export const analyzePRController = async (req: Request, res: Response) => {
  // Extract required parameters from request body
  const { owner, repo, prNumber } = req.body as Analysis;
  try {
    const codeSnippet = req.query.codeSnippet as string;
    // Extract Bearer token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];

    // If token is missing, return 401 error
    if (!token) {
      res.status(401).json({ error: 'Authorization token is required' });
    } else {
      const result = await analyzePullRequest(owner, repo, prNumber, token, codeSnippet);
      res.status(200).json({ data: result });
    }
  } catch (error) {
    console.error('Error in analyzePRController:', error);

    type ErrorModel = { status?: number; code?: number; message?: string };

    if ((error as ErrorModel).status === 404) {
      res.status(404).json({ message: `Pull Request #${prNumber} not found in ${owner}/${repo}` });
    }
    // Optional: handle 403 (permission), 401 (unauthorized), etc.
    else if ((error as ErrorModel).status === 403) {
      res.status(403).json({ message: `Access denied to PR #${prNumber}` });
    }
    // Handle duplicate key error (PR already analyzed)
    else if ((error as ErrorModel).code === 11000) {
      res.status(400).json({ message: 'PR already analyzed for this repository.' });
    } else {
      internalServerError(res, error);
    }
  }
};

/**
 * Handles the retrieval and deletion of all analysis records.
 *
 * This controller fetches all documents from the `AnalysisModel` collection,
 * deletes all records from the collection, and returns the fetched data in the response.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 * @returns A JSON response containing the retrieved analysis data.
 * @throws Responds with a 500 status code and error details if an exception occurs.
 */
export const getPrController = async (req: Request, res: Response) => {
  try {
    const data = await AnalysisModel.find();
    // await AnalysisModel.deleteMany();
    res.status(200).json({ data });
  } catch (error) {
    console.error('Error in getPrController:', error);
    internalServerError(res, error);
  }
};
