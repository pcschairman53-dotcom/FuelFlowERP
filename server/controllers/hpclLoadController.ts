/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';

/**
 * Get all active and archived HPCL refinery indents/loads
 */
export async function getHpclLoads(req: Request, res: Response): Promise<void> {
  try {
    const { productType, orderStatus } = req.query;
    const filterQuery: any = {};

    if (productType) filterQuery.productType = productType;
    if (orderStatus) filterQuery.orderStatus = orderStatus;

    const loads = await dbStore.find('HpclLoad', filterQuery, { indentDate: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: loads.length, data: loads });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve HPCL loads',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get distinct refinery indent by ID
 */
export async function getHpclLoadById(req: Request, res: Response): Promise<void> {
  try {
    const load = await dbStore.findOne('HpclLoad', { id: req.params.id });
    if (!load) {
      res.status(404).json({ success: false, message: `Indent record ${req.params.id} not found` });
      return;
    }
    res.status(200).json({ success: true, data: load });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve indent record',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Lock and record a new HPCL refinery prepay indent load
 */
export async function createHpclLoad(req: Request, res: Response): Promise<void> {
  try {
    const {
      indentDate,
      indentNo,
      productType,
      quantityKl,
      totalAmount,
      paymentBank,
      utrNo,
      orderStatus,
      assignedTankerNo,
      eta,
      actualArrivalDate,
      dispatchedAt
    } = req.body;

    const exists = await dbStore.findOne('HpclLoad', { indentNo });
    if (exists) {
      res.status(400).json({ success: false, message: `Indent no. ${indentNo} has already been registered in the system` });
      return;
    }

    const newLoad = await dbStore.create('HpclLoad', {
      indentDate,
      indentNo,
      productType,
      quantityKl,
      totalAmount,
      paymentBank,
      utrNo,
      orderStatus: orderStatus || 'Indent Placed',
      assignedTankerNo,
      eta,
      actualArrivalDate,
      dispatchedAt
    });

    res.status(201).json({ success: true, data: newLoad });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to dispatch HPCL load indent',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Update HPCL Indent Status (Decanted, In-Transit, ETA adjustments, arrivals)
 */
export async function updateHpclLoad(req: Request, res: Response): Promise<void> {
  try {
    const payload = { ...req.body };
    if (payload.orderStatus === 'Decanted' && !payload.actualArrivalDate) {
      payload.actualArrivalDate = new Date().toISOString().replace('T', ' ').slice(0, 16);
    }

    const updatedLoad = await dbStore.findOneAndUpdate(
      'HpclLoad',
      { id: req.params.id },
      { $set: payload }
    );

    if (!updatedLoad) {
      res.status(404).json({ success: false, message: `Indent record ${req.params.id} not found` });
      return;
    }

    res.status(200).json({ success: true, data: updatedLoad });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update HPCL load status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Deletes or cancels pending HPCL loading slot
 */
export async function deleteHpclLoad(req: Request, res: Response): Promise<void> {
  try {
    const deleted = await dbStore.findOneAndDelete('HpclLoad', { id: req.params.id });
    if (!deleted) {
      res.status(404).json({ success: false, message: `Indent record ${req.params.id} not found` });
      return;
    }
    res.status(200).json({ success: true, message: `HPCL Indent load ${req.params.id} cancelled/deleted` });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel HPCL load',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

