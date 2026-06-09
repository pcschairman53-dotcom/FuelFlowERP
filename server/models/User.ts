/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Schema, model } from 'mongoose';

const UserSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => `USR-${Math.floor(100 + Math.random() * 900)}`
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    role: {
      type: String,
      required: true,
      enum: ['Owner', 'Manager', 'Shift Supervisor', 'Data Entry Operator'],
      default: 'Data Entry Operator'
    },
    active: {
      type: Boolean,
      required: true,
      default: true
    },
    assignedShift: {
      type: String,
      trim: true
    },
    lastActive: {
      type: String,
      default: () => new Date().toISOString()
    },
    permissions: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export const User = model('User', UserSchema, 'users');
