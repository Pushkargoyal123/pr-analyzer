import { Octokit } from '@octokit/rest';

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
  token: string
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
