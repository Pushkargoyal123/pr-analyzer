import { jest } from '@jest/globals';

// 🧪 Mock modules *before* importing the dependent file
jest.unstable_mockModule('../services/github.service.js', () => ({
  getPRDiff: jest.fn(),
}));

jest.unstable_mockModule('../services/llm.service.js', () => ({
  analyzeCodeWithLLM: jest.fn(),
}));

jest.unstable_mockModule('../models/analysis.model.js', () => ({
  AnalysisModel: {
    create: jest.fn(),
  },
}));

// ⏬ Use dynamic imports *after* mocks are set
const githubService = await import('../services/github.service.js');
const llmService = await import('../services/llm.service.js');
const { AnalysisModel } = await import('../models/analysis.model.js');
const { analyzePullRequest } = await import('../services/analysis.service.js');

describe('analyzePullRequest', () => {
  const owner = 'test-owner';
  const repo = 'test-repo';
  const prNumber = 123;
  const token = 'test-token';
  const codeSnippet: undefined | string = undefined; // Optional code snippet, can be set if needed
  const fakeDiff = 'diff --git a/index.js b/index.js';
  const fakeAnalysis = JSON.stringify({
    issues: [
      {
        severity: 'medium',
        category: 'security',
        file: 'index.js',
        line: 10,
        title: 'Hardcoded Secret',
        description: 'Secret is hardcoded',
        recommendation: 'Use environment variables',
        codeSnippet: "const secret = '123';",
      },
    ],
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Tell TypeScript this is a mock function
    (githubService.getPRDiff as jest.Mock).mockResolvedValue(fakeDiff as never);
    (llmService.analyzeCodeWithLLM as jest.Mock).mockResolvedValue(fakeAnalysis as never);
    (AnalysisModel.create as jest.Mock).mockImplementation((doc) => Promise.resolve(doc));
  });

  // success scenario
  it('should analyze PR and store result in MongoDB', async () => {
    const result = await analyzePullRequest(owner, repo, prNumber, token);

    expect(githubService.getPRDiff).toHaveBeenCalledWith(owner, repo, prNumber, token);
    expect(llmService.analyzeCodeWithLLM).toHaveBeenCalledWith(fakeDiff, codeSnippet);
    expect(result.repository).toBe(`${owner}/${repo}`);
    expect(result.issues[0].severity).toBe('medium');
    expect(result.issues[0]).toEqual({
      severity: 'medium',
      category: 'security',
      file: 'index.js',
      line: 10,
      title: 'Hardcoded Secret',
      description: 'Secret is hardcoded',
      recommendation: 'Use environment variables',
      codeSnippet: "const secret = '123';",
    });
  });
});
