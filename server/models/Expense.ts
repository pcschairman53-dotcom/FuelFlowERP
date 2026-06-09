/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Schema, model } from 'mongoose';

const ExpenseSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    voucherNo: {
      type: String,
      required: true,
      index: true
    },
    date: {
      type: String,
      required: true
    },
    expenseDate: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paidTo: {
      type: String,
      required: true,
      trim: true
    },
    vendorName: {
      type: String,
      required: true,
      trim: true
    },
    paymentMode: {
      type: String,
      required: true,
      trim: true
    },
    paymentMethod: {
      type: String,
      required: true,
      trim: true
    },
    approvedBy: {
      type: String,
      default: 'Mr. Anand Ashok',
      trim: true
    },
    remarks: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const Expense = model('Expense', ExpenseSchema, 'expenses');
