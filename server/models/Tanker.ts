/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Schema, model } from 'mongoose';

const TankerSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => `TKR-${Math.floor(100 + Math.random() * 900)}`
    },
    tankerNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    vehicleNumber: {
      type: String,
      trim: true,
      default: ''
    },
    capacityKl: {
      type: Number,
      required: true,
      min: 0
    },
    capacity: {
      type: Number,
      min: 0,
      default: 0
    },
    transporterName: {
      type: String,
      required: false,
      trim: true,
      default: 'General Log'
    },
    driverName: {
      type: String,
      required: true,
      trim: true
    },
    driverMobile: {
      type: String,
      required: true,
      trim: true
    },
    currentStatus: {
      type: String,
      required: true,
      enum: ['Idle', 'Dispatched to HPCL Depot', 'In-Transit to Pump', 'Decanting at Pump', 'Active', 'In Transit', 'Delivered'],
      default: 'Idle'
    },
    status: {
      type: String,
      default: 'Idle'
    },
    gpsLocation: {
      type: String,
      required: false,
      trim: true,
      default: 'Depot HQ Yard'
    },
    activeOrderId: {
      type: String,
      trim: true
    },
    fuelType: {
      type: String,
      trim: true,
      default: ''
    },
    loadingDate: {
      type: String,
      trim: true,
      default: ''
    },
    dispatchDate: {
      type: String,
      trim: true,
      default: ''
    },
    deliveryDate: {
      type: String,
      trim: true,
      default: ''
    },
    sourceLocation: {
      type: String,
      trim: true,
      default: ''
    },
    destinationLocation: {
      type: String,
      trim: true,
      default: ''
    },
    remarks: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const Tanker = model('Tanker', TankerSchema, 'tankers');
