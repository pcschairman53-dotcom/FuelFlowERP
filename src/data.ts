/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DailyFuelSale,
  CollectionBreakdown,
  CashEntry,
  BankAccount,
  BankTransaction,
  HpclIndentOrder,
  TankStock,
  LubricantItem,
  Tanker,
  CreditCustomer,
  ExpenseEntry,
  UserAccount
} from './types';

export const COMPANY_DETAILS = {
  name: 'Ashok Fuels - Retail Outlet HPCL',
  owner: 'Mr. Anand Ashok',
  dealershipCode: 'HPCL-RO-829120',
  address: 'National Highway 33, Ramgarh-Ranchi Road, Ramgarh, Jharkhand, 829122',
  vatTin: '20043819204V', // Jharkhand TIN starts with state code 20
  tagline: 'Fueling Jharkhand Mining, Logistics & Infrastructure since 1994',
  companyList: [
    { id: '1', name: 'Ashok Fuels - Ramgarh Terminal' },
    { id: '2', name: 'Ashok Petro Services - Ranchi Bypass' },
    { id: '3', name: 'Ashok Expressways - Bokaro Road' }
  ]
};

// Petrol Price in Jharkhand: ₹99.85 | Diesel Price in Jharkhand: ₹94.65 | Speed Petrol: ₹106.80
export const INITIAL_FUEL_SALES: DailyFuelSale[] = [
  {
    id: 'SL-001',
    date: '2026-06-05',
    nozzleId: 'NZ-P1',
    fuelType: 'Petrol',
    openingReading: 485120.5,
    closingReading: 486250.2,
    testingQty: 10.0,
    salesQty: 1119.7,
    rate: 99.85,
    totalAmt: 111802.05,
    shift: 'Shift A (06:00 - 14:00)',
    operator: 'Ramesh Sawant',
    status: 'Completed'
  },
  {
    id: 'SL-002',
    date: '2026-06-05',
    nozzleId: 'NZ-P2',
    fuelType: 'Petrol',
    openingReading: 320140.0,
    closingReading: 321095.5,
    testingQty: 5.0,
    salesQty: 950.5,
    rate: 99.85,
    totalAmt: 94907.43,
    shift: 'Shift A (06:00 - 14:00)',
    operator: 'Ramesh Sawant',
    status: 'Completed'
  },
  {
    id: 'SL-003',
    date: '2026-06-05',
    nozzleId: 'NZ-D1',
    fuelType: 'Diesel',
    openingReading: 914022.1,
    closingReading: 916840.4,
    testingQty: 20.0,
    salesQty: 2798.3,
    rate: 94.65,
    totalAmt: 264859.10,
    shift: 'Shift A (06:00 - 14:00)',
    operator: 'Sunil Gaikwad',
    status: 'Completed'
  },
  {
    id: 'SL-004',
    date: '2026-06-05',
    nozzleId: 'NZ-D2',
    fuelType: 'Diesel',
    openingReading: 730411.5,
    closingReading: 733560.8,
    testingQty: 0.0,
    salesQty: 3149.3,
    rate: 94.65,
    totalAmt: 298081.25,
    shift: 'Shift A (06:00 - 14:00)',
    operator: 'Sunil Gaikwad',
    status: 'Completed'
  },
  {
    id: 'SL-005',
    date: '2026-06-05',
    nozzleId: 'NZ-SP1',
    fuelType: 'Speed Petrol',
    openingReading: 120402.3,
    closingReading: 120890.8,
    testingQty: 5.0,
    salesQty: 483.5,
    rate: 106.80,
    totalAmt: 51637.80,
    shift: 'Shift A (06:00 - 14:00)',
    operator: 'Amol Shrikhande',
    status: 'Completed'
  },
  {
    id: 'SL-006',
    date: '2026-06-05',
    nozzleId: 'NZ-P1',
    fuelType: 'Petrol',
    openingReading: 486250.2,
    closingReading: 487560.0,
    testingQty: 10.0,
    salesQty: 1299.8,
    rate: 99.85,
    totalAmt: 129785.03,
    shift: 'Shift B (14:00 - 22:00)',
    operator: 'Dilip Tambe',
    status: 'Completed'
  },
  {
    id: 'SL-007',
    date: '2026-06-05',
    nozzleId: 'NZ-D1',
    fuelType: 'Diesel',
    openingReading: 916840.4,
    closingReading: 920050.2,
    testingQty: 10.0,
    salesQty: 3199.8,
    rate: 94.65,
    totalAmt: 302861.07,
    shift: 'Shift B (14:00 - 22:00)',
    operator: 'Karan Singh',
    status: 'Completed'
  },
  {
    id: 'SL-008',
    date: '2026-06-05',
    nozzleId: 'NZ-D2',
    fuelType: 'Diesel',
    openingReading: 733560.8,
    closingReading: 736910.1,
    testingQty: 15.0,
    salesQty: 3334.3,
    rate: 94.65,
    totalAmt: 315591.50,
    shift: 'Shift B (14:00 - 22:00)',
    operator: 'Karan Singh',
    status: 'Completed'
  },
  {
    id: 'SL-010',
    date: '2026-06-06',
    nozzleId: 'NZ-P1',
    fuelType: 'Petrol',
    openingReading: 487560.0,
    closingReading: 488120.4,
    testingQty: 5.0,
    salesQty: 555.4,
    rate: 99.85,
    totalAmt: 55456.69,
    shift: 'Shift C (22:00 - 06:00)',
    operator: 'Vijay Patwardhan',
    status: 'Pending Verification'
  },
  {
    id: 'SL-011',
    date: '2026-06-06',
    nozzleId: 'NZ-D1',
    fuelType: 'Diesel',
    openingReading: 920050.2,
    closingReading: 921240.6,
    testingQty: 10.0,
    salesQty: 1180.4,
    rate: 94.65,
    totalAmt: 111724.86,
    shift: 'Shift C (22:00 - 06:00)',
    operator: 'Vijay Patwardhan',
    status: 'Pending Verification'
  }
];

export const INITIAL_COLLECTIONS: CollectionBreakdown[] = [
  {
    id: 'COL-001',
    date: '2026-06-05',
    shift: 'Shift A (06:00 - 14:00)',
    cashCalculated: 345000.00,
    cashReceived: 344850.00,
    shortageExcess: -150.00,
    paytmReceived: 125400.00,
    phonepeReceived: 98500.00,
    gpayReceived: 62450.00,
    dtPlusReceived: 90000.00,
    swipeCardReceived: 42000.00,
    creditOutstanding: 155000.00,
    totalCollection: 918200.00,
    status: 'Verified'
  },
  {
    id: 'COL-002',
    date: '2026-06-05',
    shift: 'Shift B (14:00 - 22:00)',
    cashCalculated: 380420.00,
    cashReceived: 380480.00,
    shortageExcess: 60.00,
    paytmReceived: 140200.00,
    phonepeReceived: 110400.00,
    gpayReceived: 71200.00,
    dtPlusReceived: 115000.00,
    swipeCardReceived: 56000.00,
    creditOutstanding: 215000.00,
    totalCollection: 1098220.00,
    status: 'Verified'
  },
  {
    id: 'COL-003',
    date: '2026-06-06',
    shift: 'Shift C (22:00 - 06:00)',
    cashCalculated: 85200.00,
    cashReceived: 85200.00,
    shortageExcess: 0,
    paytmReceived: 21400.00,
    phonepeReceived: 18100.00,
    gpayReceived: 12400.00,
    dtPlusReceived: 15000.00,
    swipeCardReceived: 10000.00,
    creditOutstanding: 35000.00,
    totalCollection: 197100.00,
    status: 'Draft'
  }
];

export const INITIAL_CASH_LOGS: CashEntry[] = [
  {
    id: 'CSH-001',
    dateTime: '2026-06-05 14:15',
    type: 'Safe Transfer',
    amount: 344850.00,
    receivedFromOrPaidTo: 'Operator Ramesh Sawant (Shift A)',
    handledBy: 'Manager Sunil Sharma',
    receiptNumber: 'AF-SA-0294',
    remarks: 'Reconciliation complete for morning Shift A Petrol & Speed card sales.',
    account: 'Main Pump Safe'
  },
  {
    id: 'CSH-002',
    dateTime: '2026-06-05 14:30',
    type: 'Safe Transfer',
    amount: 250000.00,
    receivedFromOrPaidTo: 'Operator Sunil Gaikwad (Shift A)',
    handledBy: 'Manager Sunil Sharma',
    receiptNumber: 'AF-SA-0295',
    remarks: 'Heavy machinery and dumper fleet bulk diesel drop to safe.',
    account: 'Main Pump Safe'
  },
  {
    id: 'CSH-003',
    dateTime: '2026-06-05 16:00',
    type: 'Bank Deposit',
    amount: 500000.00,
    receivedFromOrPaidTo: 'SBI Cash Deposit Machine (CDM) Ramgarh',
    handledBy: 'Cash Rep Ajay Kumar',
    receiptNumber: 'SBI-CDM-94021',
    remarks: 'Physical cash transit to SBI Main Current Account.',
    account: 'Main Pump Safe'
  },
  {
    id: 'CSH-004',
    dateTime: '2026-06-05 17:45',
    type: 'Expense Outflow',
    amount: 4500.00,
    receivedFromOrPaidTo: 'Ranchi Health Diagnostics (Staff Checkup)',
    handledBy: 'Manager Sunil Sharma',
    receiptNumber: 'PTY-410',
    remarks: 'Nozzle operator thermal emergency health checkups cash payout.',
    account: 'Petty Cash Box'
  },
  {
    id: 'CSH-005',
    dateTime: '2026-06-06 09:15',
    type: 'Safe Transfer',
    amount: 15000.00,
    receivedFromOrPaidTo: 'Petty Cash Box Replenishment',
    handledBy: 'Manager Sunil Sharma',
    receiptNumber: 'PTY-ST-194',
    remarks: 'Replenishment of loose change for heavy truck driver cash returns.',
    account: 'Petty Cash Box'
  }
];

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'BNK-001',
    bankName: 'State Bank of India',
    accountNumber: 'SBI-38491029410',
    branch: 'Ramgarh Cantt Branch',
    currentBalance: 2415820.50,
    bankType: 'Current Account',
    lastReconciled: '2026-06-05 18:00'
  },
  {
    id: 'BNK-002',
    bankName: 'HDFC Bank Ltd',
    accountNumber: 'HDF-50201094382',
    branch: 'Ranchi Main Bypass',
    currentBalance: 4120400.00,
    bankType: 'HPCL Limit OD',
    lastReconciled: '2026-06-05 17:30'
  },
  {
    id: 'BNK-003',
    bankName: 'ICICI Bank',
    accountNumber: 'ICI-09411039824',
    branch: 'Ranchi Kutchery Road',
    currentBalance: 840290.00,
    bankType: 'Escrow',
    lastReconciled: '2026-06-04 15:00'
  }
];

export const INITIAL_BANK_TRANSACTIONS: BankTransaction[] = [
  {
    id: 'TXN-101',
    dateTime: '2026-06-05 11:30',
    bankAccountId: 'BNK-002',
    type: 'Debit',
    category: 'HPCL Indent Payment',
    amount: 2850000.00,
    referenceNumber: 'UTR-HDFCR52026060599',
    status: 'Cleared',
    remarks: 'Pre-paid load dispatch sent to HPCL Jasidih Depot Account for 30KL Diesel Trailer.'
  },
  {
    id: 'TXN-102',
    dateTime: '2026-06-05 16:30',
    bankAccountId: 'BNK-001',
    type: 'Credit',
    category: 'Fuel Sales Deposit',
    amount: 500000.00,
    referenceNumber: 'SBI-DEP-029410',
    status: 'Cleared',
    remarks: 'CDM physical deposit of outlet cash collection.'
  },
  {
    id: 'TXN-103',
    dateTime: '2026-06-05 23:45',
    bankAccountId: 'BNK-003',
    type: 'Credit',
    category: 'Fuel Sales Deposit',
    amount: 324500.00,
    referenceNumber: 'UPI-SETTLE-0605',
    status: 'Cleared',
    remarks: 'Daily Paytm Business Merchant & UPI consolidated settlement.'
  },
  {
    id: 'TXN-104',
    dateTime: '2026-06-06 08:30',
    bankAccountId: 'BNK-002',
    type: 'Debit',
    category: 'HPCL Indent Payment',
    amount: 1250000.00,
    referenceNumber: 'UTR-HDFCR52026060611',
    status: 'Cleared',
    remarks: 'RTGS load dispatch to Bokaro HPCL Terminal Account for 12KL Petrol MS loading.'
  }
];

export const INITIAL_HPCL_INDENTS: HpclIndentOrder[] = [
  {
    id: 'IND-901',
    indentDate: '2026-06-04',
    indentNo: 'HP-IND-390412',
    productType: 'Diesel (HSD)',
    quantityKl: 30.0,
    totalAmount: 2775000.00,
    paymentBank: 'HDFC Bank Ltd',
    utrNo: 'UTR-HDFCR52026060481',
    orderStatus: 'Decanted',
    assignedTankerNo: 'JH-02-G-8201',
    eta: '2026-06-05 11:00',
    actualArrivalDate: '2026-06-05 11:30',
    dispatchedAt: '2026-06-04 18:00'
  },
  {
    id: 'IND-902',
    indentDate: '2026-06-05',
    indentNo: 'HP-IND-390589',
    productType: 'Diesel (HSD)',
    quantityKl: 24.0,
    totalAmount: 2220000.00,
    paymentBank: 'HDFC Bank Ltd',
    utrNo: 'UTR-HDFCR52026060599',
    orderStatus: 'In-Transit',
    assignedTankerNo: 'JH-09-Y-5421',
    eta: '2026-06-06 14:00',
    dispatchedAt: '2026-06-05 20:30'
  },
  {
    id: 'IND-903',
    indentDate: '2026-06-06',
    indentNo: 'HP-IND-390611',
    productType: 'Petrol (MS)',
    quantityKl: 12.0,
    totalAmount: 1250400.00,
    paymentBank: 'HDFC Bank Ltd',
    utrNo: 'UTR-HDFCR52026060611',
    orderStatus: 'Paid & Pending HPCL Dispatch',
    assignedTankerNo: 'JH-01-PQ-9005',
    eta: '2026-06-07 09:00'
  }
];

export const INITIAL_TANK_STOCK: TankStock[] = [
  {
    id: 'TNK-1',
    tankName: 'Tank 1 (Petrol MS)',
    fuelType: 'Petrol',
    capacityLiters: 20000,
    currentLevelLiters: 6540,
    dipReadingMm: 1205,
    waterLevelMm: 0,
    lastUpdatedDip: '2026-06-06 06:15',
    status: 'Low Stock'
  },
  {
    id: 'TNK-2',
    tankName: 'Tank 2 (Diesel HSD - A)',
    fuelType: 'Diesel',
    capacityLiters: 30000,
    currentLevelLiters: 19800,
    dipReadingMm: 2410,
    waterLevelMm: 5,
    lastUpdatedDip: '2026-06-06 06:20',
    status: 'Normal'
  },
  {
    id: 'TNK-3',
    tankName: 'Tank 3 (Diesel HSD - B)',
    fuelType: 'Diesel',
    capacityLiters: 20000,
    currentLevelLiters: 18450,
    dipReadingMm: 2540,
    waterLevelMm: 0,
    lastUpdatedDip: '2026-06-06 06:20',
    status: 'Normal'
  },
  {
    id: 'TNK-4',
    tankName: 'Tank 4 (Speed Premium MS)',
    fuelType: 'Speed Petrol',
    capacityLiters: 15000,
    currentLevelLiters: 2150,
    dipReadingMm: 805,
    waterLevelMm: 2,
    lastUpdatedDip: '2026-06-06 06:30',
    status: 'Critical'
  }
];

export const INITIAL_LUBRICANTS: LubricantItem[] = [
  {
    id: 'LUB-101',
    productName: 'HP Neo Synth 15W-40 5L',
    grade: '15W-40 Synthetic Blend',
    skuCode: 'LUB-MS-15W40-05L',
    boxQty: 14,
    unitsPerBox: 4,
    totalUnits: 56,
    unitPrice: 2450.00,
    totalValue: 137200.00,
    reorderLevel: 10,
    rackLocation: 'Aisles A-3'
  },
  {
    id: 'LUB-102',
    productName: 'HP Cruise 20W-50 Petrol Oil 1L',
    grade: '20W-50 Petrol Mineral',
    skuCode: 'LUB-MS-20W50-01L',
    boxQty: 25,
    unitsPerBox: 20,
    totalUnits: 500,
    unitPrice: 380.00,
    totalValue: 190000.00,
    reorderLevel: 40,
    rackLocation: 'Aisles B-1'
  },
  {
    id: 'LUB-103',
    productName: 'HP Milcy Turbo Diesel Engine Oil 3L',
    grade: '15W-40 API CH-4',
    skuCode: 'LUB-DS-MILCY-03L',
    boxQty: 18,
    unitsPerBox: 6,
    totalUnits: 108,
    unitPrice: 1120.00,
    totalValue: 120960.00,
    reorderLevel: 15,
    rackLocation: 'Aisles C-2'
  },
  {
    id: 'LUB-104',
    productName: 'HP Racer 4T Bike Oil 0.9L',
    grade: '20W-40 JASO MA2',
    skuCode: 'LUB-BK-RC4T-0.9L',
    boxQty: 32,
    unitsPerBox: 24,
    totalUnits: 768,
    unitPrice: 325.00,
    totalValue: 249600.00,
    reorderLevel: 60,
    rackLocation: 'Aisles A-1'
  },
  {
    id: 'LUB-105',
    productName: 'HP Gear Oil EP 90 5L',
    grade: 'GL-4 Industrial Gear',
    skuCode: 'LUB-GR-EP90-05L',
    boxQty: 5,
    unitsPerBox: 4,
    totalUnits: 20,
    unitPrice: 1650.00,
    totalValue: 3300.00,
    reorderLevel: 8,
    rackLocation: 'Cabinet D-2'
  }
];

export const INITIAL_TANKERS: Tanker[] = [
  {
    id: 'TKR-01',
    tankerNumber: 'JH-02-G-8201',
    capacityKl: 30,
    transporterName: 'Jharkhand Mining & Bulk Carriers',
    driverName: 'Sardar Baldev Singh',
    driverMobile: '+91 98452 83912',
    currentStatus: 'Idle',
    gpsLocation: 'RO Ramgarh Yard'
  },
  {
    id: 'TKR-02',
    tankerNumber: 'JH-09-Y-5421',
    capacityKl: 24,
    transporterName: 'Chotanagpur Petroleum Transport',
    driverName: 'Harish Chandra Mahto',
    driverMobile: '+91 92041 38210',
    currentStatus: 'In-Transit to Pump',
    gpsLocation: 'Dhanbad-Ranchi Expressway Hwy Sector 2 (54 km to RO)',
    activeOrderId: 'IND-902'
  },
  {
    id: 'TKR-03',
    tankerNumber: 'JH-01-PQ-9005',
    capacityKl: 12,
    transporterName: 'Jharkhand Mining & Bulk Carriers',
    driverName: 'Devender Kumar Yadav',
    driverMobile: '+91 88401 29402',
    currentStatus: 'Dispatched to HPCL Depot',
    gpsLocation: 'Jasidih HPCL Terminal Depot Queue #14',
    activeOrderId: 'IND-903'
  },
  {
    id: 'TKR-04',
    tankerNumber: 'JH-10-AA-5544',
    capacityKl: 24,
    transporterName: 'Birsa Freight Movers',
    driverName: 'Lakhbir Singh',
    driverMobile: '+91 76041 83921',
    currentStatus: 'Idle',
    gpsLocation: 'Bokaro Oil Terminal Logistics Shed'
  }
];

export const INITIAL_CREDIT_CUSTOMERS: CreditCustomer[] = [
  {
    id: 'CST-001',
    name: 'Chotanagpur Coal Movers Ltd',
    firmName: 'Chotanagpur Coal Movers Pvt Ltd',
    mobile: '+91 97429 80921',
    creditLimit: 1500000.00,
    outstandingBalance: 845210.00,
    unbilledAmount: 124500.00,
    lastPaymentDate: '2026-06-01',
    billingPeriod: 'Monthly',
    vehicleList: ['JH-02-Y-4412', 'JH-02-Y-4413', 'JH-10-Q-8820', 'JH-10-P-1120'],
    status: 'Active'
  },
  {
    id: 'CST-002',
    name: 'Birsa Bus Syndicate operator',
    firmName: 'Birsa Intercity Travel & Tourist Coop',
    mobile: '+91 92041 93021',
    creditLimit: 500000.00,
    outstandingBalance: 492100.50,
    unbilledAmount: 42000.00,
    lastPaymentDate: '2026-05-28',
    billingPeriod: '15 Days',
    vehicleList: ['JH-01-E-5060', 'JH-01-E-5070', 'JH-01-E-5080'],
    status: 'Limit Exceeded'
  },
  {
    id: 'CST-003',
    name: 'Ramgarh Stone Quarry & Grits',
    firmName: 'Ramgarh Stone Quarry & Grits Pvt Ltd',
    mobile: '+91 81049 32011',
    creditLimit: 300000.00,
    outstandingBalance: 120400.00,
    unbilledAmount: 15000.00,
    lastPaymentDate: '2026-06-04',
    billingPeriod: 'Weekly',
    vehicleList: ['JH-24-A-8902', 'JH-24-A-1402'],
    status: 'Active'
  },
  {
    id: 'CST-004',
    name: 'Munda Bricks & Construction Co',
    firmName: 'Munda Infra & Clay Bricks Ltd',
    mobile: '+91 74011 29304',
    creditLimit: 800000.00,
    outstandingBalance: 785000.00,
    unbilledAmount: 95000.00,
    lastPaymentDate: '2026-05-15',
    billingPeriod: 'Monthly',
    vehicleList: ['JH-02-Z-2234', 'JH-02-Z-3211', 'JH-02-AX-5561'],
    status: 'Suspended'
  },
  {
    id: 'CST-005',
    name: 'TATA Logistics Fleet Ranchi',
    firmName: 'Tata Logistics Fleet Ranchi Unit',
    mobile: '+91 99042 11041',
    creditLimit: 2500000.00,
    outstandingBalance: 1104000.00,
    unbilledAmount: 245000.00,
    lastPaymentDate: '2026-06-03',
    billingPeriod: 'Monthly',
    vehicleList: ['JH-01-W-9011', 'JH-01-W-9012', 'JH-01-W-9013', 'JH-01-W-9014', 'JH-01-W-9015'],
    status: 'Active'
  }
];

export const INITIAL_EXPENSES: ExpenseEntry[] = [
  {
    id: 'EXP-401',
    date: '2026-06-05',
    category: 'Power & Electricity',
    amount: 45210.00,
    paidTo: 'JBVNL Jharkhand Power Board (Ramgarh Cantt division)',
    paymentMode: 'Bank Online',
    approvedBy: 'Mr. Anand Ashok',
    remarks: 'RO commercial fuel delivery canopy power bills for May 2026.'
  },
  {
    id: 'EXP-402',
    date: '2026-06-05',
    category: 'Generator Fuel',
    amount: 18500.00,
    paidTo: 'Ashok Fuels Self Consumption Log',
    paymentMode: 'Cash',
    approvedBy: 'Manager Sunil Sharma',
    remarks: '200 Liters high speed diesel decanted into pump backup generator.'
  },
  {
    id: 'EXP-403',
    date: '2026-06-04',
    category: 'Salary & Wages',
    amount: 125000.00,
    paidTo: 'Retail Outlet Staff Consolidated Salary',
    paymentMode: 'Bank Online',
    approvedBy: 'Mr. Anand Ashok',
    remarks: 'Salary dispatch for 10 Nozzle attendants and 2 Security staff.'
  },
  {
    id: 'EXP-404',
    date: '2026-06-03',
    category: 'Maintenance & Repairs',
    amount: 8500.00,
    paidTo: 'Tatsuno Technical Service Engineer',
    paymentMode: 'Bank Online',
    approvedBy: 'Manager Sunil Sharma',
    remarks: 'Nozzle calibration and flow-meter calibration certification fees.'
  }
];

export const ACCOUNTING_METRICS = {
  pnl: {
    revenue: 41258000.00,
    costOfGoods: 38421000.00,
    grossProfit: 2837000.00,
    operationalExpenses: 345000.00,
    netProfit: 2492000.00,
    marginPercentage: 6.04
  },
  assets: {
    cashInHand: 425120.00,
    bankBalances: 7376510.50,
    fuelInventoryValue: 4621000.00,
    lubricantsStockValue: 731360.00,
    accountsReceivable: 3342710.50,
    totalCurrentAssets: 16496701.00
  },
  recentJournals: [
    { date: '2026-06-05', id: 'JV-401', particulars: 'Cash in Hand A/c Dr To Credit Customers Ledger', amount: 155000.00, type: 'Receipt Voucher' },
    { date: '2026-06-05', id: 'JV-402', particulars: 'HPCL Purchase Limit A/c Dr To Bank Current A/c', amount: 2850000.00, type: 'Payment Voucher' },
    { date: '2026-06-04', id: 'JV-403', particulars: 'Lubricants Reserve Dr To M/s Castrol Distributors', amount: 120000.00, type: 'Purchase Invoice' }
  ]
};

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'USR-01',
    name: 'Anand Ashok',
    email: 'anand.ashok@ashokfuels.com',
    role: 'Owner',
    active: true,
    lastActive: 'Just Now',
    permissions: ['All Permissions', 'System Configure', 'Financial Lock/Unlock', 'User Management']
  },
  {
    id: 'USR-02',
    name: 'Sunil Sharma',
    email: 'sunil.sharma@ashokfuels.com',
    role: 'Manager',
    active: true,
    lastActive: '5 mins ago',
    permissions: ['View Dashboards', 'Indents Management', 'Collections Create', 'Customer Management', 'Lubricant Feed']
  },
  {
    id: 'USR-03',
    name: 'Vijay Patwardhan',
    email: 'vijay.p@ashokfuels.com',
    role: 'Shift Supervisor',
    active: true,
    lastActive: '1 hr ago',
    permissions: ['Nozzle Feeding', 'Shift Settlement Check', 'Petty Cash Issue', 'Dipping Log']
  },
  {
    id: 'USR-04',
    name: 'Devidas Joshi',
    email: 'devidas.j@ashokfuels.com',
    role: 'Data Entry Operator',
    active: true,
    lastActive: '2 days ago',
    permissions: ['Nozzle Feeding', 'Voucher Log Entry']
  },
  {
    id: 'USR-05',
    name: 'Ramesh Sawant',
    email: 'ramesh.s@ashokfuels.com',
    role: 'Shift Supervisor',
    active: false,
    lastActive: '3 days ago',
    permissions: ['Nozzle Feeding', 'Dipping Log']
  }
];

export const ACTIVITY_LOGS = [
  { time: '10:15 AM', user: 'Sunil Sharma', action: 'Created new HPCL Indent No. HP-IND-390611 for 12KL Petrol MS Regular', type: 'System' },
  { time: '09:40 AM', user: 'Anand Ashok', action: 'Approved monthly salary bank dispatch voucher EXP-403', type: 'Finance' },
  { time: '08:12 AM', user: 'Vijay Patwardhan', action: 'Submitted physical tank dipping parameters for T4 (Critical Warning)', type: 'Operations' },
  { time: '06:05 AM', user: 'Vijay Patwardhan', action: 'Initialized morning Shift A fuel nozzle starter configurations', type: 'Operations' },
  { time: 'Yesterday', user: 'Ramesh Sawant', action: 'Settled Shift A fuel collection record with zero cash discrepancy', type: 'Reconciliation' }
];
