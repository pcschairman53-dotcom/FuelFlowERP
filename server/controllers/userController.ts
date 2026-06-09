/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { dbStore } from '../services/dbStore';

/**
 * Get all users registered in FuelFlow ERP
 */
export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await dbStore.find('User', {}, { createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get a specific user by corporate ID (e.g., USR-101)
 */
export async function getUserById(req: Request, res: Response): Promise<void> {
  try {
    const user = await dbStore.findOne('User', { id: req.params.id });
    if (!user) {
      res.status(404).json({ success: false, message: `User not found with ID ${req.params.id}` });
      return;
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Create a new user profile/role
 */
export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, role, active, assignedShift, permissions } = req.body;

    // Check pre-existing email index
    const exists = await dbStore.findOne('User', { email });
    if (exists) {
      res.status(400).json({ success: false, message: `Email ${email} is already active on another user` });
      return;
    }

    const newUser = await dbStore.create('User', {
      name,
      email,
      role,
      active,
      assignedShift,
      permissions
    });

    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Update user parameters (active status, shift assignment, email)
 */
export async function updateUser(req: Request, res: Response): Promise<void> {
  try {
    const updatedUser = await dbStore.findOneAndUpdate(
      'User',
      { id: req.params.id },
      { $set: req.body }
    );

    if (!updatedUser) {
      res.status(404).json({ success: false, message: `User not found with ID ${req.params.id}` });
      return;
    }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user parameters',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Suspend/Delete corporate user entry
 */
export async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    const deletedUser = await dbStore.findOneAndDelete('User', { id: req.params.id });

    if (!deletedUser) {
      res.status(404).json({ success: false, message: `User not found with ID ${req.params.id}` });
      return;
    }

    res.status(200).json({ success: true, message: `User ${req.params.id} successfully deactivated/removed` });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Handle POST /api/users/test to verify MongoDB Atlas integration
 */
export async function testUserInsertion(req: Request, res: Response): Promise<void> {
  try {
    const isConn = mongoose.connection.readyState === 1;
    if (!isConn) {
      res.status(503).json({
        success: false,
        message: 'MongoDB connection is INACTIVE (Offline Fallback Mode)'
      });
      return;
    }

    const testEmail = 'admin@fuelflow.com';

    // Idempotent clean up of matching email to allow repeated testing
    await User.deleteMany({ email: testEmail });

    const newUser = new User({
      name: 'Admin User',
      role: 'Owner',
      email: testEmail,
      active: true,
      permissions: ['All']
    });

    const saved = await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Successfully inserted test user document into MongoDB Atlas!',
      database: mongoose.connection.name,
      collection: 'users',
      data: saved
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to write test user to MongoDB Atlas',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

