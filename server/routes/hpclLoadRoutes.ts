/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import {
  getHpclLoads,
  getHpclLoadById,
  createHpclLoad,
  updateHpclLoad,
  deleteHpclLoad
} from '../controllers/hpclLoadController';

const router = Router();

router.route('/')
  .get(getHpclLoads)
  .post(createHpclLoad);

router.route('/:id')
  .get(getHpclLoadById)
  .put(updateHpclLoad)
  .delete(deleteHpclLoad);

export default router;
