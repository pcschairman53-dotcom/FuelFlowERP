/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  code?: number;
}

/**
 * Standard global error handling middleware for FuelFlow ERP
 */
export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let error = { ...err };
  error.message = err.message;

  console.error(`🔴 API Error: [${req.method}] ${req.url} - `, err);

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0] || 'field';
    res.status(400).json({
      success: false,
      message: `Duplicate resource error: Proposed value for ${field} already exists in records.`
    });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values((err as any).errors || {}).map((val: any) => val.message);
    res.status(400).json({
      success: false,
      message: 'Resource validation failed',
      errors: messages
    });
    return;
  }

  // Mongoose CastError (invalid ObjectId, e.g.)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid resource parameters format'
    });
    return;
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server encountered an unexpected operational exception'
  });
}
