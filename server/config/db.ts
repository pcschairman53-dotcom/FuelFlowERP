/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose from 'mongoose';
import dns from 'dns';
import { seedDatabase } from './seeder';

// Set public Google DNS resolvers to ensure sandboxed environments compile SRV lookups successfully
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e: any) {
  console.warn('⚠️ Could not override DNS servers. Proceeding with default resolver.', e.message);
}

/**
 * Robustly parses and percent-encodes credentials in a MongoDB connection URI to support passwords with special characters.
 */
function sanitizeMongoUri(rawUri: string): string {
  try {
    const protocolSeparator = '://';
    const parts = rawUri.split(protocolSeparator);
    if (parts.length < 2) return rawUri;

    const protocol = parts[0];
    const rest = parts.slice(1).join(protocolSeparator);

    // Split credentials from host at the last '@' symbol
    const lastAtIndex = rest.lastIndexOf('@');
    if (lastAtIndex === -1) return rawUri;

    const credentials = rest.substring(0, lastAtIndex);
    const hostAndParams = rest.substring(lastAtIndex + 1);

    // Parse username and password
    const colonIndex = credentials.indexOf(':');
    if (colonIndex === -1) return rawUri;

    const username = credentials.substring(0, colonIndex);
    const password = credentials.substring(colonIndex + 1);

    // Percent-encode special characters
    const encodedUsername = encodeURIComponent(username);
    const encodedPassword = encodeURIComponent(password);

    return `${protocol}${protocolSeparator}${encodedUsername}:${encodedPassword}@${hostAndParams}`;
  } catch (error) {
    return rawUri;
  }
}

/**
 * Connects to MongoDB Atlas database.
 * If the MONGODB_URI environment variable is missing, it logs a clear warning
 * and avoids crashing the server on startup to preserve full-stack container continuity.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    console.warn('\n======================================================');
    console.warn('⚠️ WARNING: MONGODB_URI/MONGO_URI environment variable is not defined.');
    console.warn('The MVP Backend will run, but API actions relying on MongoDB Atlas will fail.');
    console.warn('Please configure MONGODB_URI in your environment settings.');
    console.warn('======================================================\n');
    return null;
  }

  const cleanUri = sanitizeMongoUri(uri);

  try {
    const conn = await mongoose.connect(cleanUri, {
      dbName: 'FuelFlowerp',
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30 seconds
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Automatically seed missing datasets on start
    await seedDatabase();
    
    return conn;
  } catch (error) {
    console.error('\n======================================================');
    console.error('❌ MongoDB Connection Failure!');
    console.error(error instanceof Error ? error.message : error);
    console.error('Moving forward with offline fallback mode. Database operations will error.');
    console.error('======================================================\n');
    return null;
  }
}
