import { analyzePullRequest } from '../src/services/analysis.service';
import * as githubService from '../src/services/github.service';
import * as llmService from '../src/services/llm.service';
import { AnalysisModel } from '../src/models/analysis.model';

jest.mock('../src/services/github.service');
jest.mock('../src/services/llm.service');
jest.mock('../src/models/analysis.model');

describe('analyzePullRequest', () => {
  const owner = 'test-owner';
  const repo = 'test-repo';
  const prNumber = 123;
  const token = 'test-token';

  const fakeDiff = 'diff --git a/index.js b/index.js';
  const fakeAnalysis = {
    summary: {
      totalIssues: 1,
      criticalIssues: 1,
      issueTypes: ['security'],
    },
    issues: [
      {
        severity: 'critical',
        category: 'security',
        file: 'index.js',
        line: 10,
        title: 'Hardcoded Secret',
        description: 'Secret is hardcoded',
        recommendation: 'Use environment variables',
        codeSnippet: "const secret = '123';",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (githubService.fetchPullRequestDiff as jest.Mock).mockResolvedValue(fakeDiff);
    (llmService.analyzeDiffWithLLM as jest.Mock).mockResolvedValue(fakeAnalysis);
    (AnalysisModel.create as jest.Mock).mockImplementation((doc) => Promise.resolve(doc));
  });

  it('should analyze PR and store result in MongoDB', async () => {
    const result = await analyzePullRequest(owner, repo, prNumber, token);

    expect(githubService.fetchPullRequestDiff).toHaveBeenCalledWith(owner, repo, prNumber, token);
    expect(llmService.analyzeDiffWithLLM).toHaveBeenCalledWith(fakeDiff);
    expect(result.repository).toBe(`${owner}/${repo}`);
    expect(result.summary.totalIssues).toBe(1);
    expect(result.issues[0].category).toBe('security');
  });
});
