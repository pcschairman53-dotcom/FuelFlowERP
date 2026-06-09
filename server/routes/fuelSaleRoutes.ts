/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import {
  getFuelSales,
  getFuelSaleById,
  createFuelSale,
  updateFuelSale,
  deleteFuelSale
} from '../controllers/fuelSaleController';

const router = Router();

router.route('/')
  .get(getFuelSales)
  .post(createFuelSale);

router.route('/:id')
  .get(getFuelSaleById)
  .put(updateFuelSale)
  .delete(deleteFuelSale);

export default router;
