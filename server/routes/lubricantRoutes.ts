/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import {
  getLubricants,
  getLubricantById,
  createLubricant,
  updateLubricant,
  deleteLubricant
} from '../controllers/lubricantController';

const router = Router();

router.route('/')
  .get(getLubricants)
  .post(createLubricant);

router.route('/:id')
  .get(getLubricantById)
  .put(updateLubricant)
  .delete(deleteLubricant);

export default router;
