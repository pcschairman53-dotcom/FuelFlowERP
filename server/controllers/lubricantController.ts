/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';
import { dbStore, isDbConnected } from '../services/dbStore';
import { Lubricant } from '../models/Lubricant';

/**
 * Get all lubricants inventory
 */
export async function getLubricants(req: Request, res: Response): Promise<void> {
  try {
    const products = await dbStore.find('Lubricant', {}, { productName: 1 });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve lubricants inventory',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get lubricant item by SKU code or original ID
 */
export async function getLubricantById(req: Request, res: Response): Promise<void> {
  try {
    const item = await dbStore.findOne('Lubricant', { id: req.params.id });
    if (!item) {
      res.status(404).json({ success: false, message: `Lubricant item ${req.params.id} not found` });
      return;
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve lubricant item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Add a new lubricant SKU to inventory database
 */
export async function createLubricant(req: Request, res: Response): Promise<void> {
  try {
    const {
      productName,
      grade,
      skuCode,
      boxQty,
      unitsPerBox,
      unitPrice,
      reorderLevel,
      rackLocation,
      // New fields from new form
      brand,
      category,
      packSize,
      boxCount,
      pcsPerBox,
      unitCost,
      supplier,
      cabinetLocation,
      openingStock,
      remarks
    } = req.body;

    // Map new fields to compatible legacy fields
    const finalBoxQty = boxCount !== undefined ? Number(boxCount) : (boxQty !== undefined ? Number(boxQty) : 0);
    const finalUnitsPerBox = pcsPerBox !== undefined ? Number(pcsPerBox) : (unitsPerBox !== undefined ? Number(unitsPerBox) : 1);
    const finalOpeningStock = openingStock !== undefined ? Number(openingStock) : (finalBoxQty * finalUnitsPerBox);
    const finalUnitPrice = unitCost !== undefined ? Number(unitCost) : (unitPrice !== undefined ? Number(unitPrice) : 0);

    const calculatedTotalUnits = finalOpeningStock;
    const calculatedTotalValue = calculatedTotalUnits * finalUnitPrice;

    const finalGrade = category || grade || 'Standard';
    const finalRackLocation = cabinetLocation || rackLocation || 'N/A';

    const newLube = await dbStore.create('Lubricant', {
      productName,
      grade: finalGrade,
      skuCode,
      boxQty: finalBoxQty,
      unitsPerBox: finalUnitsPerBox,
      totalUnits: calculatedTotalUnits,
      unitPrice: finalUnitPrice,
      totalValue: calculatedTotalValue,
      reorderLevel: reorderLevel || 10,
      rackLocation: finalRackLocation,
      brand: brand || '',
      category: category || '',
      packSize: packSize || '',
      boxCount: finalBoxQty,
      pcsPerBox: finalUnitsPerBox,
      unitCost: finalUnitPrice,
      supplier: supplier || '',
      cabinetLocation: finalRackLocation,
      openingStock: finalOpeningStock,
      remarks: remarks || ''
    });

    res.status(201).json({ success: true, data: newLube });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add lubricant SKU to database',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Update lubricant quantity (decanting, manual corrections, or shipments)
 */
export async function updateLubricant(req: Request, res: Response): Promise<void> {
  try {
    const existing = await dbStore.findOne('Lubricant', { id: req.params.id });

    if (!existing) {
      res.status(404).json({ success: false, message: `Lubricant item ${req.params.id} not found` });
      return;
    }

    const payload = { ...req.body };

    // Resolve current values
    const currentBoxQty = payload.boxCount !== undefined ? Number(payload.boxCount) : (payload.boxQty !== undefined ? Number(payload.boxQty) : (existing.boxQty || 0));
    const currentPcsPerBox = payload.pcsPerBox !== undefined ? Number(payload.pcsPerBox) : (payload.unitsPerBox !== undefined ? Number(payload.unitsPerBox) : (existing.unitsPerBox || 1));
    const currentUnitPrice = payload.unitCost !== undefined ? Number(payload.unitCost) : (payload.unitPrice !== undefined ? Number(payload.unitPrice) : (existing.unitPrice || 0));
    
    // Recalculate opening stock / total units when box stock levels are adjusted
    let currentOpeningStock = existing.openingStock || existing.totalUnits || (currentBoxQty * currentPcsPerBox);
    if (payload.boxQty !== undefined || payload.boxCount !== undefined || payload.pcsPerBox !== undefined || payload.unitsPerBox !== undefined) {
      currentOpeningStock = currentBoxQty * currentPcsPerBox;
    }
    if (payload.openingStock !== undefined) {
      currentOpeningStock = Number(payload.openingStock);
    } else if (payload.totalUnits !== undefined) {
      currentOpeningStock = Number(payload.totalUnits);
    }

    payload.boxQty = currentBoxQty;
    payload.boxCount = currentBoxQty;
    payload.unitsPerBox = currentPcsPerBox;
    payload.pcsPerBox = currentPcsPerBox;
    payload.unitPrice = currentUnitPrice;
    payload.unitCost = currentUnitPrice;
    payload.openingStock = currentOpeningStock;
    payload.totalUnits = currentOpeningStock;
    payload.totalValue = currentOpeningStock * currentUnitPrice;
    payload.updatedAt = new Date();

    if (payload.category && !payload.grade) {
      payload.grade = payload.category;
    }
    if (payload.cabinetLocation && !payload.rackLocation) {
      payload.rackLocation = payload.cabinetLocation;
    }

    let updated;
    if (isDbConnected()) {
      updated = await Lubricant.findByIdAndUpdate(
        existing._id,
        { $set: payload },
        { new: true, runValidators: true }
      ).exec();
    } else {
      updated = await dbStore.findOneAndUpdate(
        'Lubricant',
        { id: req.params.id },
        { $set: payload }
      );
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update lubricant inventory SKU',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Delete a lubricant SKU
 */
export async function deleteLubricant(req: Request, res: Response): Promise<void> {
  try {
    const deleted = await dbStore.findOneAndDelete('Lubricant', { id: req.params.id });
    if (!deleted) {
      res.status(404).json({ success: false, message: `Lubricant entry ${req.params.id} not found` });
      return;
    }
    res.status(200).json({ success: true, message: `Lubricant ${req.params.id} successfully removed` });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove lubricant SKU',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

