/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Schema, model } from 'mongoose';

const ReportLogSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    reportType: {
      type: String,
      required: true,
      trim: true
    },
    selectedRange: {
      type: String,
      required: true,
      trim: true
    },
    exportType: {
      type: String,
      required: true,
      enum: ['PDF', 'CSV', 'COMPILE'],
      trim: true
    },
    recordCount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    userEmail: {
      type: String,
      default: 'pcschairman53@gmail.com',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const ReportLog = model('ReportLog', ReportLogSchema, 'report_logs');
