/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Schema, model } from 'mongoose';

const JournalVoucherSchema = new Schema(
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
    debitAccount: {
      type: String,
      required: true,
      trim: true
    },
    creditAccount: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    narration: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const JournalVoucher = model('JournalVoucher', JournalVoucherSchema, 'journal_vouchers');
