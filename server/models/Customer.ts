/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Schema, model } from 'mongoose';

const CustomerSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => `CST-${Math.floor(100 + Math.random() * 900)}`
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    firmName: {
      type: String,
      required: true,
      trim: true
    },
    mobile: {
      type: String,
      required: true,
      trim: true
    },
    creditLimit: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    outstandingBalance: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    unbilledAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    lastPaymentDate: {
      type: String,
      trim: true
    },
    billingPeriod: {
      type: String,
      required: true,
      enum: ['Weekly', 'Monthly', '15 Days'],
      default: 'Monthly'
    },
    vehicleList: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      required: true,
      enum: ['Active', 'Suspended', 'Limit Exceeded'],
      default: 'Active'
    },
    // Extended Customer Fields for Lightweight Customers Module
    customerCode: {
      type: String,
      trim: true
    },
    customerName: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    gstNumber: {
      type: String,
      trim: true
    },
    customerType: {
      type: String,
      enum: ['Retail', 'Fleet', 'Corporate'],
      default: 'Corporate'
    }
  },
  {
    timestamps: true
  }
);

export const Customer = model('Customer', CustomerSchema, 'customers');
