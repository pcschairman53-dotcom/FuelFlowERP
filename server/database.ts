/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose from 'mongoose';
import dns from 'dns';

// Ensure sandboxed environments with DNS SRV lookup failures use public Google DNS resolvers
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e: any) {
  console.warn('⚠️ Could not override DNS servers. Proceeding with default resolver.', e.message);
}

/**
 * Robustly parses and percent-encodes credentials in a MongoDB connection URI to support special characters.
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
 * Connects to MongoDB Atlas using mongoose.connect() targeting Database: FuelFlowerp
 */
export async function connectAtlas(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    console.warn('⚠️ Warning: MONGODB_URI/MONGO_URI environment variable is not defined.');
    return null;
  }

  const cleanUri = sanitizeMongoUri(uri);

  try {
    const conn = await mongoose.connect(cleanUri, {
      dbName: 'FuelFlowerp',
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Atlas Database integration connected to: ${conn.connection.host}, DB: ${conn.connection.name}`);
    return conn;
  } catch (error: any) {
    console.error('❌ Failed to connect to MongoDB Atlas:', error.message || error);
    return null;
  }
}
