/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';

/**
 * Get all journal vouchers
 */
export async function getJournalVouchers(req: Request, res: Response): Promise<void> {
  try {
    const list = await dbStore.find('JournalVoucher', {}, { date: -1 });

    const mappedList = list.map(item => {
      const obj = item.toObject ? item.toObject() : { ...item };
      return {
        ...obj,
        id: obj.id || obj.voucherNo,
        voucherNo: obj.voucherNo || obj.id,
        date: obj.date,
        debitAccount: obj.debitAccount,
        creditAccount: obj.creditAccount,
        amount: obj.amount,
        narration: obj.narration
      };
    });

    res.status(200).json({ success: true, count: mappedList.length, data: mappedList });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve journal vouchers',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get specific journal voucher by ID
 */
export async function getJournalVoucherById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const item = await dbStore.findOne('JournalVoucher', { id });
    if (!item) {
      res.status(404).json({ success: false, message: `Journal voucher ${id} not found` });
      return;
    }
    const obj = item.toObject ? item.toObject() : { ...item };
    const mapped = {
      ...obj,
      id: obj.id || obj.voucherNo,
      voucherNo: obj.voucherNo || obj.id,
      date: obj.date,
      debitAccount: obj.debitAccount,
      creditAccount: obj.creditAccount,
      amount: obj.amount,
      narration: obj.narration
    };
    res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve journal voucher detail',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Create a new double-entry journal voucher
 */
export async function createJournalVoucher(req: Request, res: Response): Promise<void> {
  try {
    const {
      voucherNo,
      date,
      debitAccount,
      creditAccount,
      amount,
      narration
    } = req.body;

    const vNo = voucherNo || `JV-${Math.floor(400 + Math.random() * 599)}`;
    const jDate = date || new Date().toISOString().split('T')[0];
    const moneyAmount = amount || 0;
    const debit = debitAccount || 'Suspense A/c';
    const credit = creditAccount || 'Cash inside Treasury';
    const desc = narration || 'GAAP Adjusting Entrance';

    const newJV = await dbStore.create('JournalVoucher', {
      id: vNo,
      voucherNo: vNo,
      date: jDate,
      debitAccount: debit,
      creditAccount: credit,
      amount: moneyAmount,
      narration: desc
    });

    res.status(201).json({ success: true, data: newJV });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record journal voucher',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Update an existing journal voucher
 */
export async function updateJournalVoucher(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await dbStore.findOne('JournalVoucher', { id });
    if (!existing) {
      res.status(404).json({ success: false, message: `Journal voucher ${id} not found` });
      return;
    }

    const {
      voucherNo,
      date,
      debitAccount,
      creditAccount,
      amount,
      narration
    } = req.body;

    const updatedPayload: any = {};
    if (debitAccount !== undefined) updatedPayload.debitAccount = debitAccount;
    if (creditAccount !== undefined) updatedPayload.creditAccount = creditAccount;
    if (amount !== undefined) updatedPayload.amount = amount;
    if (narration !== undefined) updatedPayload.narration = narration;
    if (date !== undefined) updatedPayload.date = date;

    const finalVoucherNo = voucherNo || id;
    updatedPayload.voucherNo = finalVoucherNo;
    updatedPayload.id = finalVoucherNo;

    const updated = await dbStore.findOneAndUpdate(
      'JournalVoucher',
      { id },
      { $set: updatedPayload }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update journal voucher document',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Delete a journal voucher completely
 */
export async function deleteJournalVoucher(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await dbStore.findOneAndDelete('JournalVoucher', { id });
    if (!deleted) {
      res.status(404).json({ success: false, message: `Journal voucher ${id} not found` });
      return;
    }
    res.status(200).json({ success: true, message: `Journal voucher ${id} deleted successfully` });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete journal voucher',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
