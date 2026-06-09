/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Schema, model } from 'mongoose';

const TankStockSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => `TNK-${Math.floor(1 + Math.random() * 9)}`
    },
    tankName: {
      type: String,
      required: true,
      trim: true
    },
    fuelType: {
      type: String,
      required: true,
      enum: ['Petrol', 'Diesel', 'Speed Petrol']
    },
    capacityLiters: {
      type: Number,
      required: true,
      min: 0
    },
    currentLevelLiters: {
      type: Number,
      required: true,
      min: 0
    },
    dipReadingMm: {
      type: Number,
      required: true,
      min: 0
    },
    waterLevelMm: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    lastUpdatedDip: {
      type: String,
      default: () => new Date().toISOString()
    },
    status: {
      type: String,
      required: true,
      enum: ['Normal', 'Low Stock', 'Critical'],
      default: 'Normal'
    }
  },
  {
    timestamps: true
  }
);

export const TankStock = model('TankStock', TankStockSchema, 'tank_stocks');
