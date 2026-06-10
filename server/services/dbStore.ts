/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose from 'mongoose';
import { User } from '../models/User';
import { FuelSale } from '../models/FuelSale';
import { Collection } from '../models/Collection';
import { HpclLoad } from '../models/HpclLoad';
import { TankStock } from '../models/TankStock';
import { Lubricant } from '../models/Lubricant';
import { Tanker } from '../models/Tanker';
import { Customer } from '../models/Customer';
import { TankStockEntry } from '../models/TankStockEntry';
import { Expense } from '../models/Expense';
import { JournalVoucher } from '../models/JournalVoucher';
import { ReportLog } from '../models/ReportLog';
import { Setting } from '../models/Setting';
import { CashMovement } from '../models/CashMovement';

import {
  INITIAL_USERS,
  INITIAL_FUEL_SALES,
  INITIAL_COLLECTIONS,
  INITIAL_HPCL_INDENTS,
  INITIAL_TANK_STOCK,
  INITIAL_LUBRICANTS,
  INITIAL_TANKERS,
  INITIAL_CREDIT_CUSTOMERS,
  INITIAL_EXPENSES,
  ACCOUNTING_METRICS,
  COMPANY_DETAILS
} from '../../src/data';

// Map Model Names to their Mongoose Models
const MODEL_MAP: Record<string, any> = {
  User,
  FuelSale,
  Collection,
  HpclLoad,
  TankStock,
  Lubricant,
  Tanker,
  Customer,
  TankStockEntry,
  Expense,
  JournalVoucher,
  ReportLog,
  Setting,
  CashMovement
};

// Initialize In-Memory fallback datasets
const IN_MEMORY_STORE: Record<string, any[]> = {
  User: JSON.parse(JSON.stringify(INITIAL_USERS)),
  FuelSale: JSON.parse(JSON.stringify(INITIAL_FUEL_SALES)),
  Collection: JSON.parse(JSON.stringify(INITIAL_COLLECTIONS)),
  HpclLoad: JSON.parse(JSON.stringify(INITIAL_HPCL_INDENTS)),
  TankStock: JSON.parse(JSON.stringify(INITIAL_TANK_STOCK)),
  Lubricant: JSON.parse(JSON.stringify(INITIAL_LUBRICANTS)),
  Tanker: JSON.parse(JSON.stringify(INITIAL_TANKERS)),
  Customer: JSON.parse(JSON.stringify(INITIAL_CREDIT_CUSTOMERS)),
  ReportLog: [],
  Setting: [{
    id: 'global_settings',
    name: COMPANY_DETAILS.name,
    dealershipCode: COMPANY_DETAILS.dealershipCode,
    address: COMPANY_DETAILS.address,
    vatTin: COMPANY_DETAILS.vatTin,
    tagline: COMPANY_DETAILS.tagline
  }],
  Expense: JSON.parse(JSON.stringify(INITIAL_EXPENSES)).map((e: any) => ({
    ...e,
    voucherNo: e.id,
    expenseDate: e.date,
    vendorName: e.paidTo,
    paymentMethod: e.paymentMode
  })),
  JournalVoucher: ACCOUNTING_METRICS.recentJournals.map((jv: any) => {
    let debit = 'Cash in Hand';
    let credit = 'Credit Customers';
    let narr = 'Manual double-entry GAAP adjustments';
    if (jv.id === 'JV-401') {
      debit = 'Cash in Hand';
      credit = 'Credit Customers';
      narr = 'Cash receipt against credit ledger';
    } else if (jv.id === 'JV-402') {
      debit = 'HPCL Purchase Limit';
      credit = 'Bank Current';
      narr = 'Transfer of funds to HPCL bulk purchase reserve';
    } else if (jv.id === 'JV-403') {
      debit = 'Lubricants Reserve';
      credit = 'M/s Castrol Distributors';
      narr = 'Purchase of fresh lubricant bulk stock';
    }
    return {
      id: jv.id,
      voucherNo: jv.id,
      date: jv.date,
      debitAccount: debit,
      creditAccount: credit,
      amount: jv.amount,
      narration: narr
    };
  }),
  TankStockEntry: [
    {
      id: 'TS-1',
      date: '2026-06-06',
      shift: 'Shift A',
      tankNumber: 'Tank 1 (Petrol MS)',
      fuelType: 'Petrol',
      openingStock: 6540,
      receivedQuantity: 0,
      salesQuantity: 1540,
      closingStock: 5000,
      dipReading: 1100,
      waterLevel: 0,
      remarks: 'Standard shift logging, manual dipping'
    },
    {
      id: 'TS-2',
      date: '2026-06-06',
      shift: 'Shift A',
      tankNumber: 'Tank 2 (Diesel HSD - A)',
      fuelType: 'Diesel',
      openingStock: 19800,
      receivedQuantity: 10000,
      salesQuantity: 4800,
      closingStock: 25000,
      dipReading: 2600,
      waterLevel: 5,
      remarks: 'Load decanted from tanker J-9005'
    }
  ],
  CashMovement: [
    {
      id: 'CM-101',
      date: '2026-06-08',
      type: 'CASH_IN',
      amount: 150000,
      source: 'Safe Vault',
      destination: 'Counter Till',
      remarks: 'Opening cashier cash setup',
      createdBy: 'Anand Ashok',
      createdAt: '2026-06-08T09:00:00.000Z',
      updatedAt: '2026-06-08T09:00:00.000Z'
    },
    {
      id: 'CM-102',
      date: '2026-06-08',
      type: 'BANK_DEPOSIT',
      amount: 100000,
      source: 'Counter Till',
      destination: 'SBI Current Account',
      remarks: 'Daily evening deposit to bank',
      createdBy: 'Anand Ashok',
      createdAt: '2026-06-08T18:00:00.000Z',
      updatedAt: '2026-06-08T18:00:00.000Z'
    },
    {
      id: 'CM-103',
      date: '2026-06-09',
      type: 'CASH_IN',
      amount: 75000,
      source: 'Safe Vault',
      destination: 'Counter Till',
      remarks: 'Daily cash replenishment',
      createdBy: 'Anand Ashok',
      createdAt: '2026-06-09T09:00:00.000Z',
      updatedAt: '2026-06-09T09:00:00.000Z'
    },
    {
      id: 'CM-104',
      date: '2026-06-09',
      type: 'CASH_OUT',
      amount: 12000,
      source: 'Counter Till',
      destination: 'Office Stationery Shop',
      remarks: 'Cash payout for printer paper and binders',
      createdBy: 'Staff Cashier',
      createdAt: '2026-06-09T14:30:00.000Z',
      updatedAt: '2026-06-09T14:30:00.000Z'
    }
  ]
};

/**
 * Validates if MongoDB connection is open and active.
 */
export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Discriminates model queries if multiple schemas map to the same physical MongoDB collection.
 */
function getModelQueryFilter(modelName: string, filter: any = {}): any {
  const finalFilter = { ...filter };
  if (modelName === 'TankStock') {
    finalFilter.tankName = { $exists: true };
  } else if (modelName === 'TankStockEntry') {
    finalFilter.date = { $exists: true };
  }
  return finalFilter;
}

/**
 * Central CRUD Abstraction to support seamless switching between MongoDB Atlas and In-Memory fallback datasets.
 */
export const dbStore = {
  async find(modelName: string, filter: any = {}, sort: any = null): Promise<any[]> {
    if (isDbConnected()) {
      const finalFilter = getModelQueryFilter(modelName, filter);
      const query = MODEL_MAP[modelName].find(finalFilter);
      if (sort) {
        query.sort(sort);
      }
      return await query.exec();
    }

    // In-memory filter fallback
    let list = [...(IN_MEMORY_STORE[modelName] || [])];
    
    // Simple filter matching
    if (filter && Object.keys(filter).length > 0) {
      list = list.filter(item => {
        for (const key of Object.keys(filter)) {
          if (item[key] !== filter[key]) return false;
        }
        return true;
      });
    }

    // Simple sorts
    if (sort) {
      const sortKey = Object.keys(sort)[0];
      const sortDir = sort[sortKey];
      list.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA < valB) return sortDir === -1 ? 1 : -1;
        if (valA > valB) return sortDir === -1 ? -1 : 1;
        return 0;
      });
    }

    return list;
  },

  async findOne(modelName: string, filter: any): Promise<any | null> {
    if (isDbConnected()) {
      const finalFilter = getModelQueryFilter(modelName, filter);
      return await MODEL_MAP[modelName].findOne(finalFilter).exec();
    }

    const list = IN_MEMORY_STORE[modelName] || [];
    const found = list.find((item: any) => {
      for (const key of Object.keys(filter)) {
        if (item[key] !== filter[key]) return false;
      }
      return true;
    });

    return found ? { ...found } : null;
  },

  async create(modelName: string, payload: any): Promise<any> {
    if (isDbConnected()) {
      return await MODEL_MAP[modelName].create(payload);
    }

    // Generate unique ID if not present
    const idPrefix = modelName === 'User' ? 'USR' :
                     modelName === 'FuelSale' ? 'SL' :
                     modelName === 'Collection' ? 'COL' :
                     modelName === 'HpclLoad' ? 'IND' :
                     modelName === 'TankStock' ? 'TNK' :
                     modelName === 'Lubricant' ? 'LUB' :
                     modelName === 'Tanker' ? 'TKR' : 'CST';

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const mockId = payload.id || `${idPrefix}-${randomSuffix}`;
    const newDoc = {
      id: mockId,
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    IN_MEMORY_STORE[modelName].push(newDoc);
    return newDoc;
  },

  async findOneAndUpdate(modelName: string, filter: any, update: any): Promise<any | null> {
    if (isDbConnected()) {
      const finalFilter = getModelQueryFilter(modelName, filter);
      return await MODEL_MAP[modelName].findOneAndUpdate(finalFilter, update, { new: true, runValidators: true }).exec();
    }

    const list = IN_MEMORY_STORE[modelName] || [];
    const index = list.findIndex((item: any) => {
      for (const key of Object.keys(filter)) {
        if (item[key] !== filter[key]) return false;
      }
      return true;
    });

    if (index === -1) return null;

    const currentDoc = list[index];
    const updatePayload = update.$set ? update.$set : update;

    const updatedDoc = {
      ...currentDoc,
      ...updatePayload,
      updatedAt: new Date().toISOString()
    };

    list[index] = updatedDoc;
    return updatedDoc;
  },

  async findOneAndDelete(modelName: string, filter: any): Promise<any | null> {
    if (isDbConnected()) {
      const finalFilter = getModelQueryFilter(modelName, filter);
      return await MODEL_MAP[modelName].findOneAndDelete(finalFilter).exec();
    }

    const list = IN_MEMORY_STORE[modelName] || [];
    const index = list.findIndex((item: any) => {
      for (const key of Object.keys(filter)) {
        if (item[key] !== filter[key]) return false;
      }
      return true;
    });

    if (index === -1) return null;

    const deleted = list.splice(index, 1)[0];
    return deleted;
  },

  async aggregate(modelName: string, pipeline: any[]): Promise<any[]> {
    if (isDbConnected()) {
      return await MODEL_MAP[modelName].aggregate(pipeline).exec();
    }

    // Simple custom aggregation emulation for Dashboard Metrics fallback
    const list = IN_MEMORY_STORE[modelName] || [];

    if (modelName === 'FuelSale') {
      // Check if grouping by null
      const groupStage = pipeline.find(p => p.$group);
      if (groupStage) {
        const idField = groupStage.$group._id;
        if (idField === null) {
          // Total fuel sales aggregation
          const totalLitersSold = list.reduce((sum, item) => sum + (item.salesQty || 0), 0);
          const totalRevenueAmt = list.reduce((sum, item) => sum + (item.totalAmt || 0), 0);
          return [{
            _id: null,
            totalLitersSold,
            totalRevenueAmt,
            nozzleRecordCount: list.length
          }];
        } else if (idField === '$fuelType') {
          // Fuel sales by type aggregation
          const types: Record<string, { litersSold: number, revenue: number }> = {};
          for (const item of list) {
            const ftype = item.fuelType || 'Petrol';
            if (!types[ftype]) {
              types[ftype] = { litersSold: 0, revenue: 0 };
            }
            types[ftype].litersSold += item.salesQty || 0;
            types[ftype].revenue += item.totalAmt || 0;
          }
          return Object.entries(types).map(([key, val]) => ({
            _id: key,
            litersSold: val.litersSold,
            revenue: val.revenue
          }));
        }
      }
    }

    if (modelName === 'Collection') {
      const groupStage = pipeline.find(p => p.$group);
      if (groupStage) {
        const totalCashReceived = list.reduce((sum, item) => sum + (item.cashReceived || 0), 0);
        const totalCashCalculated = list.reduce((sum, item) => sum + (item.cashCalculated || 0), 0);
        const netShortageExcess = list.reduce((sum, item) => sum + (item.shortageExcess || 0), 0);
        const totalUPIAndCards = list.reduce((sum, item) => {
          return sum + (item.paytmReceived || 0) + (item.phonepeReceived || 0) + (item.gpayReceived || 0) + (item.swipeCardReceived || 0);
        }, 0);
        const totalLoyalty = list.reduce((sum, item) => sum + (item.dtPlusReceived || 0), 0);
        const totalCreditUnbilled = list.reduce((sum, item) => sum + (item.creditOutstanding || 0), 0);
        const aggregateCollectionAmt = list.reduce((sum, item) => sum + (item.totalCollection || 0), 0);

        return [{
          _id: null,
          totalCashReceived,
          totalCashCalculated,
          netShortageExcess,
          totalUPIAndCards,
          totalLoyalty,
          totalCreditUnbilled,
          aggregateCollectionAmt
        }];
      }
    }

    return list;
  },

  async countDocuments(modelName: string): Promise<number> {
    if (isDbConnected()) {
      return await MODEL_MAP[modelName].countDocuments();
    }
    return (IN_MEMORY_STORE[modelName] || []).length;
  }
};
