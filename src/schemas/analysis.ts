import { Document } from 'mongoose';

export interface Issue {
  issue: string;
  description: string;
  location: string;
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
