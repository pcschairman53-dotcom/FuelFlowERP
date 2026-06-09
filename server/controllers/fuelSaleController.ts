/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';

/**
 * Get fuel sales log (with optional date or nozzle filters)
 */
export async function getFuelSales(req: Request, res: Response): Promise<void> {
  try {
    const { nozzleId, fuelType, date, shift } = req.query;
    const filterQuery: any = {};

    if (nozzleId) filterQuery.nozzleId = nozzleId;
    if (fuelType) filterQuery.fuelType = fuelType;
    if (date) filterQuery.date = date;
    if (shift) filterQuery.shift = shift;

    const sales = await dbStore.find('FuelSale', filterQuery, { date: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: sales.length, data: sales });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve fuel sales logs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get fuel sale by record ID
 */
export async function getFuelSaleById(req: Request, res: Response): Promise<void> {
  try {
    const sale = await dbStore.findOne('FuelSale', { id: req.params.id });
    if (!sale) {
      res.status(404).json({ success: false, message: `Fuel sale record ${req.params.id} not found` });
      return;
    }
    res.status(200).json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve fuel sale record',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Record a new nozzle meter daily totalizer log
 */
export async function createFuelSale(req: Request, res: Response): Promise<void> {
  try {
    const {
      date,
      nozzleId,
      fuelType,
      openingReading,
      closingReading,
      testingQty,
      rate,
      shift,
      operator,
      status
    } = req.body;

    // Calculate salesQty and totalAmt server-side to prevent client discrepancy
    const netSalesQty = parseFloat((closingReading - openingReading - (testingQty || 0)).toFixed(2));
    if (netSalesQty < 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid physical calculations: closing reading must be greater than opening reading + calibration testing qty.'
      });
      return;
    }

    const calculatedTotalAmt = parseFloat((netSalesQty * rate).toFixed(2));

    const newSale = await dbStore.create('FuelSale', {
      date,
      nozzleId,
      fuelType,
      openingReading,
      closingReading,
      testingQty: testingQty || 0,
      salesQty: netSalesQty,
      rate,
      totalAmt: calculatedTotalAmt,
      shift,
      operator,
      status: status || 'Pending Verification'
    });

    res.status(201).json({ success: true, data: newSale });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to log daily fuel sale meter data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Update fuel sale status (Audit Verification or adjustment corrections)
 */
export async function updateFuelSale(req: Request, res: Response): Promise<void> {
  try {
    const { openingReading, closingReading, testingQty, rate } = req.body;
    const existing = await dbStore.findOne('FuelSale', { id: req.params.id });

    if (!existing) {
      res.status(404).json({ success: false, message: `Fuel sale log ${req.params.id} not found` });
      return;
    }

    const oReading = openingReading !== undefined ? openingReading : existing.openingReading;
    const cReading = closingReading !== undefined ? closingReading : existing.closingReading;
    const tQty = testingQty !== undefined ? testingQty : existing.testingQty;
    const activeRate = rate !== undefined ? rate : existing.rate;

    const netSalesQty = parseFloat((cReading - oReading - tQty).toFixed(2));
    if (netSalesQty < 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid reading corrections: closing must be greater than opening + testing.'
      });
      return;
    }

    const calculatedTotalAmt = parseFloat((netSalesQty * activeRate).toFixed(2));

    const updatePayload = {
      ...req.body,
      salesQty: netSalesQty,
      totalAmt: calculatedTotalAmt
    };

    const updatedSale = await dbStore.findOneAndUpdate(
      'FuelSale',
      { id: req.params.id },
      { $set: updatePayload }
    );

    res.status(200).json({ success: true, data: updatedSale });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update fuel sale record',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Remove/Void fuel sale entry from audit pool
 */
export async function deleteFuelSale(req: Request, res: Response): Promise<void> {
  try {
    const deleted = await dbStore.findOneAndDelete('FuelSale', { id: req.params.id });
    if (!deleted) {
      res.status(404).json({ success: false, message: `Fuel sale log ${req.params.id} not found` });
      return;
    }
    res.status(200).json({ success: true, message: `Fuel sale ${req.params.id} voided from records` });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to void fuel sale record',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

