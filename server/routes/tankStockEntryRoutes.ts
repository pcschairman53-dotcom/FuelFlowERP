/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import {
  getTankStockEntries,
  getTankStockEntryById,
  createTankStockEntry,
  updateTankStockEntry,
  deleteTankStockEntry
} from '../controllers/tankStockEntryController';

const router = Router();

router.route('/')
  .get(getTankStockEntries)
  .post(createTankStockEntry);

router.route('/:id')
  .get(getTankStockEntryById)
  .put(updateTankStockEntry)
  .delete(deleteTankStockEntry);

export default router;
