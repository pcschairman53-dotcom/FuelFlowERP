/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import {
  getTankers,
  getTankerById,
  createTanker,
  updateTanker,
  deleteTanker
} from '../controllers/tankerController';

const router = Router();

router.route('/')
  .get(getTankers)
  .post(createTanker);

router.route('/:id')
  .get(getTankerById)
  .put(updateTanker)
  .delete(deleteTanker);

export default router;
