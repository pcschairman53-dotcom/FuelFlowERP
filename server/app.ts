/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { requestLogger } from './middleware/logger';
import { errorHandler } from './middleware/error';

// Import Route Modules
import userRoutes from './routes/userRoutes';
import fuelSaleRoutes from './routes/fuelSaleRoutes';
import collectionRoutes from './routes/collectionRoutes';
import collectionEntryRoutes from './routes/collectionEntryRoutes';
import hpclLoadRoutes from './routes/hpclLoadRoutes';
import tankStockRoutes from './routes/tankStockRoutes';
import tankStockEntryRoutes from './routes/tankStockEntryRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import lubricantRoutes from './routes/lubricantRoutes';
import tankerRoutes from './routes/tankerRoutes';
import customerRoutes from './routes/customerRoutes';
import expenseRoutes from './routes/expenseRoutes';
import journalVoucherRoutes from './routes/journalVoucherRoutes';
import reportRoutes from './routes/reportRoutes';
import settingRoutes from './routes/settingRoutes';

const app = express();

// Global Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// API Routes Mounting
app.use('/api/users', userRoutes);
app.use('/api/fuel-sales', fuelSaleRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/collections-entries', collectionEntryRoutes);
app.use('/api/hpcl-loads', hpclLoadRoutes);
app.use('/api/tank-stocks', tankStockRoutes);
app.use('/api/tank-stock-entries', tankStockEntryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/lubricants', lubricantRoutes);
app.use('/api/tankers', tankerRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/journal-vouchers', journalVoucherRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingRoutes);

// Base API status endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'FuelFlow ERP MVP Backend Engine'
  });
});

// Mount Global Error Handling Middleware for API routes
app.use('/api', (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Requested route [${req.method}] ${req.originalUrl} does not exist on FuelFlow ERP Backend API`
  });
});
app.use(errorHandler);

export default app;
