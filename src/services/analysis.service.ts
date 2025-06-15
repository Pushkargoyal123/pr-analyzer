import { getPRDiff } from './github.service.ts';
import { analyzeCodeWithLLM } from './llm.service.ts';
import { AnalysisModel } from '../models/analysis.model.ts';

/**
 * Analyzes a pull request by fetching its diff, running code analysis using an LLM,
 * extracting issues from the analysis response, and saving the result to the database.
 *
 * @param owner - The owner of the repository.
 * @param repo - The name of the repository.
 * @param prNumber - The pull request number to analyze.
 * @param token - The authentication token for accessing the repository.
 * @param codeSnippet - Optional code snippet to include in the analysis response.
 * @returns An object containing the analysis result, including a unique analysis ID, PR number,
 *          repository identifier, and detected issues. Returns an error object if the analysis
 *          response is not in JSON format.
 */
export const analyzePullRequest = async (
  owner: string,
  repo: string,
  prNumber: number,
  token: string,
  codeSnippet?: string
) => {
  // get the difference of the PR
  const diff = await getPRDiff(owner, repo, prNumber, token);
  // getting the response after analyzing the code with LLM
  const analysis = (await analyzeCodeWithLLM(diff, codeSnippet)) as string;
  if (!analysis) {
    console.error('No analysis response received from LLM');
    throw new Error('No analysis response received from LLM');
  }
  if (typeof analysis === 'object' && (analysis as { error: string }).error) {
    console.error('Error analyzing PR:', (analysis as { error: string }).error);
    throw new Error((analysis as { error: string }).error);
  }
  // getting the issues from the analysis response of JSON format
  const jsonStart = analysis.indexOf('[');
  const jsonEnd = analysis.lastIndexOf(']') + 1;

  if (jsonStart && jsonEnd) {
    const jsonData = analysis.slice(jsonStart, jsonEnd);
    const result = {
      analysisId: crypto.randomUUID(),
      prNumber,
      repository: `${owner}/${repo}`,
      issues: JSON.parse(jsonData),
    };
    // saving the pr changes analysis to the database
    await AnalysisModel.create(result);

    return result;
  } else {
    console.error('Analysis response is not in JSON format:', analysis);
    throw new Error('LLM response not parsable');
  }
};
