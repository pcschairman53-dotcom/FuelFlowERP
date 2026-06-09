/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';

/**
 * Get all expenses with optional search and category filters
 */
export async function getExpenses(req: Request, res: Response): Promise<void> {
  try {
    const list = await dbStore.find('Expense', {}, { date: -1 });

    // Map fields back to be safe, though our database saves both
    const mappedList = list.map(item => {
      // Convert document to plain object
      const obj = item.toObject ? item.toObject() : { ...item };
      return {
        ...obj,
        id: obj.id || obj.voucherNo,
        date: obj.date || obj.expenseDate,
        paidTo: obj.paidTo || obj.vendorName,
        paymentMode: obj.paymentMode || obj.paymentMethod
      };
    });

    res.status(200).json({ success: true, count: mappedList.length, data: mappedList });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve expenses',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get a specific expense by ID / voucherNo
 */
export async function getExpenseById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const item = await dbStore.findOne('Expense', { id });
    if (!item) {
      res.status(404).json({ success: false, message: `Expense voucher ${id} not found` });
      return;
    }
    const obj = item.toObject ? item.toObject() : { ...item };
    const mapped = {
      ...obj,
      id: obj.id || obj.voucherNo,
      date: obj.date || obj.expenseDate,
      paidTo: obj.paidTo || obj.vendorName,
      paymentMode: obj.paymentMode || obj.paymentMethod
    };
    res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve expense detail',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Record a new commercial operating expense
 */
export async function createExpense(req: Request, res: Response): Promise<void> {
  try {
    const {
      id,
      voucherNo,
      date,
      expenseDate,
      category,
      amount,
      paidTo,
      vendorName,
      paymentMode,
      paymentMethod,
      approvedBy,
      remarks
    } = req.body;

    const vNo = voucherNo || id || `EXP-${Math.floor(400 + Math.random() * 599)}`;
    const eDate = expenseDate || date || new Date().toISOString().split('T')[0];
    const moneyAmount = amount || 0;
    const vendor = vendorName || paidTo || 'Anonymous Vendor';
    const payMode = paymentMethod || paymentMode || 'Bank Online';
    const authOfficer = approvedBy || 'Mr. Anand Ashok';
    const desc = remarks || '';

    const newExpense = await dbStore.create('Expense', {
      id: vNo,
      voucherNo: vNo,
      date: eDate,
      expenseDate: eDate,
      category,
      amount: moneyAmount,
      paidTo: vendor,
      vendorName: vendor,
      paymentMode: payMode,
      paymentMethod: payMode,
      approvedBy: authOfficer,
      remarks: desc
    });

    res.status(201).json({ success: true, data: newExpense });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record expense payout',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Update an existing expense record
 */
export async function updateExpense(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await dbStore.findOne('Expense', { id });
    if (!existing) {
      res.status(404).json({ success: false, message: `Expense voucher ${id} not found` });
      return;
    }

    const {
      voucherNo,
      date,
      expenseDate,
      category,
      amount,
      paidTo,
      vendorName,
      paymentMode,
      paymentMethod,
      approvedBy,
      remarks
    } = req.body;

    const updatedPayload: any = {};
    if (category !== undefined) updatedPayload.category = category;
    if (amount !== undefined) updatedPayload.amount = amount;
    if (approvedBy !== undefined) updatedPayload.approvedBy = approvedBy;
    if (remarks !== undefined) updatedPayload.remarks = remarks;

    // Direct and alias updates:
    const finalVoucherNo = voucherNo || id;
    updatedPayload.voucherNo = finalVoucherNo;
    updatedPayload.id = finalVoucherNo;

    const finalDate = expenseDate || date;
    if (finalDate !== undefined) {
      updatedPayload.date = finalDate;
      updatedPayload.expenseDate = finalDate;
    }

    const finalVendor = vendorName || paidTo;
    if (finalVendor !== undefined) {
      updatedPayload.paidTo = finalVendor;
      updatedPayload.vendorName = finalVendor;
    }

    const finalMode = paymentMethod || paymentMode;
    if (finalMode !== undefined) {
      updatedPayload.paymentMode = finalMode;
      updatedPayload.paymentMethod = finalMode;
    }

    const updated = await dbStore.findOneAndUpdate(
      'Expense',
      { id },
      { $set: updatedPayload }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update expense document',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Delete expense voucher completely from Mongoose
 */
export async function deleteExpense(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await dbStore.findOneAndDelete('Expense', { id });
    if (!deleted) {
      res.status(404).json({ success: false, message: `Expense voucher ${id} not found` });
      return;
    }
    res.status(200).json({ success: true, message: `Expense voucher ${id} deleted successfully` });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense voucher',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
