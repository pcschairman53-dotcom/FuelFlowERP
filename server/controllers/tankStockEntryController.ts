/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';

/**
 * Get daily/shift tank stock entries matching optional filters: date, shift, tankNumber
 */
export async function getTankStockEntries(req: Request, res: Response): Promise<void> {
  try {
    const { date, shift, tankNumber } = req.query;
    const filterQuery: any = {};

    if (date) filterQuery.date = date;
    if (shift) filterQuery.shift = shift;
    if (tankNumber) filterQuery.tankNumber = tankNumber;

    const entries = await dbStore.find('TankStockEntry', filterQuery, { date: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: entries.length, data: entries });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tank stock entries',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get a single tank stock entry by ID
 */
export async function getTankStockEntryById(req: Request, res: Response): Promise<void> {
  try {
    const entry = await dbStore.findOne('TankStockEntry', { id: req.params.id });
    if (!entry) {
      res.status(404).json({ success: false, message: `Tank stock entry ${req.params.id} not found` });
      return;
    }
    res.status(200).json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tank stock entry',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Create a new tank stock entry (calculates closingStock automatically)
 */
export async function createTankStockEntry(req: Request, res: Response): Promise<void> {
  try {
    const {
      date,
      shift,
      tankNumber,
      fuelType,
      openingStock,
      receivedQuantity,
      salesQuantity,
      dipReading,
      waterLevel,
      remarks
    } = req.body;

    // Validation
    if (!date || !shift || !tankNumber || !fuelType || openingStock === undefined || dipReading === undefined) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields for creating Tank Stock entry (date, shift, tankNumber, fuelType, openingStock, dipReading)'
      });
      return;
    }

    // Auto Closing Stock Calculation: openingStock + receivedQuantity - salesQuantity
    const oStock = Number(openingStock) || 0;
    const rQty = Number(receivedQuantity) || 0;
    const sQty = Number(salesQuantity) || 0;
    const calculatedClosingStock = parseFloat((oStock + rQty - sQty).toFixed(2));

    const newEntry = await dbStore.create('TankStockEntry', {
      date,
      shift,
      tankNumber,
      fuelType,
      openingStock: oStock,
      receivedQuantity: rQty,
      salesQuantity: sQty,
      closingStock: calculatedClosingStock,
      dipReading: Number(dipReading) || 0,
      waterLevel: Number(waterLevel) || 0,
      remarks: remarks || ''
    });

    res.status(201).json({ success: true, data: newEntry });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create tank stock entry',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Update physical daily/shift tank stock entry
 */
export async function updateTankStockEntry(req: Request, res: Response): Promise<void> {
  try {
    const existing = await dbStore.findOne('TankStockEntry', { id: req.params.id });

    if (!existing) {
      res.status(404).json({ success: false, message: `Tank stock entry ${req.params.id} not found` });
      return;
    }

    const payload = { ...req.body };

    // Get current fields, allowing updates
    const opening = payload.openingStock !== undefined ? Number(payload.openingStock) : Number(existing.openingStock);
    const received = payload.receivedQuantity !== undefined ? Number(payload.receivedQuantity) : Number(existing.receivedQuantity);
    const sales = payload.salesQuantity !== undefined ? Number(payload.salesQuantity) : Number(existing.salesQuantity);

    // Recalculate auto closing stock
    payload.closingStock = parseFloat((opening + received - sales).toFixed(2));

    const updated = await dbStore.findOneAndUpdate(
      'TankStockEntry',
      { id: req.params.id },
      { $set: payload }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update tank stock entry',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Delete a tank stock entry
 */
export async function deleteTankStockEntry(req: Request, res: Response): Promise<void> {
  try {
    const deleted = await dbStore.findOneAndDelete('TankStockEntry', { id: req.params.id });
    if (!deleted) {
      res.status(404).json({ success: false, message: `Tank stock entry ${req.params.id} not found` });
      return;
    }
    res.status(200).json({ success: true, message: `Tank stock entry ${req.params.id} successfully deleted` });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete tank stock entry',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
