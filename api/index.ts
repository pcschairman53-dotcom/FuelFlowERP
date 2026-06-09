/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import app from '../server/app';
import { connectDB } from '../server/config/db';

let isConnected = false;

// Middleware to ensure DB connection per lambda request
app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      console.log('⚡ Serverless Context: Connecting to MongoDB Atlas...');
      await connectDB();
      isConnected = true;
      console.log('✅ Serverless Context: MongoDB Atlas connected successfully.');
    } catch (err: any) {
      console.error('❌ Serverless Context: MongoDB Atlas connection failed:', err.message || err);
    }
  }
  next();
});

export default app;
