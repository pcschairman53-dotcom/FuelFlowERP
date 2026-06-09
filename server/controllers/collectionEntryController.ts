/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { CollectionEntry } from '../models/CollectionEntry';

// Initial in-memory mock fallback data
let mockEntries: any[] = [
  {
    _id: "col_mock_1",
    date: "2026-06-08",
    shift: "Shift A (06:00 - 14:00)",
    collectionType: "Cash",
    amount: 156000,
    operator: "Vijay Sawant",
    remarks: "Physical cash from dispenser kiosk drop box",
    status: "Verified",
    createdAt: "2026-06-08T07:15:00.000Z",
    updatedAt: "2026-06-08T07:15:00.000Z"
  },
  {
    _id: "col_mock_2",
    date: "2026-06-08",
    shift: "Shift A (06:00 - 14:00)",
    collectionType: "Paytm",
    amount: 84500,
    operator: "Vijay Sawant",
    remarks: "QR transactions settled",
    status: "Verified",
    createdAt: "2026-06-08T07:18:00.000Z",
    updatedAt: "2026-06-08T07:18:00.000Z"
  },
  {
    _id: "col_mock_3",
    date: "2026-06-08",
    shift: "Shift B (14:00 - 22:00)",
    collectionType: "DT Plus",
    amount: 42000,
    operator: "Ramesh Kumar",
    remarks: "HPCL DT Plus fleet card batch upload",
    status: "Draft",
    createdAt: "2026-06-08T15:30:00.000Z",
    updatedAt: "2026-06-08T15:30:00.000Z"
  },
  {
    _id: "col_mock_4",
    date: "2026-06-08",
    shift: "Shift B (14:00 - 22:00)",
    collectionType: "Credit",
    amount: 67300,
    operator: "Ramesh Kumar",
    remarks: "Sales logged for Ashok Leyland layout account",
    status: "Draft",
    createdAt: "2026-06-08T15:35:00.000Z",
    updatedAt: "2026-06-08T15:35:00.000Z"
  }
];

function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * GET /api/collections-entries
 * Retrieve collection entries with optional query filters
 */
export async function getCollectionEntries(req: Request, res: Response): Promise<void> {
  try {
    const { date, shift, collectionType, status } = req.query;

    if (isDbConnected()) {
      const filter: any = {};
      if (date) filter.date = date;
      if (shift) filter.shift = shift;
      if (collectionType) filter.collectionType = collectionType;
      if (status) filter.status = status;

      // Filter only documents that actually represent an individual collectionType entry
      filter.collectionType = filter.collectionType || { $exists: true, $in: ['Cash', 'Paytm', 'DT Plus', 'Credit'] };

      const entries = await CollectionEntry.find(filter).sort({ date: -1, createdAt: -1 });
      res.status(200).json({ success: true, count: entries.length, data: entries });
    } else {
      // In-memory fallback
      let filtered = [...mockEntries];
      if (date) filtered = filtered.filter(e => e.date === date);
      if (shift) filtered = filtered.filter(e => e.shift === shift);
      if (collectionType) filtered = filtered.filter(e => e.collectionType === collectionType);
      if (status) filtered = filtered.filter(e => e.status === status);

      res.status(200).json({ success: true, count: filtered.length, data: filtered, fallback: true });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve collection entries',
      error: error.message || error
    });
  }
}

/**
 * POST /api/collections-entries
 * Create a new collection entry
 */
export async function createCollectionEntry(req: Request, res: Response): Promise<void> {
  try {
    const { date, shift, collectionType, amount, operator, remarks, status } = req.body;

    if (!date || !shift || !collectionType || amount === undefined || !operator) {
      res.status(400).json({
        success: false,
        message: 'Required fields: date, shift, collectionType, amount, operator'
      });
      return;
    }

    const payload = {
      date,
      shift,
      collectionType,
      amount: Number(amount),
      operator,
      remarks: remarks || '',
      status: status || 'Draft'
    };

    if (isDbConnected()) {
      const entry = await CollectionEntry.create(payload);
      res.status(201).json({ success: true, data: entry });
    } else {
      // In-memory fallback
      const newEntry = {
        _id: `col_mock_${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockEntries.unshift(newEntry);
      res.status(201).json({ success: true, data: newEntry, fallback: true });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create collection entry',
      error: error.message || error
    });
  }
}

/**
 * PUT /api/collections-entries/:id
 * Update an existing collection entry by ID
 */
export async function updateCollectionEntry(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    if (isDbConnected()) {
      const updated = await (CollectionEntry as any).findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: true }
      );
      if (!updated) {
        res.status(404).json({ success: false, message: `Collection entry ${id} not found` });
        return;
      }
      res.status(200).json({ success: true, data: updated });
    } else {
      // In-memory fallback
      const idx = mockEntries.findIndex(e => e._id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: `Collection entry ${id} not found` });
        return;
      }

      mockEntries[idx] = {
        ...mockEntries[idx],
        ...updateFields,
        updatedAt: new Date().toISOString()
      };
      res.status(200).json({ success: true, data: mockEntries[idx], fallback: true });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update collection entry',
      error: error.message || error
    });
  }
}

/**
 * DELETE /api/collections-entries/:id
 * Delete a collection entry by ID
 */
export async function deleteCollectionEntry(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const deleted = await (CollectionEntry as any).findByIdAndDelete(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: `Collection entry ${id} not found` });
        return;
      }
      res.status(200).json({ success: true, message: `Collection entry ${id} successfully deleted` });
    } else {
      // In-memory fallback
      const idx = mockEntries.findIndex(e => e._id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: `Collection entry ${id} not found` });
        return;
      }

      mockEntries.splice(idx, 1);
      res.status(200).json({ success: true, message: `Collection entry ${id} successfully deleted`, fallback: true });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete collection entry',
      error: error.message || error
    });
  }
}
