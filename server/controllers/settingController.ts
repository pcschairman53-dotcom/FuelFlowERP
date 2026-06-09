/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';
import { COMPANY_DETAILS } from '../../src/data';

/**
 * Fetch ERP global parameter configuration settings
 */
export async function getSettings(req: Request, res: Response): Promise<void> {
  try {
    let settings = await dbStore.findOne('Setting', { id: 'global_settings' });
    if (!settings) {
      // Fallback or seed default COMPANY_DETAILS if not exist in active collection
      settings = {
        name: COMPANY_DETAILS.name,
        dealershipCode: COMPANY_DETAILS.dealershipCode,
        address: COMPANY_DETAILS.address,
        vatTin: COMPANY_DETAILS.vatTin,
        tagline: COMPANY_DETAILS.tagline
      };
    }
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(550).json({
      success: false,
      message: 'Failed to find core ERP dealership parameters',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Save / Update core SaaS ERP global settings (upsert style)
 */
export async function saveSettings(req: Request, res: Response): Promise<void> {
  try {
    const { name, dealershipCode, address, vatTin, tagline } = req.body;

    if (!name || !dealershipCode || !address || !vatTin || !tagline) {
      res.status(400).json({ success: false, message: 'All outlet configuration parameters are required.' });
      return;
    }

    let existing = await dbStore.findOne('Setting', { id: 'global_settings' });

    if (existing) {
      await dbStore.findOneAndUpdate(
        'Setting',
        { id: 'global_settings' },
        { name, dealershipCode, address, vatTin, tagline }
      );
    } else {
      await dbStore.create('Setting', {
        id: 'global_settings',
        name,
        dealershipCode,
        address,
        vatTin,
        tagline
      });
    }

    // Load newly saved settings
    const updatedSettings = await dbStore.findOne('Setting', { id: 'global_settings' });

    res.status(200).json({
      success: true,
      message: 'Settings saved successfully',
      settings: updatedSettings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to persist core ERP settings inside Atlas database collection.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
