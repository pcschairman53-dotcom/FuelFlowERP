/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DailyFuelSale {
  id: string;
  date: string;
  nozzleId: string;
  fuelType: 'Petrol' | 'Diesel' | 'Speed Petrol';
  openingReading: number;
  closingReading: number;
  testingQty: number; // liters tested/returned
  salesQty: number; // calculated liters
  rate: number;
  totalAmt: number;
  shift: 'Shift A (06:00 - 14:00)' | 'Shift B (14:00 - 22:00)' | 'Shift C (22:00 - 06:00)';
  operator: string;
  status: 'Completed' | 'Pending Verification';
}

export interface CollectionBreakdown {
  id: string;
  date: string;
  shift: string;
  cashCalculated: number;
  cashReceived: number;
  shortageExcess: number;
  paytmReceived: number;
  phonepeReceived: number;
  gpayReceived: number;
  dtPlusReceived: number; // HPCL Digital loyalty
  swipeCardReceived: number;
  creditOutstanding: number;
  totalCollection: number;
  status: 'Verified' | 'Discrepancy' | 'Draft';
}

export interface CashEntry {
  id: string;
  dateTime: string;
  type: 'Cash Receipt' | 'Bank Deposit' | 'Expense Outflow' | 'Safe Transfer';
  amount: number;
  receivedFromOrPaidTo: string;
  handledBy: string;
  receiptNumber: string;
  remarks: string;
  account: 'Petty Cash Box' | 'Main Pump Safe';
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  branch: string;
  currentBalance: number;
  bankType: 'Escrow' | 'Current Account' | 'HPCL Limit OD';
  lastReconciled: string;
}

export interface BankTransaction {
  id: string;
  dateTime: string;
  bankAccountId: string;
  type: 'Credit' | 'Debit';
  category: 'Fuel Sales Deposit' | 'Lubricant Sales' | 'HPCL Indent Payment' | 'Direct Outflow' | 'Reconciliation Adjust';
  amount: number;
  referenceNumber: string;
  status: 'Cleared' | 'Uncleared';
  remarks: string;
}

export interface HpclIndentOrder {
  id: string;
  indentDate: string;
  indentNo: string;
  productType: 'Petrol (MS)' | 'Diesel (HSD)' | 'Speed (Premium MS)';
  quantityKl: number; // in Kiloliters
  totalAmount: number;
  paymentBank: string;
  utrNo: string;
  orderStatus: 'Indent Placed' | 'Paid & Pending HPCL Dispatch' | 'In-Transit' | 'Decanted' | 'Cancelled';
  assignedTankerNo: string;
  eta: string;
  actualArrivalDate?: string;
  dispatchedAt?: string;
}

export interface TankStock {
  id: string;
  tankName: string; // Tank 1 (Petrol), Tank 2 (Diesel 1), Tank 3 (Diesel 2)
  fuelType: 'Petrol' | 'Diesel' | 'Speed Petrol';
  capacityLiters: number;
  currentLevelLiters: number;
  dipReadingMm: number; // Water dip vs Fuel dip
  waterLevelMm: number;
  lastUpdatedDip: string;
  status: 'Normal' | 'Low Stock' | 'Critical';
}

export interface LubricantItem {
  id: string;
  productName: string; // e.g. HP Neo 15W-40 5L
  grade: string; // 15W-40, 20W-40, Gear oil etc
  skuCode: string;
  boxQty: number; // box count
  unitsPerBox: number;
  totalUnits: number;
  unitPrice: number;
  totalValue: number;
  reorderLevel: number;
  rackLocation: string;
}

export interface Tanker {
  id: string;
  tankerNumber: string; // e.g. MH-43-Y-5421
  capacityKl: number;
  transporterName: string;
  driverName: string;
  driverMobile: string;
  currentStatus: 'Idle' | 'Dispatched to HPCL Depot' | 'In-Transit to Pump' | 'Decanting at Pump' | 'Active' | 'In Transit' | 'Delivered' | string;
  gpsLocation: string;
  activeOrderId?: string;
  vehicleNumber?: string;
  capacity?: number;
  fuelType?: string;
  loadingDate?: string;
  dispatchDate?: string;
  deliveryDate?: string;
  sourceLocation?: string;
  destinationLocation?: string;
  status?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreditCustomer {
  id: string;
  name: string;
  firmName: string;
  mobile: string;
  creditLimit: number;
  outstandingBalance: number;
  unbilledAmount: number;
  lastPaymentDate: string;
  billingPeriod: 'Weekly' | 'Monthly' | '15 Days';
  vehicleList: string[]; // Vehicles registered for fuel authorization
  status: 'Active' | 'Suspended' | 'Limit Exceeded';
  customerCode?: string;
  customerName?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  customerType?: 'Retail' | 'Fleet' | 'Corporate';
  createdAt?: string;
}

export interface ExpenseEntry {
  id: string;
  date: string;
  category: 'Salary & Wages' | 'Power & Electricity' | 'Generator Fuel' | 'Maintenance & Repairs' | 'Statutory License Fees' | 'Brokerage & Commission' | 'Printing & Stationery' | 'Miscellaneous';
  amount: number;
  paidTo: string;
  paymentMode: 'Cash' | 'Bank Online' | 'Cheque';
  approvedBy: string;
  receiptUrl?: string;
  remarks: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Manager' | 'Shift Supervisor' | 'Data Entry Operator';
  active: boolean;
  assignedShift?: string;
  lastActive: string;
  permissions: string[];
}

export interface CollectionEntry {
  _id?: string;
  date: string;
  shift: string;
  collectionType: 'Cash' | 'Paytm' | 'DT Plus' | 'Credit';
  amount: number;
  operator: string;
  remarks?: string;
  status: 'Verified' | 'Draft';
  createdAt?: string;
  updatedAt?: string;
}

export interface TankStockEntry {
  id?: string;
  _id?: string;
  date: string;
  shift: string;
  tankNumber: string;
  fuelType: string;
  openingStock: number;
  receivedQuantity: number;
  salesQuantity: number;
  closingStock: number;
  dipReading: number;
  waterLevel: number;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JournalVoucher {
  id: string;
  voucherNo: string;
  date: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  narration: string;
  createdAt?: string;
}


