/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import {
  compileReport,
  logExport,
  getReportLogs
} from '../controllers/reportController';

const router = Router();

router.post('/compile', compileReport);
router.post('/log-export', logExport);
router.get('/logs', getReportLogs);

export default router;
