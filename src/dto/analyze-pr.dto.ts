import Joi from 'joi';

export const AnalyzePRDto = Joi.object({
  owner: Joi.string().required(),
  repo: Joi.string().required(),
  prNumber: Joi.number().required(),
}).required();
// This DTO schema validates the request body for analyzing a pull request.
