/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import {
  getCollectionEntries,
  createCollectionEntry,
  updateCollectionEntry,
  deleteCollectionEntry
} from '../controllers/collectionEntryController';

const router = Router();

router.route('/')
  .get(getCollectionEntries)
  .post(createCollectionEntry);

router.route('/:id')
  .put(updateCollectionEntry)
  .delete(deleteCollectionEntry);

export default router;
