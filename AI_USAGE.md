#### LLM (GROQ) Integration Documentation

This document describes how GROQ's Large Language Model (LLM) is integrated into the PR Analyzer application to analyze pull request diffs and generate meaningful insights.

### Overview
The LLM (via GROQ API) is used to:

Analyze code diffs from GitHub Pull Requests.

Detect potential security issues, performance problems, and code smells.

Generate summaries and actionable feedback for developers.

### GROQ API Integration

## Package Used

We use the official GROQ-compatible OpenAI api to communicate with the LLM.

# Note: Ensure your .env includes a valid API key:

OPENAI_API_KEY=<your-groq-api-key>

## Implementation
# File: services/llmService.ts

const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'meta-llama/llama-4-scout-17b-16e-instruct', # Model name
      messages: [{ role: 'user', content: userPrompt }],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY as string}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0].message.content;

You are an expert code reviewer. Analyze the following GitHub Pull Request diff for:

# Security vulnerabilities
# Performance issues
# Code quality problems

Respond with a clear summary and recommendations.

  return response.choices[0]?.message?.content || 'No feedback generated.';

### Usage Flow

GitHub PR is received through the API.

The code diff is extracted using GitHub API.

analyzeDiffWithLLM(diff) is called.

The LLM analyzes the diff and returns feedback.

The result is saved to MongoDB and returned to the user.

## Rate Limits & Best Practices
Token Efficiency: Use minimal and relevant diffs. Avoid sending large unchanged files.

Temperature: Set to 0.2 for deterministic results.
