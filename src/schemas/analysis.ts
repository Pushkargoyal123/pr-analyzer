import { Document } from 'mongoose';

export interface Issue {
  title: string;
  severity: 'low' | 'medium' | 'high';
  category: string;
  file: string;
  line: number;
  recommendation: string;
  codeSnippet: string;
  issue: string;
  description: string;
  location: string;
  fileLocation?: string; // Optional, used for file paths in PR diffs
}

export interface Analysis extends Document {
  analysisId: string;
  prNumber: number;
  repository: string;
  issues: Issue[];
  owner: string;
  repo: string;
  createdAt: Date;
}
