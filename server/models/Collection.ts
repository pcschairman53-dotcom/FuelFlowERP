/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Schema, model } from 'mongoose';

const CollectionSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => `COL-${Math.floor(100 + Math.random() * 900)}`
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
    cashCalculated: {
      type: Number,
      required: true,
      default: 0
    },
    cashReceived: {
      type: Number,
      required: true,
      default: 0
    },
    shortageExcess: {
      type: Number,
      required: true,
      default: 0
    },
    paytmReceived: {
      type: Number,
      required: true,
      default: 0
    },
    phonepeReceived: {
      type: Number,
      required: true,
      default: 0
    },
    gpayReceived: {
      type: Number,
      required: true,
      default: 0
    },
    dtPlusReceived: {
      type: Number,
      required: true,
      default: 0
    },
    swipeCardReceived: {
      type: Number,
      required: true,
      default: 0
    },
    creditOutstanding: {
      type: Number,
      required: true,
      default: 0
    },
    totalCollection: {
      type: Number,
      required: true,
      default: 0
    },
    status: {
      type: String,
      required: true,
      enum: ['Verified', 'Discrepancy', 'Draft'],
      default: 'Draft'
    }
  },
  {
    timestamps: true
  }
);

export const Collection = model('Collection', CollectionSchema, 'collections');
