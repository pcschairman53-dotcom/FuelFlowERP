/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose, { Schema, model, Model } from 'mongoose';

const TankStockEntrySchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => `TS-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`
    },
    date: {
      type: String,
      required: true,
      index: true
    },
    shift: {
      type: String,
      required: true,
      trim: true
    },
    tankNumber: {
      type: String,
      required: true,
      trim: true
    },
    fuelType: {
      type: String,
      required: true,
      trim: true
    },
    openingStock: {
      type: Number,
      required: true,
      min: 0
    },
    receivedQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    salesQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    closingStock: {
      type: Number,
      required: true,
      min: 0
    },
    dipReading: {
      type: Number,
      required: true,
      min: 0
    },
    waterLevel: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    remarks: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true,
    collection: 'tank_stocks' // Explicitly maps to the collection: tank_stocks as requested
  }
);

export const TankStockEntry: Model<any> = mongoose.models.TankStockEntry || model<any>('TankStockEntry', TankStockEntrySchema, 'tank_stocks');
