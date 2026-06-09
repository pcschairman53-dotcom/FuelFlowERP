/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import {
  getTankStocks,
  getTankStockById,
  createTankStock,
  updateTankStock,
  deleteTankStock
} from '../controllers/tankStockController';

const router = Router();

router.route('/')
  .get(getTankStocks)
  .post(createTankStock);

router.route('/:id')
  .get(getTankStockById)
  .put(updateTankStock)
  .delete(deleteTankStock);

export default router;
