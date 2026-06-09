/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Standard server-centric request logging middleware for tracer logs
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on('finish', () => {
    const elapsed = Date.now() - start;
    console.log(`[ERP-API] ${req.method} ${req.originalUrl} ${res.statusCode} - ${elapsed}ms`);
  });
  next();
}
