// external dependencies
import mongoose from 'mongoose';

// internal dependencies
import { Analysis } from '../schemas/analysis.ts';

const issueObject = {
  type: { type: String, required: false },
  issue: { type: String, required: false },
  severity: { type: String, required: false },
  fileLocation: { type: String, required: false },
  lineNumber: { type: Number, required: false },
  recommendation: { type: String, required: false },
  description: { type: String, required: false },
  title: { type: String, required: false },
};

const analysisSchema = new mongoose.Schema<Analysis>({
  analysisId: { type: String, required: true, unique: true },
  prNumber: { type: Number, required: true },
  repository: { type: String, required: true },
  issues: [issueObject],
  createdAt: { type: Date, default: Date.now },
});

analysisSchema.index({ repository: 1, prNumber: 1 }, { unique: true });

export const AnalysisModel = mongoose.model('Analysis', analysisSchema);
