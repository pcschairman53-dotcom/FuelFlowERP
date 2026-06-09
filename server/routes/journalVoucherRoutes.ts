/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import {
  getJournalVouchers,
  getJournalVoucherById,
  createJournalVoucher,
  updateJournalVoucher,
  deleteJournalVoucher
} from '../controllers/journalVoucherController';

const router = Router();

router.route('/')
  .get(getJournalVouchers)
  .post(createJournalVoucher);

router.route('/:id')
  .get(getJournalVoucherById)
  .put(updateJournalVoucher)
  .delete(deleteJournalVoucher);

export default router;
