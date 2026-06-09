/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';

/**
 * Generates aggregated corporate operations metrics for the principal executive screen
 */
export async function getDashboardMetrics(req: Request, res: Response): Promise<void> {
  try {
    // 1. Calculate Fuel Sales Metrics
    const salesAggregation = await dbStore.aggregate('FuelSale', [
      {
        $group: {
          _id: null,
          totalLitersSold: { $sum: '$salesQty' },
          totalRevenueAmt: { $sum: '$totalAmt' },
          nozzleRecordCount: { $sum: 1 }
        }
      }
    ]);

    const fuelSalesStats = salesAggregation[0] || {
      totalLitersSold: 0,
      totalRevenueAmt: 0,
      nozzleRecordCount: 0
    };

    // 2. Fetch fuel details by type
    const fuelSalesByType = await dbStore.aggregate('FuelSale', [
      {
        $group: {
          _id: '$fuelType',
          litersSold: { $sum: '$salesQty' },
          revenue: { $sum: '$totalAmt' }
        }
      }
    ]);

    // 3. Collection settlements summaries
    const collectionAggregation = await dbStore.aggregate('Collection', [
      {
        $group: {
          _id: null,
          totalCashReceived: { $sum: '$cashReceived' },
          totalCashCalculated: { $sum: '$cashCalculated' },
          netShortageExcess: { $sum: '$shortageExcess' },
          totalUPIAndCards: {
            $sum: {
              $add: [
                '$paytmReceived',
                '$phonepeReceived',
                '$gpayReceived',
                '$swipeCardReceived'
              ]
            }
          },
          totalLoyalty: { $sum: '$dtPlusReceived' },
          totalCreditUnbilled: { $sum: '$creditOutstanding' },
          aggregateCollectionAmt: { $sum: '$totalCollection' }
        }
      }
    ]);

    const collectionStats = collectionAggregation[0] || {
      totalCashReceived: 0,
      totalCashCalculated: 0,
      netShortageExcess: 0,
      totalUPIAndCards: 0,
      totalLoyalty: 0,
      totalCreditUnbilled: 0,
      aggregateCollectionAmt: 0
    };

    // 4. Tank stock levels
    const tanks = await dbStore.find('TankStock', {});
    const tankStats = {
      totalCapacity: tanks.reduce((sum: number, t: any) => sum + t.capacityLiters, 0),
      currentVolume: tanks.reduce((sum: number, t: any) => sum + t.currentLevelLiters, 0),
      criticallyLowCount: tanks.filter((t: any) => t.status === 'Critical').length,
      lowStockCount: tanks.filter((t: any) => t.status === 'Low Stock').length
    };

    // 5. HPCL Load management stats
    const loads = await dbStore.find('HpclLoad', {});
    const hpclStats = {
      totalIndentsPlacedCount: loads.length,
      inTransitCount: loads.filter((l: any) => l.orderStatus === 'In-Transit').length,
      decantedCount: loads.filter((l: any) => l.orderStatus === 'Decanted').length,
      paidPendingDispatchCount: loads.filter((l: any) => l.orderStatus === 'Paid & Pending HPCL Dispatch').length
    };


    res.status(200).json({
      success: true,
      data: {
        summary: {
          revenue: fuelSalesStats.totalRevenueAmt,
          volumeSoldLiters: fuelSalesStats.totalLitersSold,
          reconciliationShortage: collectionStats.netShortageExcess,
          totalSettleAmount: collectionStats.aggregateCollectionAmt
        },
        fuelTypeBreakdown: fuelSalesByType.map(item => ({
          fuelType: item._id,
          litersSold: item.litersSold,
          revenue: item.revenue
        })),
        collectionReconciliation: {
          cashReconciled: collectionStats.totalCashReceived,
          cashShortage: collectionStats.netShortageExcess,
          digitalUPI: collectionStats.totalUPIAndCards,
          loyaltySettle: collectionStats.totalLoyalty,
          creditOutstanding: collectionStats.totalCreditUnbilled
        },
        tanks: {
          totalCapacity: tankStats.totalCapacity,
          currentVolume: tankStats.currentVolume,
          reservePercentage: tankStats.totalCapacity > 0 
            ? parseFloat(((tankStats.currentVolume / tankStats.totalCapacity) * 100).toFixed(2)) 
            : 0,
          lowInventoryWarning: tankStats.criticallyLowCount > 0,
          warningCount: tankStats.criticallyLowCount + tankStats.lowStockCount
        },
        hpclIndents: {
          totalIndents: hpclStats.totalIndentsPlacedCount,
          activeTransit: hpclStats.inTransitCount,
          pendingRefineryApproval: hpclStats.paidPendingDispatchCount,
          completedRuns: hpclStats.decantedCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to compile dashboard aggregated metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Generates mocked dashboard summary data for the UI
 */
export async function getDashboardSummaryMock(req: Request, res: Response): Promise<void> {
  res.status(200).json({
    petrolSales: 182430,
    dieselSales: 291760,
    cashCollection: 268950,
    paytmCollection: 124500,
    dtPlusCollection: 57800,
    tankStock: 18945,
    hpclBalance: 1875000,
    bankBalance: 7376511
  });
}
