// external dependencies
import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('body', req.body);
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      res.status(400).json({ error: error.details.map((d) => d.message).join(', ') });
      return;
    }
    next();
  };
};
