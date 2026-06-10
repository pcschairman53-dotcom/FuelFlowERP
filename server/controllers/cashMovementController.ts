/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';

/**
 * Get all cash movements
 */
export async function getCashMovements(req: Request, res: Response): Promise<void> {
  try {
    const list = await dbStore.find('CashMovement', {}, { date: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cash movements',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Create a new cash movement record
 */
export async function createCashMovement(req: Request, res: Response): Promise<void> {
  try {
    const {
      id,
      date,
      type,
      amount,
      source,
      destination,
      remarks,
      createdBy
    } = req.body;

    if (!date || !type || amount === undefined || !source || !destination) {
      res.status(400).json({ success: false, message: 'Missing required cash movement fields' });
      return;
    }

    const cmId = id || `CM-${Math.floor(200 + Math.random() * 799)}`;
    const finalDate = date || new Date().toISOString().split('T')[0];

    const newMovement = await dbStore.create('CashMovement', {
      id: cmId,
      date: finalDate,
      type,
      amount: Number(amount) || 0,
      source,
      destination,
      remarks: remarks || '',
      createdBy: createdBy || 'Staff Manager'
    });

    res.status(201).json({ success: true, data: newMovement });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record cash movement',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Update an existing cash movement record
 */
export async function updateCashMovement(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await dbStore.findOne('CashMovement', { id });
    if (!existing) {
      res.status(404).json({ success: false, message: `Cash movement ${id} not found` });
      return;
    }

    const {
      date,
      type,
      amount,
      source,
      destination,
      remarks,
      createdBy
    } = req.body;

    const updatedPayload: any = {};
    if (date !== undefined) updatedPayload.date = date;
    if (type !== undefined) updatedPayload.type = type;
    if (amount !== undefined) updatedPayload.amount = Number(amount) || 0;
    if (source !== undefined) updatedPayload.source = source;
    if (destination !== undefined) updatedPayload.destination = destination;
    if (remarks !== undefined) updatedPayload.remarks = remarks;
    if (createdBy !== undefined) updatedPayload.createdBy = createdBy;

    const updated = await dbStore.findOneAndUpdate(
      'CashMovement',
      { id },
      { $set: updatedPayload }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update cash movement record',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Delete cash movement record
 */
export async function deleteCashMovement(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await dbStore.findOneAndDelete('CashMovement', { id });
    if (!deleted) {
      res.status(404).json({ success: false, message: `Cash movement ${id} not found` });
      return;
    }
    res.status(200).json({ success: true, message: `Cash movement ${id} deleted successfully` });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete cash movement record',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
