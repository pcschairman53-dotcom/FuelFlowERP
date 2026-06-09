/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';

/**
 * Get daily collection settlements matching optional shift or date filters
 */
export async function getCollections(req: Request, res: Response): Promise<void> {
  try {
    const { date, shift, status } = req.query;
    const filterQuery: any = {};

    if (date) filterQuery.date = date;
    if (shift) filterQuery.shift = shift;
    if (status) filterQuery.status = status;

    const collections = await dbStore.find('Collection', filterQuery, { date: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: collections.length, data: collections });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve collection settlements',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get specific collections record by collection ID
 */
export async function getCollectionById(req: Request, res: Response): Promise<void> {
  try {
    const collection = await dbStore.findOne('Collection', { id: req.params.id });
    if (!collection) {
      res.status(404).json({ success: false, message: `Collection record ${req.params.id} not found` });
      return;
    }
    res.status(200).json({ success: true, data: collection });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve collection record',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Submit daily cash or digital collection reconciliation shift logs
 */
export async function createCollection(req: Request, res: Response): Promise<void> {
  try {
    const {
      date,
      shift,
      cashCalculated,
      cashReceived,
      paytmReceived,
      phonepeReceived,
      gpayReceived,
      dtPlusReceived,
      swipeCardReceived,
      creditOutstanding,
      status
    } = req.body;

    const calculatedShortageExcess = parseFloat(((cashReceived || 0) - (cashCalculated || 0)).toFixed(2));
    const calculatedTotal = parseFloat(
      (
        (cashReceived || 0) +
        (paytmReceived || 0) +
        (phonepeReceived || 0) +
        (gpayReceived || 0) +
        (dtPlusReceived || 0) +
        (swipeCardReceived || 0) +
        (creditOutstanding || 0)
      ).toFixed(2)
    );

    const newCollection = await dbStore.create('Collection', {
      date,
      shift,
      cashCalculated: cashCalculated || 0,
      cashReceived: cashReceived || 0,
      shortageExcess: calculatedShortageExcess,
      paytmReceived: paytmReceived || 0,
      phonepeReceived: phonepeReceived || 0,
      gpayReceived: gpayReceived || 0,
      dtPlusReceived: dtPlusReceived || 0,
      swipeCardReceived: swipeCardReceived || 0,
      creditOutstanding: creditOutstanding || 0,
      totalCollection: calculatedTotal,
      status: status || 'Draft'
    });

    res.status(201).json({ success: true, data: newCollection });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create collection entry',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Update collection values, correcting shortages or verification audits
 */
export async function updateCollection(req: Request, res: Response): Promise<void> {
  try {
    const existing = await dbStore.findOne('Collection', { id: req.params.id });

    if (!existing) {
      res.status(404).json({ success: false, message: `Collection with record ID ${req.params.id} not found` });
      return;
    }

    const payload = { ...req.body };

    // Recalculate if totals or cash accounts are targeted for modification
    const cashCalc = payload.cashCalculated !== undefined ? payload.cashCalculated : existing.cashCalculated;
    const cashRec = payload.cashReceived !== undefined ? payload.cashReceived : existing.cashReceived;
    
    payload.shortageExcess = parseFloat((cashRec - cashCalc).toFixed(2));

    const paytm = payload.paytmReceived !== undefined ? payload.paytmReceived : existing.paytmReceived;
    const phonepe = payload.phonepeReceived !== undefined ? payload.phonepeReceived : existing.phonepeReceived;
    const gpay = payload.gpayReceived !== undefined ? payload.gpayReceived : existing.gpayReceived;
    const dtPlus = payload.dtPlusReceived !== undefined ? payload.dtPlusReceived : existing.dtPlusReceived;
    const swipe = payload.swipeCardReceived !== undefined ? payload.swipeCardReceived : existing.swipeCardReceived;
    const credit = payload.creditOutstanding !== undefined ? payload.creditOutstanding : existing.creditOutstanding;

    payload.totalCollection = parseFloat(
      (cashRec + paytm + phonepe + gpay + dtPlus + swipe + credit).toFixed(2)
    );

    const updated = await dbStore.findOneAndUpdate(
      'Collection',
      { id: req.params.id },
      { $set: payload }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update collection record',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Delete draft or faulty collection record
 */
export async function deleteCollection(req: Request, res: Response): Promise<void> {
  try {
    const deleted = await dbStore.findOneAndDelete('Collection', { id: req.params.id });
    if (!deleted) {
      res.status(404).json({ success: false, message: `Collection record ${req.params.id} not found` });
      return;
    }
    res.status(200).json({ success: true, message: `Collection ${req.params.id} successfully deleted` });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete collection entry',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

