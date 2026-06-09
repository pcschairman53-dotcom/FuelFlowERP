/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';
import { dbStore, isDbConnected } from '../services/dbStore';
import { Tanker } from '../models/Tanker';

/**
 * Get all logistics tankers
 */
export async function getTankers(req: Request, res: Response): Promise<void> {
  try {
    let list;
    if (isDbConnected()) {
      list = await Tanker.find({}).sort({ createdAt: -1 }).exec();
    } else {
      list = await dbStore.find('Tanker', {}, { tankerNumber: 1 });
    }
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tankers logistics registry',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get tanker status parameters by ID
 */
export async function getTankerById(req: Request, res: Response): Promise<void> {
  try {
    let item;
    if (isDbConnected()) {
      item = await Tanker.findOne({ id: req.params.id }).exec();
    } else {
      item = await dbStore.findOne('Tanker', { id: req.params.id });
    }
    if (!item) {
      res.status(404).json({ success: false, message: `Tanker ${req.params.id} not found` });
      return;
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tanker status parameters',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Create a new tanker logistics entry
 */
export async function createTanker(req: Request, res: Response): Promise<void> {
  try {
    const {
      tankerNumber,
      vehicleNumber,
      capacityKl,
      capacity,
      transporterName,
      driverName,
      driverMobile,
      currentStatus,
      status,
      gpsLocation,
      activeOrderId,
      fuelType,
      loadingDate,
      dispatchDate,
      deliveryDate,
      sourceLocation,
      destinationLocation,
      remarks
    } = req.body;

    const resolvedCapacity = Number(capacity !== undefined ? capacity : (capacityKl !== undefined ? capacityKl : 0));
    const resolvedCapacityKl = Number(capacityKl !== undefined ? capacityKl : (capacity !== undefined ? capacity : 0));

    const resolvedStatus = status || currentStatus || 'Idle';
    const resolvedCurrentStatus = currentStatus || status || 'Idle';

    const payload = {
      id: req.body.id || `TKR-${Math.floor(100 + Math.random() * 900)}`,
      tankerNumber: tankerNumber || vehicleNumber || '',
      vehicleNumber: vehicleNumber || tankerNumber || '',
      capacityKl: resolvedCapacityKl,
      capacity: resolvedCapacity,
      transporterName: transporterName || 'General Log',
      driverName: driverName || '',
      driverMobile: driverMobile || '',
      currentStatus: resolvedCurrentStatus,
      status: resolvedStatus,
      gpsLocation: gpsLocation || 'Depot HQ Yard',
      activeOrderId: activeOrderId || '',
      fuelType: fuelType || '',
      loadingDate: loadingDate || '',
      dispatchDate: dispatchDate || '',
      deliveryDate: deliveryDate || '',
      sourceLocation: sourceLocation || '',
      destinationLocation: destinationLocation || '',
      remarks: remarks || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    let newTanker;
    if (isDbConnected()) {
      newTanker = await Tanker.create(payload);
    } else {
      newTanker = await dbStore.create('Tanker', payload);
    }

    res.status(201).json({ success: true, data: newTanker });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record tanker entry',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Update tanker dispatch statuses (GPS tracking alerts / decanting status triggers)
 */
export async function updateTanker(req: Request, res: Response): Promise<void> {
  try {
    let existing;
    if (isDbConnected()) {
      existing = await Tanker.findOne({ id: req.params.id }).exec();
    } else {
      existing = await dbStore.findOne('Tanker', { id: req.params.id });
    }

    if (!existing) {
      res.status(404).json({ success: false, message: `Tanker ${req.params.id} not found` });
      return;
    }

    const payload = { ...req.body };
    payload.updatedAt = new Date();

    if (payload.capacity !== undefined) {
      payload.capacityKl = Number(payload.capacity);
    } else if (payload.capacityKl !== undefined) {
      payload.capacity = Number(payload.capacityKl);
    }

    if (payload.status !== undefined) {
      payload.currentStatus = payload.status;
    } else if (payload.currentStatus !== undefined) {
      payload.status = payload.currentStatus;
    }

    let updated;
    if (isDbConnected()) {
      updated = await Tanker.findByIdAndUpdate(
        existing._id,
        { $set: payload },
        { new: true, runValidators: true }
      ).exec();
    } else {
      updated = await dbStore.findOneAndUpdate(
        'Tanker',
        { id: req.params.id },
        { $set: payload }
      );
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update tanker metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Delete a tanker registration
 */
export async function deleteTanker(req: Request, res: Response): Promise<void> {
  try {
    let deleted;
    if (isDbConnected()) {
      deleted = await Tanker.findOneAndDelete({ id: req.params.id }).exec();
    } else {
      deleted = await dbStore.findOneAndDelete('Tanker', { id: req.params.id });
    }

    if (!deleted) {
      res.status(404).json({ success: false, message: `Tanker ${req.params.id} not found` });
      return;
    }
    res.status(200).json({ success: true, message: `Tanker ${req.params.id} voided from system registry` });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove tanker registry details',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

