import { commentOnPR, getPRDiff } from './github.service.ts';
import { analyzeCodeWithLLM } from './llm.service.ts';
import { AnalysisModel } from '../models/analysis.model.ts';
import { Issue } from '../schemas/analysis.ts';
import { Octokit } from '@octokit/rest';
import { getDiffPosition, normalizeIssues } from '../utils/analysis.util.ts';

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
  token: string | undefined,
  codeSnippet?: string
) => {
  type ErrorModel = { error: string };
  // get the difference of the PR
  const diff = await getPRDiff(owner, repo, prNumber, token);
  // getting the response after analyzing the code with LLM
  const analysis = (await analyzeCodeWithLLM(diff, codeSnippet)) as string;

  if (!analysis) {
    console.error('No analysis response received from LLM');
    throw new Error('No analysis response received from LLM');
  }
  if (typeof analysis === 'object' && (analysis as ErrorModel).error) {
    console.error('Error analyzing PR:', (analysis as ErrorModel).error);
    throw new Error((analysis as ErrorModel).error);
  }
  // getting the issues from the analysis response of JSON format
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = analysis.match(jsonRegex);

  if (match) {
    const parsedData = JSON.parse(match[1]);
    console.log('json parsed data', parsedData);
    // creating the result object to save in the database
    const result = {
      analysisId: crypto.randomUUID(),
      prNumber,
      repository: `${owner}/${repo}`,
      issues: parsedData,
    };
    // saving the pr changes analysis to the database
    await AnalysisModel.create(result);

    const commentPromiseArray: Promise<void>[] = [];
    // commenting on the PR with the analysis result
    const octokit = new Octokit({ auth: token });

    const { data: files } = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
    });

    (normalizeIssues(parsedData as object | object[]) as Issue[]).forEach((issue: Issue) => {
      const file = files.find(
        (f) =>
          f.filename === issue.file ||
          f.filename === issue.fileLocation ||
          f.filename === issue.location
      );
      console.log('file and issue data', file, issue);
      if (file?.patch) {
        const position = getDiffPosition(file?.patch, issue.line || issue.lineNumber || 1);
        console.log('comment position', position);
        commentPromiseArray.push(
          commentOnPR(owner, repo, prNumber, issue, token as string, position as number)
        );
      }
    });

    // calling all the promises to comment on the PR
    await Promise.allSettled(commentPromiseArray);
    return result;
  } else {
    console.error('Analysis response is not in JSON format:', analysis);
    throw new Error('LLM response not parsable');
  }
};
