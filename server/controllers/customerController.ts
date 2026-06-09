/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';

/**
 * Get all credit customers
 */
export async function getCustomers(req: Request, res: Response): Promise<void> {
  try {
    const list = await dbStore.find('Customer', {}, { name: 1 });
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve credit customer portfolios',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get a distinct credit customer by ID
 */
export async function getCustomerById(req: Request, res: Response): Promise<void> {
  try {
    const item = await dbStore.findOne('Customer', { id: req.params.id });
    if (!item) {
      res.status(404).json({ success: false, message: `Credit portfolios key ${req.params.id} not found` });
      return;
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve credit customer profiles',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Register a new credit ledger account / Customer Directory account
 */
export async function createCustomer(req: Request, res: Response): Promise<void> {
  try {
    const {
      name,
      firmName,
      mobile,
      creditLimit,
      outstandingBalance,
      unbilledAmount,
      billingPeriod,
      vehicleList,
      status,
      // Extended fields
      customerCode,
      customerName,
      email,
      address,
      gstNumber,
      customerType
    } = req.body;

    const outstanding = outstandingBalance || 0;
    const limit = creditLimit || 0;
    let finalStatus = status || 'Active';
    if (outstanding > limit) {
      finalStatus = 'Limit Exceeded';
    }

    const cCode = customerCode || req.body.id || `CST-${Math.floor(100 + Math.random() * 900)}`;
    const finalName = customerName || name || firmName || 'Anonymous Customer';
    const finalFirm = firmName || customerName || name || 'Anonymous Firm';

    const newCust = await dbStore.create('Customer', {
      id: cCode,
      customerCode: cCode,
      customerName: finalName,
      name: finalName,
      firmName: finalFirm,
      mobile: mobile || '',
      creditLimit: limit,
      outstandingBalance: outstanding,
      unbilledAmount: unbilledAmount || 0,
      billingPeriod: billingPeriod || 'Monthly',
      vehicleList: vehicleList || [],
      status: finalStatus,
      lastPaymentDate: new Date().toISOString().split('T')[0],
      email: email || '',
      address: address || '',
      gstNumber: gstNumber || '',
      customerType: customerType || 'Corporate'
    });

    res.status(201).json({ success: true, data: newCust });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to open credit portfolio account',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Handle payments or updates (e.g. credit limit corrections / vehicle list registers / customer info edit)
 */
export async function updateCustomer(req: Request, res: Response): Promise<void> {
  try {
    const existing = await dbStore.findOne('Customer', { id: req.params.id });
    if (!existing) {
      res.status(404).json({ success: false, message: `Customer account ${req.params.id} not found` });
      return;
    }

    const outstanding = req.body.outstandingBalance !== undefined ? req.body.outstandingBalance : existing.outstandingBalance;
    const limit = req.body.creditLimit !== undefined ? req.body.creditLimit : existing.creditLimit;

    const updatedPayload = { ...req.body };
    if (outstanding > limit) {
      updatedPayload.status = 'Limit Exceeded';
    } else if (existing.status === 'Limit Exceeded') {
      updatedPayload.status = 'Active';
    }

    // Keep legacy name, firmName in sync with customerName if provided
    if (req.body.customerName !== undefined) {
      updatedPayload.name = req.body.customerName;
      updatedPayload.firmName = req.body.customerName;
    } else if (req.body.name !== undefined) {
      updatedPayload.customerName = req.body.name;
    }

    const updated = await dbStore.findOneAndUpdate(
      'Customer',
      { id: req.params.id },
      { $set: updatedPayload }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to settle accounts or update credit status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Close/Delete customer account from credit portfolios list
 */
export async function deleteCustomer(req: Request, res: Response): Promise<void> {
  try {
    const deleted = await dbStore.findOneAndDelete('Customer', { id: req.params.id });
    if (!deleted) {
      res.status(404).json({ success: false, message: `Customer account ${req.params.id} not found` });
      return;
    }
    res.status(200).json({ success: true, message: `Customer ${req.params.id} ledger portfolio terminated` });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to terminate credit portfolio ledger',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

