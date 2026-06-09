/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';

/**
 * Get current tank stocks and physical dip statuses
 */
export async function getTankStocks(req: Request, res: Response): Promise<void> {
  try {
    const stocks = await dbStore.find('TankStock', {}, { tankName: 1 });
    res.status(200).json({ success: true, count: stocks.length, data: stocks });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve physical tank stock records',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get distinct storage tank parameters by ID
 */
export async function getTankStockById(req: Request, res: Response): Promise<void> {
  try {
    const tank = await dbStore.findOne('TankStock', { id: req.params.id });
    if (!tank) {
      res.status(404).json({ success: false, message: `Storage Tank ${req.params.id} not found` });
      return;
    }
    res.status(200).json({ success: true, data: tank });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve storage tank stock parameters',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Create a new physical storage tank partition parameter
 */
export async function createTankStock(req: Request, res: Response): Promise<void> {
  try {
    const {
      tankName,
      fuelType,
      capacityLiters,
      currentLevelLiters,
      dipReadingMm,
      waterLevelMm,
      status
    } = req.body;

    const percentage = (currentLevelLiters / capacityLiters) * 100;
    let computedStatus = status || 'Normal';
    if (!status) {
      if (percentage <= 15) {
        computedStatus = 'Critical';
      } else if (percentage <= 35) {
        computedStatus = 'Low Stock';
      }
    }

    const newTank = await dbStore.create('TankStock', {
      tankName,
      fuelType,
      capacityLiters,
      currentLevelLiters,
      dipReadingMm,
      waterLevelMm: waterLevelMm || 0,
      lastUpdatedDip: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: computedStatus
    });

    res.status(201).json({ success: true, data: newTank });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to register storage tank parameters',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Perform manual daily tank dipping log and update volume level (calibration lookup values)
 */
export async function updateTankStock(req: Request, res: Response): Promise<void> {
  try {
    const { currentLevelLiters, dipReadingMm, waterLevelMm, status } = req.body;
    const existing = await dbStore.findOne('TankStock', { id: req.params.id });

    if (!existing) {
      res.status(404).json({ success: false, message: `Storage Tank ${req.params.id} not found` });
      return;
    }

    const payload = {
      ...req.body,
      lastUpdatedDip: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    const targetLevelLiters = currentLevelLiters !== undefined ? currentLevelLiters : existing.currentLevelLiters;
    const percentage = (targetLevelLiters / existing.capacityLiters) * 100;

    if (!status) {
      if (percentage <= 15) {
        payload.status = 'Critical';
      } else if (percentage <= 35) {
        payload.status = 'Low Stock';
      } else {
        payload.status = 'Normal';
      }
    }

    const updated = await dbStore.findOneAndUpdate(
      'TankStock',
      { id: req.params.id },
      { $set: payload }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record manual dip levels',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Deletes tank parameters from index records
 */
export async function deleteTankStock(req: Request, res: Response): Promise<void> {
  try {
    const deleted = await dbStore.findOneAndDelete('TankStock', { id: req.params.id });
    if (!deleted) {
      res.status(404).json({ success: false, message: `Storage Tank ${req.params.id} not found` });
      return;
    }
    res.status(200).json({ success: true, message: `Storage tank ${req.params.id} successfully removed` });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove storage tank parameters',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

