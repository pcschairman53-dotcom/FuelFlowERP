/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
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
import cashManagementRoutes from './routes/cashManagementRoutes';

const app = express();

// Global Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Database connection health check middleware for serverless cold-starts & transient workloads
app.use(async (req, res, next) => {
  const state = mongoose.connection.readyState;
  if (state !== 1 && state !== 2) {
    try {
      console.log('⚡ Serverless & Lazy Context: Connecting to MongoDB Atlas...');
      await connectDB();
    } catch (err: any) {
      console.error('❌ Serverless & Lazy Context: Connection failed:', err.message || err);
    }
  }
  next();
});

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
app.use('/api/cash-movements', cashManagementRoutes);

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
