// external dependencies
import { Response } from 'express';

// internal dependencies
import { INTERNAL_ERROR_MESSAGE } from '../config/constant.ts';

/**
 * Sends a standardized internal server error (HTTP 500) response.
 *
 * @param res - The Express response object used to send the response.
 * @param error - The error to include in the response. Can be an Error object, a string, or any unknown value.
 * @returns The response object with a 500 status and a JSON payload containing the error message.
 *
 * @remarks
 * The error message is determined based on the type of the `error` parameter:
 * - If `error` is a string, it is used directly as the message.
 * - If `error` is an instance of Error, its `message` property is used.
 * - Otherwise, the error is stringified using `JSON.stringify`.
 */
export function internalServerError(res: Response, error: Error | object | unknown) {
  return res.status(500).json({
    error: INTERNAL_ERROR_MESSAGE,
    message:
      typeof error === 'string'
        ? error
        : error instanceof Error
          ? error.message
          : JSON.stringify(error),
  });
}
