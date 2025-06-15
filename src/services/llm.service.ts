import axios from 'axios';

/**
 * Analyzes a given React code diff using an LLM (Large Language Model) for potential issues.
 *
 * The analysis covers:
 * 1. Security vulnerabilities
 * 2. Performance issues
 * 3. Missing error handling
 * 4. Code quality problems
 *
 * The function constructs a prompt for the LLM, optionally including a code snippet,
 * and expects a JSON-formatted response detailing any issues found.
 *
 * @param diff - The code diff to analyze.
 * @param codeSnippet - (Optional) A code snippet to include in the analysis for additional context.
 * @returns A promise that resolves to the LLM's response, which should be a JSON object containing
 *          details about any issues found, including severity, file location, line number, description,
 *          recommendation, and optionally the code snippet. If the response cannot be parsed, returns
 *          an error object.
 */
export const analyzeCodeWithLLM = async (diff: string, codeSnippet?: string): Promise<unknown> => {
  const prompt = `
Analyze this React code change for:
1. Security vulnerabilities
2. Performance issues
3. Missing error handling
4. Code quality problems

Code changes:
${diff}

Return JSON format with all the issues found in the PR with severity, file location, line number, description, recommendation and ${codeSnippet ? 'code snippet' : ''}.
  `;
  try {
    const response = await queryLLaMA3(prompt);
    return response;
  } catch (e) {
    console.error('Failed to parse LLM response:', e);
    return { error: 'LLM response not parsable' };
  }
};

/**
 * Method to call the GROQ LLaMA 3 API for code analysis.
 * @param userPrompt The prompt to send to the LLM for analysis.
 * @returns the content of the LLM's response.
 */
export const queryLLaMA3 = async (userPrompt: string) => {
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [{ role: 'user', content: userPrompt }],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY as string}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0].message.content || 'No feedback generated.';
};
