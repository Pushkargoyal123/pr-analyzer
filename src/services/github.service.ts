import { Octokit } from '@octokit/rest';
import { Issue } from '../schemas/analysis';

/**
 * Retrieves the diff (patch) for all TypeScript (.ts) and JavaScript (.js) files
 * in a specific pull request from a GitHub repository.
 *
 * @param owner - The owner of the GitHub repository.
 * @param repo - The name of the GitHub repository.
 * @param prNumber - The pull request number to fetch diffs from.
 * @param token - The GitHub personal access token for authentication.
 * @returns A promise that resolves to a string containing the diffs of all .ts and .js files in the pull request.
 *
 * @throws Will throw an error if the GitHub API request fails.
 */
export const getPRDiff = async (
  owner: string,
  repo: string,
  prNumber: number,
  token: string | undefined
): Promise<string> => {
  const octokit = new Octokit({ auth: token });

  const { data: files } = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber,
  });

  const diffs: string[] = [];
  // Iterate over each file in the pull request
  for (const file of files) {
    // Check if the file is a TypeScript or JavaScript file
    if (file.filename.endsWith('.ts') || file.filename.endsWith('.js')) {
      const patch = file.patch;
      // Only add the diff if a patch is available (i.e., the file was changed)
      if (patch) {
        // Push the filename and its diff to the diffs array
        diffs.push(`File: ${file.filename}\n${patch}`);
      }
    }
  }
  return diffs.join('\n\n');
};

/**
 * Posts a review comment on a specific line of a pull request using the GitHub API.
 *
 * @param owner - The owner of the repository.
 * @param repo - The name of the repository.
 * @param pull_number - The number of the pull request.
 * @param issueObject - An object containing details about the issue, including the recommendation, file path, and line number.
 * @param token - The GitHub personal access token for authentication.
 *
 * @remarks
 * This function retrieves the pull request details to obtain the latest commit SHA,
 * then posts a review comment on the specified file and line in the pull request diff.
 *
 * @throws Will throw an error if the GitHub API request fails.
 */
export const commentOnPR = async (
  owner: string,
  repo: string,
  pull_number: number,
  issueObject: Issue,
  token: string,
  position: number
) => {
  const octokit = new Octokit({ auth: token });
  // Get the pull request details to find the commit ID
  const { data: pr } = await octokit.pulls.get({
    owner,
    repo,
    pull_number: pull_number,
  });

  const commitId = pr.head.sha;

  octokit.pulls
    .createReviewComment({
      owner,
      repo,
      pull_number,
      body: issueObject.recommendation,
      commit_id: commitId, // SHA of the commit in the PR
      path: issueObject.file || issueObject.fileLocation || issueObject.location, // relative file path
      position,
    })
    .then(() => {
      console.log('Comment posted on PR', issueObject.recommendation);
    })
    .catch((err) => {
      console.error('Error posting comment on PR:', err);
    });
};
