/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search, Plus, MapPin, Truck, Droplet, Database, Box, BarChart3,
  Sparkles, CheckCircle2, Clock, AlertTriangle, AlertCircle, RefreshCw, X, Link, HelpCircle,
  Edit, Trash2, Calendar, Filter
} from 'lucide-react';
import { TankStock, HpclIndentOrder, LubricantItem, Tanker, TankStockEntry } from '../../types';

// ============================================================================
// 1. TANK STOCK SCREEN
// ============================================================================
interface TankStockScreenProps {
  tanks: TankStock[];
  onDipUpdate: (tankId: string, dipMm: number, waterMm: number) => void;
  tankEntries?: TankStockEntry[];
  onAddTankEntry?: (entry: any) => void;
  onUpdateTankEntry?: (id: string, entry: any) => void;
  onDeleteTankEntry?: (id: string) => void;
}

export function TankStockScreen({
  tanks,
  onDipUpdate,
  tankEntries,
  onAddTankEntry,
  onUpdateTankEntry,
  onDeleteTankEntry
}: TankStockScreenProps) {
  const [selectedTank, setSelectedTank] = useState<TankStock | null>(null);
  const [dipMm, setDipMm] = useState(1200);
  const [waterMm, setWaterMm] = useState(0);

  // Daily Tank Stock Entries State and Filters
  const entriesList = tankEntries || [];
  const [filterDate, setFilterDate] = useState('');
  const [filterShift, setFilterShift] = useState('');
  const [filterTank, setFilterTank] = useState('');

  // Form states and modal states
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TankStockEntry | null>(null);

  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formShift, setFormShift] = useState('Shift A');
  const [formTankNumber, setFormTankNumber] = useState('');
  const [formFuelType, setFormFuelType] = useState('Petrol');
  const [formOpeningStock, setFormOpeningStock] = useState(0);
  const [formReceivedQuantity, setFormReceivedQuantity] = useState(0);
  const [formSalesQuantity, setFormSalesQuantity] = useState(0);
  const [formDipReading, setFormDipReading] = useState(0);
  const [formWaterLevel, setFormWaterLevel] = useState(0);
  const [formRemarks, setFormRemarks] = useState('');

  // Auto set fuel type and opening stock when a specific storage tank is selected
  const handleTankChange = (tankNameSelected: string) => {
    setFormTankNumber(tankNameSelected);
    const matchedTank = tanks.find(t => t.tankName === tankNameSelected);
    if (matchedTank) {
      setFormFuelType(matchedTank.fuelType);
      setFormOpeningStock(matchedTank.currentLevelLiters);
    }
  };

  // Prepopulate form for editing
  const startEdit = (entry: TankStockEntry) => {
    setEditingEntry(entry);
    setFormDate(entry.date);
    setFormShift(entry.shift);
    setFormTankNumber(entry.tankNumber);
    setFormFuelType(entry.fuelType);
    setFormOpeningStock(entry.openingStock);
    setFormReceivedQuantity(entry.receivedQuantity);
    setFormSalesQuantity(entry.salesQuantity);
    setFormDipReading(entry.dipReading);
    setFormWaterLevel(entry.waterLevel);
    setFormRemarks(entry.remarks || '');
    setIsEntryModalOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setEditingEntry(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormShift('Shift A');
    setFormTankNumber('');
    setFormFuelType('Petrol');
    setFormOpeningStock(0);
    setFormReceivedQuantity(0);
    setFormSalesQuantity(0);
    setFormDipReading(0);
    setFormWaterLevel(0);
    setFormRemarks('');
  };

  // Submit log
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      date: formDate,
      shift: formShift,
      tankNumber: formTankNumber || tanks[0]?.tankName || 'Tank 1',
      fuelType: formFuelType,
      openingStock: Number(formOpeningStock),
      receivedQuantity: Number(formReceivedQuantity),
      salesQuantity: Number(formSalesQuantity),
      dipReading: Number(formDipReading),
      waterLevel: Number(formWaterLevel),
      remarks: formRemarks
    };

    if (editingEntry) {
      onUpdateTankEntry?.(editingEntry.id || editingEntry._id || '', payload);
    } else {
      onAddTankEntry?.(payload);
    }
    setIsEntryModalOpen(false);
    resetForm();
  };

  // Filter computing
  const filteredEntries = entriesList.filter(entry => {
    if (filterDate && entry.date !== filterDate) return false;
    if (filterShift && entry.shift !== filterShift) return false;
    if (filterTank && entry.tankNumber !== filterTank) return false;
    return true;
  });

  // Unique latest record summation per tank
  const latestEntryPerTank: Record<string, TankStockEntry> = {};
  entriesList.forEach(entry => {
    const existing = latestEntryPerTank[entry.tankNumber];
    if (!existing || entry.date > existing.date || (entry.date === existing.date && (entry.createdAt || '') > (existing.createdAt || ''))) {
      latestEntryPerTank[entry.tankNumber] = entry;
    }
  });

  const activeTanksRecord = Object.values(latestEntryPerTank);
  const totalStockVal = activeTanksRecord.reduce((acc, curr) => acc + (curr.closingStock || 0), 0);
  const petrolStockVal = activeTanksRecord.filter(e => e.fuelType === 'Petrol' || e.fuelType === 'Speed Petrol').reduce((acc, curr) => acc + (curr.closingStock || 0), 0);
  const dieselStockVal = activeTanksRecord.filter(e => e.fuelType === 'Diesel').reduce((acc, curr) => acc + (curr.closingStock || 0), 0);

  const hasLowStockAlert = tanks.some(t => t.status !== 'Normal');

  // Calibration helper factors to simulate dip conversion (realistic fuel lookup scale)
  const handleDipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTank) {
      onDipUpdate(selectedTank.id, dipMm, waterMm);
      setSelectedTank(null);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Physical Tank Dip Logs & Wet Stock Audits</h1>
          <p className="text-xs text-slate-500">Log manual brass dip yard measurements against telemetry to track evaporation/variance loss.</p>
        </div>
      </div>

      {/* Grid of tanks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tanks.map((tank) => {
          const pct = (tank.currentLevelLiters / tank.capacityLiters) * 100;
          const isCritical = tank.status === 'Critical' || pct < 20;
          const isLow = tank.status === 'Low Stock' || (pct >= 20 && pct < 40);
          
          let alertColor = 'text-green-600 bg-green-50 border-green-150';
          let textColor = 'text-green-800 font-bold';
          if (isCritical) {
            alertColor = 'text-red-650 bg-red-50 border-red-150';
            textColor = 'text-red-705 font-bold';
          } else if (isLow) {
            alertColor = 'text-amber-550 bg-amber-50 border-amber-150';
            textColor = 'text-amber-705 font-bold animate-pulse';
          }

          return (
            <div key={tank.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-3xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest leading-none">{tank.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${alertColor}`}>
                    {tank.status}
                  </span>
                </div>
                <h3 className="text-[14px] font-extrabold text-slate-900 block">{tank.tankName}</h3>
                <span className="text-[11px] text-slate-400 block font-mono mt-0.5">{tank.fuelType} Capacity</span>

                {/* Simulated physical tank animation */}
                <div className="my-5 relative h-24 w-full bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
                  {/* Floating liquid */}
                  <div 
                    className={`absolute bottom-0 left-0 right-0 transition-all duration-700 ${
                      tank.fuelType === 'Petrol' ? 'bg-sky-600/35' : tank.fuelType === 'Diesel' ? 'bg-slate-50 relative bg-slate-600/20' : 'bg-amber-500/25'
                    }`}
                    style={{ height: `${pct}%` }}
                  >
                    {/* Water contamination indicator at absolute bottom */}
                    {tank.waterLevelMm > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-red-600 animate-pulse" title="Water element residue detected!" />
                    )}
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-extrabold text-slate-800 font-mono">{pct.toFixed(0)}% Fill</span>
                    <span className="text-[10px] text-slate-400 font-mono">{(tank.currentLevelLiters).toLocaleString()} Liters</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-t border-slate-50 pt-3">
                  <div>
                    <span className="text-slate-400 block">Dipped Level</span>
                    <span className="font-bold text-slate-800">{tank.dipReadingMm} mm</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Water Height</span>
                    <span className="font-bold text-slate-800">{tank.waterLevelMm} mm</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedTank(tank);
                  setDipMm(tank.dipReadingMm);
                  setWaterMm(tank.waterLevelMm);
                }}
                className="mt-4 w-full text-center bg-slate-50 hover:bg-slate-100 text-sky-950 hover:text-slate-900 py-1.5 px-2 rounded-lg font-bold text-xs transition cursor-pointer border border-slate-200"
              >
                Log Dip Measurements (mm)
              </button>
            </div>
          );
        })}
      </div>

      {/* Manual Reading Form */}
      {selectedTank && (
        <div id="tank-modal" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden">
            <div className="bg-sky-950 p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Brass Rod Calibration: {selectedTank.tankName}</h3>
                <p className="text-[11px] text-sky-200">Convert physical dipping millimeters into real-time stock volumes.</p>
              </div>
              <button onClick={() => setSelectedTank(null)} className="text-sky-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDipSubmit} className="p-5 space-y-4">
              <div className="bg-sky-50 p-3 rounded-lg border border-sky-100/70 text-xs text-sky-900">
                <span className="font-bold block">🚨 Calibration Chart Info:</span>
                <span>The system utilizes the Certified Tatsuno RO calibration matrix dated May 2026. Dip height resolves into Liters lookup automatically.</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Dipped Fuel Height (mm)</label>
                  <input
                    type="number"
                    required
                    value={dipMm}
                    onChange={(e) => setDipMm(parseInt(e.target.value))}
                    className="w-full text-xs p-2 border border-slate-200 rounded font-mono font-bold text-sky-950"
                  />
                  <span className="text-[10px] text-slate-400">Total rod capacity: 3,000mm</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Bottom Water Dip (mm)</label>
                  <input
                    type="number"
                    required
                    value={waterMm}
                    onChange={(e) => setWaterMm(parseInt(e.target.value))}
                    className="w-full text-xs p-2 border border-slate-200 rounded font-mono text-rose-700"
                  />
                  <span className="text-[10px] text-slate-400">Target water level: 0mm</span>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTank(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-950 text-white text-xs rounded-lg font-semibold cursor-pointer"
                >
                  Recalculate Volume Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================== Daily Tank Stock Logs Registry Section ================== */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-3xs space-y-5 mt-10">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Shift-wise Daily Tank Stock Management</h2>
            <p className="text-xs text-slate-500">Log and verify openings, receipts, sales and endings per pump shift.</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsEntryModalOpen(true);
            }}
            className="flex items-center gap-1.5 self-start sm:self-auto bg-sky-950 hover:bg-sky-900 text-white font-semibold text-xs py-2 px-3.5 rounded-xl transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Log Shift Stock Entry
          </button>
        </div>

        {/* Mini Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-100 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Active Stock</span>
              <span className="block text-lg font-extrabold text-slate-800 font-mono mt-0.5">
                {(totalStockVal > 0 ? totalStockVal : (tanks || []).reduce((sum, t) => sum + (t?.currentLevelLiters ?? 0), 0)).toLocaleString()} <span className="text-[10px] text-slate-500 font-medium">Ltrs</span>
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-50 text-sky-800">
              <Database className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-100 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Petrol Stock</span>
              <span className="block text-lg font-extrabold text-slate-800 font-mono mt-0.5">
                {(petrolStockVal > 0 ? petrolStockVal : (tanks || []).filter(t => t && t.fuelType !== 'Diesel').reduce((sum, t) => sum + (t?.currentLevelLiters ?? 0), 0)).toLocaleString()} <span className="text-[10px] text-slate-505 font-medium">Ltrs</span>
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <Droplet className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-100 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Diesel Stock</span>
              <span className="block text-lg font-extrabold text-slate-800 font-mono mt-0.5">
                {(dieselStockVal > 0 ? dieselStockVal : (tanks || []).filter(t => t && t.fuelType === 'Diesel').reduce((sum, t) => sum + (t?.currentLevelLiters ?? 0), 0)).toLocaleString()} <span className="text-[10px] text-slate-505 font-medium">Ltrs</span>
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700">
              <Droplet className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-100 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Low Stock States</span>
              <div className="mt-1 flex items-center gap-1.5">
                {hasLowStockAlert ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                    <AlertTriangle className="w-3.5 h-3.5" /> Reorder Indent
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-100">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Normal Levels
                  </span>
                )}
              </div>
            </div>
            <div className={`p-2.5 rounded-lg ${hasLowStockAlert ? 'bg-rose-50 text-rose-700 animate-pulse' : 'bg-green-50 text-green-700'}`}>
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-wrap items-center gap-3 shadow-3xs">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Filter Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full text-xs p-1.5 border border-slate-200 rounded font-sans cursor-pointer bg-white"
            />
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Filter Shift</label>
            <select
              value={filterShift}
              onChange={(e) => setFilterShift(e.target.value)}
              className="w-full text-xs p-1.5 border border-slate-200 rounded text-slate-700 bg-white cursor-pointer"
            >
              <option value="">All Shifts</option>
              <option value="Shift A">Shift A (06:00 - 14:00)</option>
              <option value="Shift B">Shift B (14:00 - 22:00)</option>
              <option value="Shift C">Shift C (22:00 - 06:00)</option>
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Filter Tank</label>
            <select
              value={filterTank}
              onChange={(e) => setFilterTank(e.target.value)}
              className="w-full text-xs p-1.5 border border-slate-200 rounded text-slate-700 bg-white cursor-pointer"
            >
              <option value="">All Tanks</option>
              {tanks.map(t => (
                <option key={t.id} value={t.tankName}>{t.tankName}</option>
              ))}
            </select>
          </div>

          {(filterDate || filterShift || filterTank) && (
            <button
              onClick={() => {
                setFilterDate('');
                setFilterShift('');
                setFilterTank('');
              }}
              className="self-end px-3 py-1.5 border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 text-xs rounded-lg transition cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Database Entries Table */}
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-sky-950/5 border-b border-sky-950/10 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  <th className="p-3.5">Date & Shift</th>
                  <th className="p-3.5">Tank & Fuel</th>
                  <th className="p-3.5 text-right">Opening Stock</th>
                  <th className="p-3.5 text-right">Received Qty</th>
                  <th className="p-3.5 text-right">Sales Qty</th>
                  <th className="p-3.5 text-right bg-sky-50 text-sky-955">Closing Stock</th>
                  <th className="p-3.5 text-right">Dip Reading</th>
                  <th className="p-3.5">Remarks</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-sans">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-10 text-center text-slate-400 font-semibold font-sans">
                      <RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin text-slate-300" />
                      No shift tank stock logs found matching the filter bounds.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((item) => (
                    <tr key={item.id || item._id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-bold">
                        <span className="font-bold text-slate-800 block font-sans">{item.date}</span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold">{item.shift}</span>
                      </td>
                      <td className="p-3.5 font-mono">
                        <span className="font-bold text-slate-900 block font-sans">{item.tankNumber}</span>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                          item.fuelType === 'Petrol' || item.fuelType === 'Speed Petrol' ? 'bg-sky-50 text-sky-800 border border-sky-100' : 'bg-slate-50 text-slate-700 border border-slate-100'
                        }`}>{item.fuelType}</span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-semibold">{(item.openingStock || 0).toLocaleString()} L</td>
                      <td className="p-3.5 text-right font-mono text-emerald-800 font-semibold">
                        {item.receivedQuantity > 0 ? `+${(item.receivedQuantity).toLocaleString()}` : '0'} L
                      </td>
                      <td className="p-3.5 text-right font-mono text-rose-700 font-semibold">
                        {item.salesQuantity > 0 ? `-${(item.salesQuantity).toLocaleString()}` : '0'} L
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold bg-sky-50/50 text-sky-950 font-sans">
                        {(item.closingStock || 0).toLocaleString()} L
                      </td>
                      <td className="p-3.5 text-right font-mono">
                        <span className="font-bold text-slate-800 block">{item.dipReading} mm</span>
                        {item.waterLevel > 0 && <span className="text-[10px] text-rose-600 font-semibold">Water: {item.waterLevel} mm</span>}
                      </td>
                      <td className="p-3.5 text-slate-500 italic max-w-xs truncate font-sans" title={item.remarks}>
                        {item.remarks || '-'}
                      </td>
                      <td className="p-3.5 text-center font-sans">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => startEdit(item)}
                            className="bg-sky-50 hover:bg-sky-100 text-sky-955 text-[11px] font-bold py-1 px-2.5 rounded-lg transition cursor-pointer font-sans"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this daily shift tank stock log?')) {
                                onDeleteTankEntry?.(item.id || item._id || '');
                              }
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-705 text-[11px] font-bold py-1 px-2.5 rounded-lg transition cursor-pointer font-sans"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Entry Modal Dialog */}
      {isEntryModalOpen && (
        <div id="entry-modal" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden">
            <div className="bg-sky-950 p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">{editingEntry ? 'Edit Shift Tank Stock Log' : 'Create Shift Tank Stock Entry'}</h3>
                <p className="text-[11px] text-sky-200">Record shift openings, decant additions, and total nozzle sales.</p>
              </div>
              <button onClick={() => { setIsEntryModalOpen(false); resetForm(); }} className="text-sky-200 hover:text-white cursor-pointer animate-transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 font-sans">
              <div className="grid grid-cols-2 gap-3 font-sans">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Log Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded text-slate-705 bg-white font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Shift</label>
                  <select
                    value={formShift}
                    onChange={(e) => setFormShift(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded text-slate-705 bg-white cursor-pointer font-sans"
                  >
                    <option value="Shift A">Shift A (06:00 - 14:00)</option>
                    <option value="Shift B">Shift B (14:00 - 22:00)</option>
                    <option value="Shift C">Shift C (22:00 - 06:00)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-sans">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Target Storage Tank</label>
                  <select
                    required
                    value={formTankNumber}
                    onChange={(e) => handleTankChange(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded text-slate-705 bg-white cursor-pointer font-sans"
                  >
                    <option value="">-- Choose Tank --</option>
                    {tanks.map(t => (
                      <option key={t.id} value={t.tankName}>{t.tankName} ({t.fuelType})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Fuel Type (Auto)</label>
                  <input
                    type="text"
                    disabled
                    value={formFuelType}
                    className="w-full text-xs p-2 border border-slate-100 rounded bg-slate-50 text-slate-505 font-bold font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100/50 font-sans">
                <div>
                  <label className="block text-[10px] font-bold text-slate-505 uppercase mb-1 font-sans">Opening (L)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formOpeningStock}
                    onChange={(e) => setFormOpeningStock(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-slate-200 rounded font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-550 uppercase mb-1 font-sans">Decanted (L)</label>
                  <input
                    type="number"
                    min="0"
                    value={formReceivedQuantity}
                    onChange={(e) => setFormReceivedQuantity(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-slate-200 rounded font-mono text-emerald-805"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-550 uppercase mb-1 text-rose-800 font-sans">Sales (L)</label>
                  <input
                    type="number"
                    min="0"
                    value={formSalesQuantity}
                    onChange={(e) => setFormSalesQuantity(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-slate-200 rounded font-mono text-rose-805"
                  />
                </div>
              </div>

              {/* Instant Auto Closing Stock Preview Alert Box */}
              <div className="bg-sky-50 px-3.5 py-2.5 rounded-lg border border-sky-100 flex items-center justify-between text-xs text-sky-955 font-bold font-sans">
                <span>Calculated Closing Stock (Auto):</span>
                <span className="font-mono text-sm font-extrabold text-sky-955">
                  {((Number(formOpeningStock) || 0) + (Number(formReceivedQuantity) || 0) - (Number(formSalesQuantity) || 0)).toLocaleString()} Liters
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 font-sans">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Actual Brass Rod Dip (mm)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formDipReading}
                    onChange={(e) => setFormDipReading(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-slate-200 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Water Height (mm)</label>
                  <input
                    type="number"
                    min="0"
                    value={formWaterLevel}
                    onChange={(e) => setFormWaterLevel(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-slate-200 rounded font-mono text-rose-705"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 font-sans">Remarks / Shift Audit Anomalies</label>
                <textarea
                  rows={2}
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  placeholder="Note variances, evaporation factors, or delivery tanker details..."
                  className="w-full text-xs p-2 border border-slate-200 rounded text-slate-705 bg-white font-sans"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 font-sans">
                <button
                  type="button"
                  onClick={() => { setIsEntryModalOpen(false); resetForm(); }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formTankNumber}
                  className={`px-4 py-2 text-white text-xs rounded-lg font-semibold cursor-pointer ${
                    formTankNumber ? 'bg-sky-950 hover:bg-sky-900 text-white' : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Save Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


// ============================================================================
// 2. HPCL LOAD MANAGEMENT SCREEN
// ============================================================================
interface HpclLoadManagementScreenProps {
  indents: HpclIndentOrder[];
  onPlaceIndent: (newIndent: HpclIndentOrder) => void;
  hpclBalance: number;
}

export function HpclLoadManagementScreen({ indents, onPlaceIndent, hpclBalance }: HpclLoadManagementScreenProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productType, setProductType] = useState<'Petrol (MS)' | 'Diesel (HSD)' | 'Speed (Premium MS)'>('Diesel (HSD)');
  const [quantity, setQuantity] = useState(24); // KL
  const [bank, setBank] = useState('HDFC Bank Ltd');
  const [utr, setUtr] = useState('UTR-HDFCR52026060699');

  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const ratePerKl = productType === 'Petrol (MS)' ? 104200 : productType === 'Diesel (HSD)' ? 92500 : 111400;
    const totalAmount = quantity * ratePerKl;
    
    const newIndent: HpclIndentOrder = {
      id: `IND-${Math.floor(904 + Math.random() * 95)}`,
      indentDate: new Date().toISOString().split('T')[0],
      indentNo: `HP-IND-${Math.floor(390620 + Math.random() * 900)}`,
      productType,
      quantityKl: quantity,
      totalAmount,
      paymentBank: bank,
      utrNo: utr,
      orderStatus: 'Paid & Pending HPCL Dispatch',
      assignedTankerNo: 'Pending Depot Allot',
      eta: 'Schedules pending allocation'
    };
    onPlaceIndent(newIndent);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-5 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">HPCL Indent Orders & Payments</h1>
          <p className="text-xs text-slate-500">Dispatch pre-paid indents to HPCL Depot Jasidih. Monitor active loading status and GPS routes.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-sky-950 text-white hover:bg-sky-900 border border-sky-850 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Place New Indent Lock</span>
        </button>
      </div>

      {/* HPCL balance bar */}
      <div className="bg-sky-950 rounded-2xl p-4 sm:p-5 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-sky-900/60 shadow-md">
        <div>
          <span className="text-xs text-sky-300 font-mono uppercase tracking-widest block">Authorized Sourced Limit with HPCL</span>
          <p className="text-2xl font-extrabold text-amber-400 font-mono tracking-tight mt-1">{formatINR(hpclBalance)}</p>
        </div>
        <div className="text-sky-200 text-xs max-w-sm">
          💡 Placing a new fuel loading order immediately reserves the cash value from your HDFC Limit OD account and issues a UTR number to HPCL.
        </div>
      </div>

      {/* Indent Orders Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3.5">Indent Code / Ref</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Fuel Class Delivered</th>
                <th className="p-3.5 text-right font-mono">Volume (KL)</th>
                <th className="p-3.5 text-right font-mono">Price Locked</th>
                <th className="p-3.5 select-none text-left">Bank / UPI UTR Ref</th>
                <th className="p-3.5">Assigned Tanker</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {indents.map((item) => {
                let statusBadge = 'bg-slate-100 text-slate-800';
                if (item.orderStatus === 'Decanted') {
                  statusBadge = 'bg-emerald-100 text-emerald-800';
                } else if (item.orderStatus === 'In-Transit') {
                  statusBadge = 'bg-amber-100 text-amber-800';
                } else if (item.orderStatus === 'Paid & Pending HPCL Dispatch') {
                  statusBadge = 'bg-sky-100 text-sky-850 animate-pulse';
                }

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 font-mono">
                      <span className="font-bold text-slate-900 block">{item.indentNo}</span>
                      <span className="text-[10px] text-slate-400 block">{item.id}</span>
                    </td>
                    <td className="p-3.5 text-slate-500">{item.indentDate}</td>
                    <td className="p-3.5 font-semibold text-slate-800 shrink-0 flex items-center gap-1">
                      <Droplet className="w-3.5 h-3.5 text-sky-850" />
                      {item.productType}
                    </td>
                    <td className="p-3.5 text-right font-mono font-medium text-slate-800">{item.quantityKl} KL</td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900">{formatINR(item.totalAmount)}</td>
                    <td className="p-3.5 font-mono text-[10px] text-slate-400">
                      <span className="text-slate-800 block">{item.paymentBank}</span>
                      {item.utrNo}
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-800 font-mono block">{item.assignedTankerNo}</span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[124px]">{item.eta}</span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge}`}>
                        {item.orderStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal drawer form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden">
            <div className="bg-sky-950 p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Lock HPCL Indent Loading Slot</h3>
                <p className="text-[11px] text-sky-200">Payment must clear directly to the Jasidih Terminal Bank Grid.</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-sky-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Fuel Product Lock</label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value as any)}
                    className="w-full text-xs p-2 border border-slate-200 rounded bg-white"
                  >
                    <option value="Petrol (MS)">Petrol (Regular MS)</option>
                    <option value="Diesel (HSD)">Diesel (Regular HSD)</option>
                    <option value="Speed (Premium MS)">Speed (Premium Petrol)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Volume (Kiloliters - KL)</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full text-xs p-2 border border-slate-200 rounded bg-white font-mono"
                  >
                    <option value="12">12 KL (Short tank load)</option>
                    <option value="18">18 KL (Consolidated tanker load)</option>
                    <option value="24">24 KL (Long tanker load)</option>
                    <option value="30">30 KL (Super tanker trailer)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Cleared Limit OD Bank</label>
                  <select
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded"
                  >
                    <option value="HDFC Bank Ltd">HDFC Bank Ltd (OD Available Limit: ₹41L)</option>
                    <option value="State Bank of India">State Bank of India (Balance: ₹24L)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">UPI / Wire UTR Reference ID</label>
                  <input
                    type="text"
                    required
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded font-mono"
                  />
                </div>
              </div>

              {/* Cost summary mock up */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between font-mono">
                  <span>Product rate reference:</span>
                  <span>₹{productType === 'Petrol (MS)' ? '94.20/L base' : '82.50/L base'}</span>
                </div>
                <div className="flex justify-between font-mono font-bold text-sky-950">
                  <span>Total Indent Premium Cost:</span>
                  <span>{formatINR(quantity * (productType === 'Petrol (MS)' ? 104200 : productType === 'Diesel (HSD)' ? 92500 : 111400))}</span>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-950 text-white text-xs rounded-lg font-semibold"
                >
                  Place Indent Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


// ============================================================================
// 3. LUBRICANT INVENTORY SCREEN
// ============================================================================
interface LubricantInventoryScreenProps {
  lubes: LubricantItem[];
  onUpdateQty: (skuId: string, boxQty: number) => void;
  onAddLube?: (lube: any) => Promise<void>;
  onDeleteLube?: (skuId: string) => Promise<void>;
}

export function LubricantInventoryScreen({
  lubes,
  onUpdateQty,
  onAddLube,
  onDeleteLube
}: LubricantInventoryScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);
  const [selectedSku, setSelectedSku] = useState<LubricantItem | null>(null);
  const [newBoxQty, setNewBoxQty] = useState(10);

  // Form & Entry States
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [formProductName, setFormProductName] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formCategory, setFormCategory] = useState('Engine Oil');
  const [formSkuCode, setFormSkuCode] = useState('');
  const [formPackSize, setFormPackSize] = useState('1L');
  const [formBoxCount, setFormBoxCount] = useState<number>(0);
  const [formPcsPerBox, setFormPcsPerBox] = useState<number>(12);
  const [formUnitCost, setFormUnitCost] = useState<number>(0);
  const [formSupplier, setFormSupplier] = useState('');
  const [formCabinetLocation, setFormCabinetLocation] = useState('');
  const [formRemarks, setFormRemarks] = useState('');

  // Auto-calculated opening stock
  const formOpeningStock = formBoxCount * formPcsPerBox;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSku) {
      onUpdateQty(selectedSku.id, newBoxQty);
      setSelectedSku(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProductName || !formSkuCode) {
      setFormError('Product Name and SKU Code are required.');
      return;
    }

    setFormError(null);
    setFormSuccess(null);
    const newLogs = [
      `[${new Date().toLocaleTimeString()}] Form validation check: Passed`,
      `[${new Date().toLocaleTimeString()}] Target inventory collection: "lubricants" (FuelFlowerp)`,
      `[${new Date().toLocaleTimeString()}] Constructing database schema model payload...`,
      `[${new Date().toLocaleTimeString()}] Saving to MongoDB Atlas cluster...`
    ];
    setLogs(newLogs);

    const payload = {
      productName: formProductName,
      brand: formBrand || 'HP',
      category: formCategory,
      skuCode: formSkuCode,
      packSize: formPackSize,
      boxCount: Number(formBoxCount),
      pcsPerBox: Number(formPcsPerBox),
      unitCost: Number(formUnitCost),
      supplier: formSupplier || 'Direct Depot',
      cabinetLocation: formCabinetLocation || 'Main Locker',
      openingStock: Number(formOpeningStock),
      remarks: formRemarks
    };

    try {
      if (onAddLube) {
        await onAddLube(payload);
        setLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ✅ MongoDB response: Success! Model instance synchronized.`,
          `[${new Date().toLocaleTimeString()}] Transaction committed successfully into the Atlas Cluster.`
        ]);
        setFormSuccess('Lubricant saved successfully to MongoDB!');
        
        // Clear fields
        setFormProductName('');
        setFormBrand('');
        setFormCategory('Engine Oil');
        setFormSkuCode('');
        setFormPackSize('1L');
        setFormBoxCount(0);
        setFormPcsPerBox(12);
        setFormUnitCost(0);
        setFormSupplier('');
        setFormCabinetLocation('');
        setFormRemarks('');

        setTimeout(() => {
          setIsEntryModalOpen(false);
          setLogs([]);
          setFormSuccess(null);
        }, 1200);
      } else {
        // Direct REST API Fallback
        const res = await fetch('/api/lubricants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.success) {
          setLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] ✅ Backend API direct response: Success!`,
            `[${new Date().toLocaleTimeString()}] Collection database modified.'`
          ]);
          setFormSuccess('Lubricant SKU saved successfully!');
          setTimeout(() => {
            setIsEntryModalOpen(false);
            setLogs([]);
            setFormSuccess(null);
            window.location.reload();
          }, 1200);
        } else {
          throw new Error(json.message || 'REST write failed');
        }
      }
    } catch (err: any) {
      const errMsg = err.message || err;
      setLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ❌ Database transaction failed!`,
        `[${new Date().toLocaleTimeString()}] Reason: ${errMsg}`
      ]);
      setFormError(`MongoDB insertion failed: ${errMsg}`);
    }
  };

  const generateSku = () => {
    const initials = formProductName ? formProductName.replace(/[^A-Za-z0-9]/g, '').substring(0, 4).toUpperCase() : 'LUB';
    const cleanInitials = initials || 'LUB';
    const rand = Math.floor(100 + Math.random() * 900);
    setFormSkuCode(`SKU-${cleanInitials}-${rand}`);
    setLogs(prev => [...prev, `[Info] Autogenerated SKU Code based on model constraints: SKU-${cleanInitials}-${rand}`]);
  };

  // Filter conditions
  const filtered = lubes.filter(item => {
    // 1. Search term match
    const b = (item as any).brand || '';
    const c = (item as any).category || '';
    const sup = (item as any).supplier || '';
    const loc = (item as any).cabinetLocation || item.rackLocation || '';
    const matchesSearch = !searchTerm ||
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.skuCode && item.skuCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      b.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Date match
    const itemDate = (item as any).createdAt ? new Date((item as any).createdAt).toISOString().split('T')[0] : '';
    const matchesDate = !filterDate || itemDate === filterDate;

    // 3. Low stock match
    const isUnderStock = item.boxQty <= (item.reorderLevel || 10);
    const matchesLowStock = !showOnlyLowStock || isUnderStock;

    return matchesSearch && matchesDate && matchesLowStock;
  });

  const lowStockCount = lubes.filter(l => l.boxQty <= (l.reorderLevel || 10)).length;

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Dry Lubricants & Motor Oils Inventory</h1>
          <p className="text-xs text-slate-500">Track high-margin Castrol and HP racer bike oils, boxes quantities, reorder caps, and rack storage coordinates.</p>
        </div>
        <button
          onClick={() => {
            setIsEntryModalOpen(true);
            setLogs([`[${new Date().toLocaleTimeString()}] Awaiting form variables validation...`]);
          }}
          className="flex items-center gap-1.5 bg-sky-950 hover:bg-sky-900 text-white font-semibold text-xs py-2 px-3.5 rounded-xl transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Lubricant Product
        </button>
      </div>

      {/* Low Stock Alerts Banner Box */}
      {lowStockCount > 0 && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="text-xs">
              <span className="font-extrabold block">🚨 Low Stock Alert Detected!</span>
              <span>There are <span className="font-extrabold">{lowStockCount}</span> lubricant product SKUs currently below critical safety limits. Need emergency procurement list orders.</span>
            </div>
          </div>
          <button
            onClick={() => setShowOnlyLowStock(!showOnlyLowStock)}
            className="text-xs font-bold bg-white hover:bg-rose-100 border border-rose-200 text-rose-700 py-1.5 px-3 rounded-lg transition"
          >
            {showOnlyLowStock ? 'Show All Products' : 'Filter Low Stock Only'}
          </button>
        </div>
      )}

      {/* Filters & Actions Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Search Products</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search SKUs, name, brand, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Filter by Addition Date</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status Class Options</label>
          <button
            type="button"
            onClick={() => setShowOnlyLowStock(!showOnlyLowStock)}
            className={`w-full py-2 px-3 border rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              showOnlyLowStock
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {showOnlyLowStock ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {showOnlyLowStock ? 'Showing Low Stock Only' : 'All Stock Statuses'}
          </button>
        </div>

        <div className="text-right text-xs text-slate-400 select-none font-semibold pb-2">
          Synced Dry trading value: ₹{(lubes.reduce((a, b) => a + b.totalValue, 0)).toLocaleString()}
        </div>
      </div>

      {/* Lubricants Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                <th className="p-3.5">SKU Name / Oil Class</th>
                <th className="p-3.5">SKU Code</th>
                <th className="p-3.5">Category & Brand</th>
                <th className="p-3.5">Box Stock Count</th>
                <th className="p-3.5 text-right font-mono">Pcs / Box</th>
                <th className="p-3.5 text-right font-mono">Total Pieces</th>
                <th className="p-3.5 text-right font-mono">Ref Unit Cost</th>
                <th className="p-3.5 text-right font-mono">Asset Valuation</th>
                <th className="p-3.5">Cabinet Location Code</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-10 text-center text-slate-450 italic font-medium">
                    No lubricants found matching search criteria or date bounds.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isUnderStock = item.boxQty <= (item.reorderLevel || 10);
                  const displayBrand = (item as any).brand || 'HP';
                  const displayCategory = (item as any).category || item.grade || 'Standard';
                  const displayCost = (item as any).unitCost || item.unitPrice || 0;
                  const displayLocation = (item as any).cabinetLocation || item.rackLocation || 'Shelf A';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-slate-100 rounded text-slate-500 shrink-0">
                            <Box className="w-4 h-4 text-sky-850" />
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 block">{item.productName}</span>
                            <span className="text-[10px] text-slate-400 block">{displayCategory}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-500 font-mono text-[11px] font-semibold">{item.skuCode}</td>
                      <td className="p-3.5">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-800 text-[10.5px]">{displayCategory}</span>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{displayBrand}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-800">{item.boxQty} Box</span>
                          {isUnderStock && (
                            <span className="bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded text-[9px] flex items-center gap-0.5 animate-pulse">
                              <AlertCircle className="w-2.5 h-2.5" /> Reorder
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-500">{item.unitsPerBox} pcs</td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-800">{item.totalUnits} pcs</td>
                      <td className="p-3.5 text-right font-mono text-slate-500">₹{displayCost}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900">₹{item.totalValue.toLocaleString()}</td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-500 font-bold">{displayLocation}</td>
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedSku(item);
                              setNewBoxQty(item.boxQty);
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-sky-950 font-bold py-1 px-2.5 rounded-lg text-[11px] cursor-pointer"
                          >
                            Adjust
                          </button>
                          {onDeleteLube && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to permanently delete "${item.productName}"?`)) {
                                  onDeleteLube(item.id);
                                }
                              }}
                              className="bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-700 font-bold py-1 px-2.5 rounded-lg text-[11px] cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lubricants Product Registration Modal (New Product) */}
      {isEntryModalOpen && (
        <div id="add-lube-modal" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in block">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-2xl w-full overflow-hidden">
            <div className="bg-sky-950 p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Add Lubricant Product registration</h3>
                <p className="text-[11px] text-sky-200">Register new high-margin lubricants directly to MongoDB Atlas.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEntryModalOpen(false);
                  setLogs([]);
                  setFormError(null);
                  setFormSuccess(null);
                }}
                className="text-white hover:text-sky-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 font-sans max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs p-3 rounded-lg font-bold">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-3 rounded-lg font-bold">
                  {formSuccess}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HP Neo Synth 15W-40"
                    value={formProductName}
                    onChange={(e) => setFormProductName(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded text-slate-700 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Brand Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Castrol / HP / Servo"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded text-slate-700 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Category / Oil Class</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded text-slate-705 bg-white cursor-pointer"
                  >
                    <option value="Engine Oil">Engine Oil</option>
                    <option value="Gear Oil">Gear Oil</option>
                    <option value="Brake Fluid">Brake Fluid</option>
                    <option value="Grease">Grease</option>
                    <option value="Coolant">Coolant</option>
                    <option value="Industrial Oil">Industrial Lube</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Pack Size (e.g. 5L, 1L)</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 Litre, 5 Litres, 20L Drum"
                    value={formPackSize}
                    onChange={(e) => setFormPackSize(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded text-slate-707 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">SKU Identification Code *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="e.g. SKU-NEOSYNTH-01L"
                      value={formSkuCode}
                      onChange={(e) => setFormSkuCode(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded font-mono text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={generateSku}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[10px] whitespace-nowrap shrink-0 transition cursor-pointer"
                    >
                      Autogen SKU
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Rack / Cabinet Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Aisle-A3 Shelf-4"
                    value={formCabinetLocation}
                    onChange={(e) => setFormCabinetLocation(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded text-slate-700 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Box Count</label>
                  <input
                    type="number"
                    min="0"
                    value={formBoxCount}
                    onChange={(e) => setFormBoxCount(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-slate-200 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pieces Per Box</label>
                  <input
                    type="number"
                    min="1"
                    value={formPcsPerBox}
                    onChange={(e) => setFormPcsPerBox(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-slate-200 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formUnitCost}
                    onChange={(e) => setFormUnitCost(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-slate-200 rounded font-mono text-emerald-800 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Supplier Representative</label>
                  <input
                    type="text"
                    placeholder="e.g. Servo Distributors Ltd."
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded text-slate-700 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Opening Stock (Calculated)</label>
                  <input
                    type="number"
                    disabled
                    value={formOpeningStock}
                    className="w-full text-xs p-2 border border-slate-100 rounded bg-slate-50 text-slate-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Remarks / Product specifications</label>
                <textarea
                  rows={2}
                  placeholder="Note storage requirements or specific API performance classifications..."
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded text-slate-700 bg-white"
                />
              </div>

              {/* Status & Telemetry Logs */}
              <div className="bg-slate-900 rounded-xl p-3 text-[10.5px] font-mono text-slate-350 space-y-1 max-h-32 overflow-y-auto">
                <span className="text-slate-400 block font-bold border-b border-slate-800 pb-1 mb-1 uppercase text-[9.5px]">🖥️ Active database writer terminal:</span>
                {logs.map((log, idx) => (
                  <div key={idx} className={log.includes('✅') || log.includes('SUCCESS') ? 'text-emerald-400' : log.includes('❌') ? 'text-rose-400' : ''}>
                    {log}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEntryModalOpen(false);
                    setLogs([]);
                    setFormError(null);
                    setFormSuccess(null);
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-950 hover:bg-sky-900 text-white text-xs rounded-lg font-semibold cursor-pointer"
                >
                  Create Product & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Box modal */}
      {selectedSku && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full overflow-hidden">
            <div className="bg-sky-950 p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Adjust Box Inventory</h3>
                <p className="text-[11px] text-slate-200">{selectedSku.productName}</p>
              </div>
              <button onClick={() => setSelectedSku(null)} className="text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">New Total Boxes Count</label>
                <input
                  type="number"
                  required
                  value={newBoxQty}
                  onChange={(e) => setNewBoxQty(parseInt(e.target.value))}
                  className="w-full text-xs p-2 border border-slate-200 rounded font-mono font-bold"
                />
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Updating box levels recalculates total unit pieces based on standard packaging packaging sizes: ({selectedSku.unitsPerBox} units per box).
              </p>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSku(null)}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-600 text-xs rounded font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-sky-950 text-white text-xs rounded font-semibold cursor-pointer"
                >
                  Save Stock Levels
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


// ============================================================================
// 4. TANKER MANAGEMENT SCREEN
// =======================================// ============================================================================
// 4. TANKER MANAGEMENT SCREEN
// ============================================================================
interface TankerManagementScreenProps {
  tankers: Tanker[];
  onAddTanker: (payload: any) => Promise<void>;
  onUpdateTanker: (tankerId: string, payload: any) => Promise<void>;
  onDeleteTanker: (tankerId: string) => Promise<void>;
}

export function TankerManagementScreen({
  tankers,
  onAddTanker,
  onUpdateTanker,
  onDeleteTanker
}: TankerManagementScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  // Modal control & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedTanker, setSelectedTanker] = useState<Tanker | null>(null);

  const [tankerNumber, setTankerNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverMobile, setDriverMobile] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [fuelType, setFuelType] = useState('');
  const [loadingDate, setLoadingDate] = useState('');
  const [dispatchDate, setDispatchDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [sourceLocation, setSourceLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [status, setStatus] = useState('Idle');
  const [remarks, setRemarks] = useState('');
  const [transporterName, setTransporterName] = useState('');
  const [gpsLocation, setGpsLocation] = useState('');

  // 1. Core Summary Metrics from live database state
  const totalCount = tankers.length;
  const activeCount = tankers.filter(t => {
    const s = (t.status || t.currentStatus || 'Idle').toLowerCase();
    return s !== 'idle' && s !== '';
  }).length;
  const inTransitCount = tankers.filter(t => {
    const s = (t.status || t.currentStatus || 'Idle').toLowerCase();
    return s.includes('transit') || s.includes('dispatched');
  }).length;
  const deliveredCount = tankers.filter(t => {
    const s = (t.status || t.currentStatus || 'Idle').toLowerCase();
    return s.includes('delivered') || s.includes('decanting');
  }).length;

  // 2. Open forms
  const openAddModal = () => {
    setSelectedTanker(null);
    setTankerNumber('');
    setVehicleNumber('');
    setDriverName('');
    setDriverMobile('');
    setCapacity('');
    setTransporterName('');
    setGpsLocation('');
    setFuelType('');
    setLoadingDate('');
    setDispatchDate('');
    setDeliveryDate('');
    setSourceLocation('');
    setDestinationLocation('');
    setStatus('Idle');
    setRemarks('');
    setModalMode('add');
    setIsModalOpen(true);
  };

  const openEditModal = (t: Tanker) => {
    setSelectedTanker(t);
    setTankerNumber(t.tankerNumber || '');
    setVehicleNumber(t.vehicleNumber || t.tankerNumber || '');
    setDriverName(t.driverName || '');
    setDriverMobile(t.driverMobile || '');
    setCapacity(t.capacity !== undefined ? t.capacity : (t.capacityKl !== undefined ? t.capacityKl : ''));
    setTransporterName(t.transporterName || '');
    setGpsLocation(t.gpsLocation || '');
    setFuelType(t.fuelType || '');
    setLoadingDate(t.loadingDate || '');
    setDispatchDate(t.dispatchDate || '');
    setDeliveryDate(t.deliveryDate || '');
    setSourceLocation(t.sourceLocation || '');
    setDestinationLocation(t.destinationLocation || '');
    setStatus(t.status || t.currentStatus || 'Idle');
    setRemarks(t.remarks || '');
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tankerNumber.trim()) {
      alert('Tanker / Vehicle Registration Code is required.');
      return;
    }

    const payload = {
      tankerNumber: tankerNumber.trim().toUpperCase(),
      vehicleNumber: (vehicleNumber || tankerNumber).trim().toUpperCase(),
      driverName: driverName.trim(),
      driverMobile: driverMobile.trim(),
      capacity: Number(capacity) || 0,
      capacityKl: Number(capacity) || 0,
      transporterName: transporterName.trim() || 'General Log',
      gpsLocation: gpsLocation.trim() || 'Depot HQ Yard',
      fuelType: fuelType.trim(),
      loadingDate,
      dispatchDate,
      deliveryDate,
      sourceLocation: sourceLocation.trim(),
      destinationLocation: destinationLocation.trim(),
      status,
      currentStatus: status,
      remarks: remarks.trim()
    };

    if (modalMode === 'add') {
      await onAddTanker(payload);
    } else if (modalMode === 'edit' && selectedTanker) {
      await onUpdateTanker(selectedTanker.id, payload);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (selectedTanker && window.confirm(`Confirm removing and voiding vehicle registration ${selectedTanker.tankerNumber} from current logistics files?`)) {
      await onDeleteTanker(selectedTanker.id);
      setIsModalOpen(false);
    }
  };

  // 3. Multi-filtering logic
  const filtered = tankers.filter(t => {
    // Search Filter
    const searchLow = searchTerm.toLowerCase();
    const matchesSearch =
      (t.tankerNumber || '').toLowerCase().includes(searchLow) ||
      (t.vehicleNumber || '').toLowerCase().includes(searchLow) ||
      (t.driverName || '').toLowerCase().includes(searchLow) ||
      (t.driverMobile || '').toLowerCase().includes(searchLow) ||
      (t.sourceLocation || '').toLowerCase().includes(searchLow) ||
      (t.destinationLocation || '').toLowerCase().includes(searchLow);

    // Status Filter
    const activeStatus = (t.status || t.currentStatus || 'Idle');
    let matchesStatus = true;
    if (statusFilter !== 'All') {
      if (statusFilter === 'Active') {
        matchesStatus = activeStatus !== 'Idle';
      } else {
        matchesStatus = activeStatus.toLowerCase() === statusFilter.toLowerCase();
      }
    }

    // Date Filter
    let matchesDate = true;
    if (dateFilter) {
      matchesDate =
        (t.loadingDate || '').includes(dateFilter) ||
        (t.dispatchDate || '').includes(dateFilter) ||
        (t.deliveryDate || '').includes(dateFilter);
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-slate-800 shrink-0" />
            Active GPS Fuel Tanker Logistics
          </h1>
          <p className="text-xs text-slate-500">
            Control registered transport fleets, dispatch, loading logs, driver mobile identifiers, and delivery timestamps.
          </p>
        </div>
        <button
          onClick={openAddModal}
          id="btn-add-tanker"
          className="bg-slate-900 text-white rounded-lg px-3.5 py-1.5 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-colors shadow-2xs self-start sm:self-center"
        >
          <Plus className="w-4.5 h-4.5" />
          Register Tanker
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div id="metric-total-tankers" className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs flex flex-col justify-between">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Total Fleet</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[20px] font-extrabold text-slate-800 font-mono">{totalCount}</span>
            <span className="text-[10px] text-slate-400 font-semibold font-sans">Vehicles</span>
          </div>
        </div>

        <div id="metric-active-tankers" className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs flex flex-col justify-between">
          <span className="text-emerald-600 font-bold uppercase text-[10px] tracking-wider block">Active Fleet</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[20px] font-extrabold text-emerald-600 font-mono">{activeCount}</span>
            <span className="text-[10px] text-emerald-500 font-semibold font-sans">Dispatched</span>
          </div>
        </div>

        <div id="metric-in-transit" className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs flex flex-col justify-between">
          <span className="text-amber-600 font-bold uppercase text-[10px] tracking-wider block">In Transit</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[20px] font-extrabold text-amber-600 font-mono">{inTransitCount}</span>
            <span className="text-[10px] text-amber-500 font-semibold font-sans">To Station</span>
          </div>
        </div>

        <div id="metric-delivered" className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs flex flex-col justify-between">
          <span className="text-blue-600 font-bold uppercase text-[10px] tracking-wider block">Delivered / Decanted</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[20px] font-extrabold text-blue-600 font-mono">{deliveredCount}</span>
            <span className="text-[10px] text-blue-500 font-semibold font-sans font-medium">Completed</span>
          </div>
        </div>
      </div>

      {/* Search and Filters panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search vehicle reg, driver rep, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-hidden focus:border-slate-400"
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="Idle">Idle (HQ Yard)</option>
              <option value="Active">Active / Engaged</option>
              <option value="Dispatched to HPCL Depot">Dispatched to Depot</option>
              <option value="In-Transit to Pump">In Transit</option>
              <option value="Decanting at Pump">Decanting</option>
              <option value="Delivered">Delivered / Offloaded</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="md:col-span-3 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-hidden"
            />
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || statusFilter !== 'All' || dateFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
                setDateFilter('');
              }}
              className="md:col-span-1 text-[11px] text-red-500 font-semibold hover:underline text-center w-full"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Grid view of tankers with location cues */}
      {filtered.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-10 text-center">
          <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
          <h3 className="text-xs font-bold text-slate-700">No Tankers Found</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Adjust filter settings or register a new fuel tanker.</p>
        </div>
      ) : (
        <div id="tanker-logistics-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(tkr => {
            const currentStat = tkr.status || tkr.currentStatus || 'Idle';
            let statusBadgeClass = 'border-slate-200 bg-slate-50 text-slate-700';
            let radarDot = 'bg-slate-400';

            if (currentStat === 'Decanting at Pump' || currentStat === 'Delivered') {
              statusBadgeClass = 'border-emerald-200 bg-emerald-50 text-emerald-800 font-bold';
              radarDot = 'bg-emerald-600 animate-pulse';
            } else if (currentStat === 'In-Transit to Pump' || currentStat === 'In Transit') {
              statusBadgeClass = 'border-amber-200 bg-amber-50 text-amber-800 font-medium';
              radarDot = 'bg-amber-500 animate-ping';
            } else if (currentStat === 'Dispatched to HPCL Depot' || currentStat.includes('Depot')) {
              statusBadgeClass = 'border-sky-200 bg-sky-50 text-sky-800';
              radarDot = 'bg-sky-600 animate-pulse';
            } else if (currentStat === 'Idle') {
              statusBadgeClass = 'border-slate-200 bg-slate-100/70 text-slate-500';
              radarDot = 'bg-slate-350';
            }

            return (
              <div
                key={tkr.id}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between relative group hover:border-slate-250 transition-all"
              >
                {/* Edit Pencil icon in corner */}
                <button
                  onClick={() => openEditModal(tkr)}
                  className="absolute right-3.5 top-3.5 p-1 text-slate-400 hover:text-slate-850 bg-slate-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Modify properties"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>

                <div>
                  <div className="flex items-center justify-between mb-3 text-[10px]">
                    <span className="font-mono text-slate-400 font-bold uppercase">{tkr.id}</span>
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className={`w-2 h-2 rounded-full block ${radarDot}`}></span>
                      <span className={`px-1.5 py-0.5 border text-[9px] rounded-sm ${statusBadgeClass}`}>{currentStat}</span>
                    </div>
                  </div>

                  {/* Primary Plate number */}
                  <div className="w-full p-2.5 rounded-xl bg-slate-900 text-white flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Truck className="w-4.5 h-4.5 text-amber-400 shrink-0" />
                      <span className="font-mono text-xs tracking-wider font-extrabold truncate" title={tkr.tankerNumber}>
                        {tkr.tankerNumber}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded shrink-0 font-mono font-bold leading-none">
                      {tkr.capacity !== undefined ? tkr.capacity : tkr.capacityKl || 0} KL Cap
                    </span>
                  </div>

                  {/* Operational loading & locations tracking info */}
                  <div className="space-y-2.5 border-t border-slate-50 pt-2 text-[11px] leading-relaxed">
                    {tkr.fuelType && (
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="text-slate-400">Payload Fuel:</span>
                        <span className="font-semibold px-2 py-0.5 rounded-sm bg-amber-50 text-amber-900 text-[10px] font-mono">{tkr.fuelType}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-slate-405 block text-[9px] uppercase font-bold tracking-wider">Driver Rep</span>
                        <span className="text-slate-800 font-bold block truncate">{tkr.driverName || 'Unassigned'}</span>
                        <span className="text-slate-500 font-mono text-[9px] block">{tkr.driverMobile || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-405 block text-[9px] uppercase font-bold tracking-wider">Transporter</span>
                        <span className="text-slate-700 block truncate">{tkr.transporterName || 'General'}</span>
                      </div>
                    </div>

                    {(tkr.sourceLocation || tkr.destinationLocation) && (
                      <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100 space-y-1 text-[10px]">
                        {tkr.sourceLocation && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Origin:</span>
                            <span className="text-slate-700 font-medium truncate max-w-[120px]">{tkr.sourceLocation}</span>
                          </div>
                        )}
                        {tkr.destinationLocation && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Destination:</span>
                            <span className="text-slate-700 font-medium truncate max-w-[120px]">{tkr.destinationLocation}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Timeline dates of loading/dispatch */}
                    {(tkr.loadingDate || tkr.dispatchDate || tkr.deliveryDate) && (
                      <div className="text-[10px] space-y-0.5 border-t border-slate-50 pt-1.5 text-slate-500">
                        {tkr.loadingDate && (
                          <div className="flex justify-between">
                            <span>Loaded:</span>
                            <span className="font-mono font-medium">{tkr.loadingDate}</span>
                          </div>
                        )}
                        {tkr.dispatchDate && (
                          <div className="flex justify-between">
                            <span>Dispatched:</span>
                            <span className="font-mono font-medium">{tkr.dispatchDate}</span>
                          </div>
                        )}
                        {tkr.deliveryDate && (
                          <div className="flex justify-between text-emerald-700">
                            <span>Delivered:</span>
                            <span className="font-mono font-bold">{tkr.deliveryDate}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {tkr.remarks && (
                      <div className="text-[10px] text-slate-400 bg-amber-50/20 px-2 py-1 border border-amber-100/30 rounded italic truncate" title={tkr.remarks}>
                        "{tkr.remarks}"
                      </div>
                    )}
                  </div>
                </div>

                {/* GPS indicator */}
                <div className="mt-3 p-2 bg-sky-50 border border-sky-100 rounded-xl flex items-start gap-2 text-[10px] text-sky-900 leading-normal">
                  <MapPin className="w-3.5 h-3.5 text-sky-700 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="font-bold block text-[9px]">GPS Telemetry:</span>
                    <span className="font-medium text-slate-700 truncate block">{tkr.gpsLocation || 'HQ Base Tower'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Register / Edit Tanker Slideover/Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto flex flex-col justify-between animate-grow-in">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  {modalMode === 'add' ? 'Register Transporter Fuel Tanker' : `Update System Record: ${tankerNumber}`}
                </h2>
                <p className="text-[10px] text-slate-400">Register tankers and record current driver assignments & dispatch statuses.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Tanker Plate Number */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Tanker Number (Reg Code) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MH-43-Y-5421"
                    value={tankerNumber}
                    onChange={(e) => setTankerNumber(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-hidden focus:border-slate-400"
                  />
                </div>

                {/* Optional Vehicle Chassis Number */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Secondary Vehicle Plate / Chassis No
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MH-43-Y-5421"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-hidden focus:border-slate-400"
                  />
                </div>

                {/* Capacity */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Capacity (in KL / KiloLiters)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 12"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value !== '' ? Number(e.target.value) : '')}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-hidden focus:border-slate-400"
                  />
                </div>

                {/* Fuel Type */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Payload Fuel Type
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-hidden"
                  >
                    <option value="">None (Empty Carrier)</option>
                    <option value="Petrol (MS)">Petrol (MS)</option>
                    <option value="Diesel (HSD)">Diesel (HSD)</option>
                    <option value="Speed Premium">Speed Premium</option>
                  </select>
                </div>

                {/* Driver Name */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Driver Assigned *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ritesh Kumar"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-hidden focus:border-slate-400"
                  />
                </div>

                {/* Driver phone */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Emergency Mobile *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={driverMobile}
                    onChange={(e) => setDriverMobile(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-hidden focus:border-slate-400"
                  />
                </div>

                {/* Transporter Company */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Transporter Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HPCL Logistics Corp"
                    value={transporterName}
                    onChange={(e) => setTransporterName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-hidden"
                  />
                </div>

                {/* Current GPS coordinates style */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    GPS Coordinates / Location Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HPCL Depot (Vashi Yard)"
                    value={gpsLocation}
                    onChange={(e) => setGpsLocation(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-hidden"
                  />
                </div>

                {/* Status selector */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Dispatch Status Mode
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-hidden"
                  >
                    <option value="Idle">Idle (at base)</option>
                    <option value="Dispatched to HPCL Depot">Dispatched to Depot</option>
                    <option value="In-Transit to Pump">In Transit to Pump</option>
                    <option value="Decanting at Pump">Decanting at Pump</option>
                    <option value="Delivered">Delivered / Offloaded Completed</option>
                  </select>
                </div>

                {/* Operational Dates block */}
                <div className="col-span-2 grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-tight mb-1">Loading Date</label>
                    <input
                      type="date"
                      value={loadingDate}
                      onChange={(e) => setLoadingDate(e.target.value)}
                      className="w-full px-2 py-1 border border-slate-200 rounded-lg text-[11px] bg-slate-50 text-slate-800 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-tight mb-1">Dispatch Date</label>
                    <input
                      type="date"
                      value={dispatchDate}
                      onChange={(e) => setDispatchDate(e.target.value)}
                      className="w-full px-2 py-1 border border-slate-200 rounded-lg text-[11px] bg-slate-50 text-slate-800 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-tight mb-1">Delivery Date</label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full px-2 py-1 border border-slate-200 rounded-lg text-[11px] bg-slate-50 text-slate-800 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Locations origin/target */}
                <div className="col-span-2 grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Origin Hub / Depot</label>
                    <input
                      type="text"
                      placeholder="e.g. HPCL Vashi Terminal"
                      value={sourceLocation}
                      onChange={(e) => setSourceLocation(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Destination Pump</label>
                    <input
                      type="text"
                      placeholder="e.g. FuelFlower Pump Yard"
                      value={destinationLocation}
                      onChange={(e) => setDestinationLocation(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Remarks notes */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Internal Dispatch Remarks
                  </label>
                  <textarea
                    placeholder="Seals checked, GPS online, standard delivery route assigned."
                    rows={2}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Action and submit buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-3">
                {modalMode === 'edit' ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Void Carrier
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-1.5 border border-slate-205 rounded-lg text-xs text-slate-600 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-850"
                  >
                    {modalMode === 'add' ? 'Register Tanker' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
