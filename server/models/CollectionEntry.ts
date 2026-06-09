/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose, { Schema, model, Model } from 'mongoose';

const CollectionEntrySchema = new Schema(
  {
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
    collectionType: {
      type: String,
      required: true,
      enum: ['Cash', 'Paytm', 'DT Plus', 'Credit'],
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    operator: {
      type: String,
      required: true,
      trim: true
    },
    remarks: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      required: true,
      enum: ['Verified', 'Draft'],
      default: 'Draft'
    }
  },
  {
    timestamps: true,
    collection: 'collections' // Maps safely to 'collections' collection in database
  }
);

export const CollectionEntry: Model<any> = mongoose.models.CollectionEntry || model<any>('CollectionEntry', CollectionEntrySchema);
