/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './server/app';
import { connectDB } from './server/config/db';
import { createServer as createViteServer } from 'vite';

// ES Module support for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

async function bootstrapServer() {
  console.log('\n======================================================');
  console.log('🚀 INITIALIZING FUELFLOW ERP FULL-STACK SERVER SERVICE');
  console.log('======================================================\n');

  // Load backend database connection asynchronously (with graceful offline fallback support)
  connectDB().catch((error) => {
    console.error('⚠️ Offline Fallback Triggered: Database connection failed during background initialization:', error);
  });

  // Mount Vite middleware for dev or standard express.static for prod
  if (process.env.NODE_ENV !== 'production') {
    console.log('📦 Development Mode: Initializing Vite dev server middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
    // Mount Vite dev server middleware so React app routes are hot and accessible
    app.use(vite.middlewares);
  } else {
    console.log('🎯 Production Mode: Serving static artifacts from /dist...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`⚡ FuelFlow ERP Server running on http://localhost:${PORT}`);
    console.log(`======================================================\n`);
  });
}

bootstrapServer().catch((error) => {
  console.error('❌ CRITICAL RECOVERY EXCEPTION: Server failed to startup:', error);
  process.exit(1);
});
