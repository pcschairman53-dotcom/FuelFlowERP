/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Schema, model } from 'mongoose';

const FuelSaleSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => `SL-${Math.floor(100 + Math.random() * 900)}`
    },
    date: {
      type: String,
      required: true,
      index: true
    },
    nozzleId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    fuelType: {
      type: String,
      required: true,
      enum: ['Petrol', 'Diesel', 'Speed Petrol']
    },
    openingReading: {
      type: Number,
      required: true,
      min: 0
    },
    closingReading: {
      type: Number,
      required: true,
      min: 0
    },
    testingQty: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    salesQty: {
      type: Number,
      required: true,
      min: 0
    },
    rate: {
      type: Number,
      required: true,
      min: 0
    },
    totalAmt: {
      type: Number,
      required: true,
      min: 0
    },
    shift: {
      type: String,
      required: true,
      enum: [
        'Shift A (06:00 - 14:00)',
        'Shift B (14:00 - 22:00)',
        'Shift C (22:00 - 06:00)',
        'Shift A',
        'Shift B',
        'Shift C'
      ]
    },
    operator: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      required: true,
      enum: ['Completed', 'Pending Verification'],
      default: 'Pending Verification'
    }
  },
  {
    timestamps: true
  }
);

export const FuelSale = model('FuelSale', FuelSaleSchema, 'fuel_sales');
