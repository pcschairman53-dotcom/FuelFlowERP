/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Schema, model } from 'mongoose';

const LubricantSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => `LUB-${Math.floor(100 + Math.random() * 900)}`
    },
    productName: {
      type: String,
      required: true,
      trim: true
    },
    grade: {
      type: String,
      required: false,
      trim: true
    },
    skuCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    boxQty: {
      type: Number,
      required: false,
      min: 0,
      default: 0
    },
    unitsPerBox: {
      type: Number,
      required: false,
      min: 1,
      default: 1
    },
    totalUnits: {
      type: Number,
      required: false,
      min: 0,
      default: 0
    },
    unitPrice: {
      type: Number,
      required: false,
      min: 0,
      default: 0
    },
    totalValue: {
      type: Number,
      required: false,
      min: 0,
      default: 0
    },
    reorderLevel: {
      type: Number,
      required: false,
      min: 0,
      default: 5
    },
    rackLocation: {
      type: String,
      required: false,
      trim: true
    },
    brand: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      trim: true
    },
    packSize: {
      type: String,
      trim: true
    },
    boxCount: {
      type: Number,
      min: 0,
      default: 0
    },
    pcsPerBox: {
      type: Number,
      min: 0,
      default: 0
    },
    unitCost: {
      type: Number,
      min: 0,
      default: 0
    },
    supplier: {
      type: String,
      trim: true
    },
    cabinetLocation: {
      type: String,
      trim: true
    },
    openingStock: {
      type: Number,
      min: 0,
      default: 0
    },
    remarks: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const Lubricant = model('Lubricant', LubricantSchema, 'lubricants');
