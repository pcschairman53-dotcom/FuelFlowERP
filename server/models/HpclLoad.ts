/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Schema, model } from 'mongoose';

const HpclLoadSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => `IND-${Math.floor(100 + Math.random() * 900)}`
    },
    indentDate: {
      type: String,
      required: true,
      index: true
    },
    indentNo: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    productType: {
      type: String,
      required: true,
      enum: ['Petrol (MS)', 'Diesel (HSD)', 'Speed (Premium MS)']
    },
    quantityKl: {
      type: Number,
      required: true,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentBank: {
      type: String,
      required: true,
      trim: true
    },
    utrNo: {
      type: String,
      required: true,
      trim: true
    },
    orderStatus: {
      type: String,
      required: true,
      enum: [
        'Indent Placed',
        'Paid & Pending HPCL Dispatch',
        'In-Transit',
        'Decanted',
        'Cancelled'
      ],
      default: 'Indent Placed'
    },
    assignedTankerNo: {
      type: String,
      required: true,
      trim: true
    },
    eta: {
      type: String,
      required: true,
      trim: true
    },
    actualArrivalDate: {
      type: String,
      trim: true
    },
    dispatchedAt: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const HpclLoad = model('HpclLoad', HpclLoadSchema, 'hpcl_loads');
