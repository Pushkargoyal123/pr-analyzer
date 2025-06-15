import { Issue } from '../schemas/analysis';

/**
 * Converts a line number in the new file to a diff position index.
 * @param patch The patch string from GitHub API.
 * @param targetLine The line number in the new file (1-based).
 * @returns The diff position index or null if not found.
 */
export function getDiffPosition(patch: string, targetLine: number): number | null {
  const lines = patch.split('\n');
  let position = 0;
  let newLine = 0;

  for (const line of lines) {
    position++;

    if (line.startsWith('@@')) {
      // Parse hunk header like: @@ -1,5 +10,6 @@
      const match = /@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
      if (match) {
        newLine = parseInt(match[1], 10) - 1; // Adjust for next line
      }
      continue;
    }

    if (!line.startsWith('-')) {
      newLine++;
    }

    // If this line is an added line and matches targetLine
    if (!line.startsWith('-') && !line.startsWith('@@') && newLine === targetLine) {
      return position;
    }
  }

  return null;
}

/**
 * Normalizes issue data into a flat array of issues, each optionally annotated with a category.
 *
 * @param data - The input data, which can be either an array of issue objects or an object whose keys are categories and values are arrays or single issue objects.
 * @returns An array of normalized issue objects. If the input is an array, it is returned as-is. If the input is an object, each issue is annotated with its category.
 */
export function normalizeIssues(data: object | object[]): Issue[] | object[] {
  if (Array.isArray(data)) {
    // Already an array of issues
    return data;
  }

  if (typeof data === 'object' && data !== null) {
    // Convert object of categories into array and inject the category
    return Object.entries(data).flatMap(([category, issues]) => {
      if (Array.isArray(issues)) {
        return issues.map((issue) => ({
          category,
          ...issue,
        }));
      }
      return [{ category, ...issues }];
    });
  }

  return [];
}
