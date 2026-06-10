/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Schema, model } from 'mongoose';

const CashMovementSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    date: {
      type: String,
      required: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      enum: ['CASH_IN', 'CASH_OUT', 'SAFE_TRANSFER', 'BANK_DEPOSIT', 'BANK_WITHDRAWAL']
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    source: {
      type: String,
      required: true,
      trim: true
    },
    destination: {
      type: String,
      required: true,
      trim: true
    },
    remarks: {
      type: String,
      default: '',
      trim: true
    },
    createdBy: {
      type: String,
      default: 'Staff Manager',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const CashMovement = model('CashMovement', CashMovementSchema, 'cash_movements');
