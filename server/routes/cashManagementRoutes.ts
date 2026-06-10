/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import {
  getCashMovements,
  createCashMovement,
  updateCashMovement,
  deleteCashMovement
} from '../controllers/cashMovementController';

const router = Router();

router.route('/')
  .get(getCashMovements)
  .post(createCashMovement);

router.route('/:id')
  .put(updateCashMovement)
  .delete(deleteCashMovement);

export default router;
