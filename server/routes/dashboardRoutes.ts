/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { getDashboardMetrics, getDashboardSummaryMock } from '../controllers/dashboardController';

const router = Router();

router.route('/')
  .get(getDashboardMetrics);

router.route('/summary')
  .get(getDashboardSummaryMock);

export default router;
