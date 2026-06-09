/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Schema, model } from 'mongoose';

const SettingSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: 'global_settings'
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    dealershipCode: {
      type: String,
      required: true,
      trim: true
    },
    vatTin: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    tagline: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const Setting = model('Setting', SettingSchema, 'settings');
