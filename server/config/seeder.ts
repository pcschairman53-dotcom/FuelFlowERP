/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User } from '../models/User';
import { FuelSale } from '../models/FuelSale';
import { Collection } from '../models/Collection';
import { HpclLoad } from '../models/HpclLoad';
import { TankStock } from '../models/TankStock';
import { Lubricant } from '../models/Lubricant';
import { Tanker } from '../models/Tanker';
import { Customer } from '../models/Customer';
import { Expense } from '../models/Expense';
import { JournalVoucher } from '../models/JournalVoucher';

// Initial arrays imported directly from the data feed
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
  ACCOUNTING_METRICS
} from '../../src/data';

/**
 * Checks and Seeds MongoDB Atlas collections with primary FuelFlow ERP datasets.
 */
export async function seedDatabase() {
  console.log('🔄 Checking database collections for initialization...');

  try {
    // 1. Seed Users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log(`🌱 Seeding ${INITIAL_USERS.length} users into 'users' collection...`);
      await User.insertMany(INITIAL_USERS);
    }

    // 2. Seed Fuel Sales
    const saleCount = await FuelSale.countDocuments();
    if (saleCount === 0) {
      console.log(`🌱 Seeding ${INITIAL_FUEL_SALES.length} fuel sales into 'fuel_sales' collection...`);
      await FuelSale.insertMany(INITIAL_FUEL_SALES);
    }

    // 3. Seed Collections
    const collectionCount = await Collection.countDocuments();
    if (collectionCount === 0) {
      console.log(`🌱 Seeding ${INITIAL_COLLECTIONS.length} collections into 'collections' collection...`);
      await Collection.insertMany(INITIAL_COLLECTIONS);
    }

    // 4. Seed HPCL Loads
    const loadCount = await HpclLoad.countDocuments();
    if (loadCount === 0) {
      console.log(`🌱 Seeding ${INITIAL_HPCL_INDENTS.length} HPCL loads into 'hpcl_loads' collection...`);
      await HpclLoad.insertMany(INITIAL_HPCL_INDENTS);
    }

    // 5. Seed Tank Stocks
    const tankCount = await TankStock.countDocuments();
    if (tankCount === 0) {
      console.log(`🌱 Seeding ${INITIAL_TANK_STOCK.length} tank stocks into 'tank_stocks' collection...`);
      await TankStock.insertMany(INITIAL_TANK_STOCK);
    }

    // 6. Seed Lubricants
    const lubeCount = await Lubricant.countDocuments();
    if (lubeCount === 0) {
      console.log(`🌱 Seeding ${INITIAL_LUBRICANTS.length} lubricants into 'lubricants' collection...`);
      await Lubricant.insertMany(INITIAL_LUBRICANTS);
    }

    // 7. Seed Tankers
    const tankerCount = await Tanker.countDocuments();
    if (tankerCount === 0) {
      console.log(`🌱 Seeding ${INITIAL_TANKERS.length} tankers into 'tankers' collection...`);
      await Tanker.insertMany(INITIAL_TANKERS);
    }

    // 8. Seed Credit Customers
    const customerCount = await Customer.countDocuments();
    if (customerCount === 0) {
      console.log(`🌱 Seeding ${INITIAL_CREDIT_CUSTOMERS.length} credit customers into 'customers' collection...`);
      await Customer.insertMany(INITIAL_CREDIT_CUSTOMERS);
    }

    // 9. Seed Expenses
    const expenseCount = await Expense.countDocuments();
    if (expenseCount === 0) {
      console.log(`🌱 Seeding ${INITIAL_EXPENSES.length} expenses into 'expenses' collection...`);
      const payload = INITIAL_EXPENSES.map((e: any) => ({
        ...e,
        voucherNo: e.id,
        expenseDate: e.date,
        vendorName: e.paidTo,
        paymentMethod: e.paymentMode
      }));
      await Expense.insertMany(payload);
    }

    // 10. Seed Journal Vouchers
    const jvCount = await JournalVoucher.countDocuments();
    if (jvCount === 0) {
      console.log(`🌱 Seeding ${ACCOUNTING_METRICS.recentJournals.length} journal vouchers into 'journal_vouchers' collection...`);
      const payload = ACCOUNTING_METRICS.recentJournals.map((jv: any) => {
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
      });
      await JournalVoucher.insertMany(payload);
    }

    console.log('✅ Collection seeding verification complete!');
  } catch (err) {
    console.warn('⚠️ Seeding process encountered a minor warning:', err instanceof Error ? err.message : err);
  }
}
