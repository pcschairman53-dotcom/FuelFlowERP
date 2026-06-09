/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { getSettings, saveSettings } from '../controllers/settingController';

const router = Router();

router.get('/', getSettings);
router.post('/', saveSettings);

export default router;
