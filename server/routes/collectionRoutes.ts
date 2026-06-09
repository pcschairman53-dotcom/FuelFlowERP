/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import {
  getCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection
} from '../controllers/collectionController';

const router = Router();

router.route('/')
  .get(getCollections)
  .post(createCollection);

router.route('/:id')
  .get(getCollectionById)
  .put(updateCollection)
  .delete(deleteCollection);

export default router;
