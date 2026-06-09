/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search, SlidersHorizontal, ArrowDownToLine, Printer, Plus,
  FileText, CheckCircle2, AlertTriangle, HelpCircle, ArrowRightLeft,
  ChevronDown, DollarSign, Wallet, Calendar, Sparkles, Filter, X,
  Download, Calculator, RefreshCw, Edit2, Trash2
} from 'lucide-react';
import { DailyFuelSale, CollectionBreakdown, CashEntry, ExpenseEntry, CollectionEntry } from '../../types';

// ============================================================================
// 1. FUEL SALES SCREEN
// ============================================================================
interface FuelSalesScreenProps {
  sales: DailyFuelSale[];
  onAddSale: (sale: DailyFuelSale) => void;
}

export function FuelSalesScreen({ sales, onAddSale }: FuelSalesScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [fuelFilter, setFuelFilter] = useState('All');
  const [shiftFilter, setShiftFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  // Live Sandbox Interactive Calculator local state
  const [sandboxNozzle, setSandboxNozzle] = useState('NZ-P1');
  const [sandboxFuel, setSandboxFuel] = useState<'Petrol' | 'Diesel' | 'Speed Petrol'>('Petrol');
  const [sandboxOpening, setSandboxOpening] = useState(485250.2);
  const [sandboxClosing, setSandboxClosing] = useState(486540.8);
  const [sandboxTesting, setSandboxTesting] = useState(10.0);
  const [sandboxRate, setSandboxRate] = useState(104.20);
  const [sandboxShift, setSandboxShift] = useState<'Shift A (06:00 - 14:00)' | 'Shift B (14:00 - 22:00)' | 'Shift C (22:00 - 06:00)'>('Shift A (06:00 - 14:00)');
  const [sandboxOperator, setSandboxOperator] = useState('Dilip Tambe');

  // New record form state
  const [nozzleId, setNozzleId] = useState('NZ-P1');
  const [fuelType, setFuelType] = useState<'Petrol' | 'Diesel' | 'Speed Petrol'>('Petrol');
  const [opening, setOpening] = useState(488120.4);
  const [closing, setClosing] = useState(489240.8);
  const [testing, setTesting] = useState(10);
  const [rate, setRate] = useState(104.20);
  const [shift, setShift] = useState<'Shift A (06:00 - 14:00)' | 'Shift B (14:00 - 22:00)' | 'Shift C (22:00 - 06:00)'>('Shift A (06:00 - 14:00)');
  const [operator, setOperator] = useState('Ramesh Sawant');

  // Auto Calculations for adding form dialog
  const netAutoCalculatedLiters = parseFloat((closing - opening - testing).toFixed(2));
  const autoEstimateCollectible = parseFloat((netAutoCalculatedLiters * rate).toFixed(2));

  // Auto Calculations for sandbox card
  const sandboxRawDiff = sandboxClosing - sandboxOpening;
  const sandboxAutoLiters = parseFloat((sandboxClosing - sandboxOpening - sandboxTesting).toFixed(2));
  const sandboxEstValue = parseFloat((sandboxAutoLiters * sandboxRate).toFixed(2));

  const handleNozzleChange = (id: string, isForSandbox: boolean) => {
    let fType: 'Petrol' | 'Diesel' | 'Speed Petrol' = 'Petrol';
    let r = 104.20;
    if (id.startsWith('NZ-P')) {
      fType = 'Petrol';
      r = 104.20;
    } else if (id.startsWith('NZ-D')) {
      fType = 'Diesel';
      r = 92.50;
    } else {
      fType = 'Speed Petrol';
      r = 111.40;
    }

    if (isForSandbox) {
      setSandboxNozzle(id);
      setSandboxFuel(fType);
      setSandboxRate(r);
    } else {
      setNozzleId(id);
      setFuelType(fType);
      setRate(r);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (netAutoCalculatedLiters <= 0) {
      alert('Error: Net sales liters cannot be zero/negative. Verify readings.');
      return;
    }
    const newEntry: DailyFuelSale = {
      id: `SL-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      nozzleId,
      fuelType,
      openingReading: opening,
      closingReading: closing,
      testingQty: testing,
      salesQty: netAutoCalculatedLiters,
      rate,
      totalAmt: autoEstimateCollectible,
      shift,
      operator,
      status: 'Pending Verification'
    };
    onAddSale(newEntry);
    setIsFormOpen(false);
  };

  const handleCommitSandbox = () => {
    if (sandboxAutoLiters <= 0) {
      alert('Error: Net auto sales liters cannot be zero/negative. Verify readings.');
      return;
    }
    const newEntry: DailyFuelSale = {
      id: `SL-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      nozzleId: sandboxNozzle,
      fuelType: sandboxFuel,
      openingReading: sandboxOpening,
      closingReading: sandboxClosing,
      testingQty: sandboxTesting,
      salesQty: sandboxAutoLiters,
      rate: sandboxRate,
      totalAmt: sandboxEstValue,
      shift: sandboxShift,
      operator: sandboxOperator,
      status: 'Pending Verification'
    };
    onAddSale(newEntry);
    setExportNotification(`Success! Real-time Totalizer entry logged directly for Nozzle ${sandboxNozzle} (${sandboxFuel}).`);
    setTimeout(() => setExportNotification(null), 5000);
  };

  const handleExport = (format: 'CSV' | 'PDF' | 'Excel') => {
    setExportNotification(`Successfully prepared & exported ${filtered.length} matching meter logs to Ashok_Fuels_Nozzle_Logs.${format === 'PDF' ? 'pdf' : format === 'CSV' ? 'csv' : 'xlsx'}`);
    setTimeout(() => setExportNotification(null), 6000);
  };

  const filtered = sales.filter(item => {
    const matchesSearch = item.nozzleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.operator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFuel = fuelFilter === 'All' || item.fuelType === fuelFilter;
    const matchesShift = shiftFilter === 'All' || item.shift.toLowerCase().includes(shiftFilter.toLowerCase());
    const matchesDate = dateFilter === 'All' || item.date === dateFilter;
    return matchesSearch && matchesFuel && matchesShift && matchesDate;
  });

  const uniqueDates = Array.from(new Set(sales.map(item => item.date))).sort().reverse();

  // Consolidated Aggregates
  const totalVolumeSold = filtered.reduce((acc, c) => acc + c.salesQty, 0);
  const totalGrossRevenue = filtered.reduce((acc, c) => acc + c.totalAmt, 0);
  const totalCalibrationLoss = filtered.reduce((acc, c) => acc + c.testingQty, 0);
  const loggedNozzlesCount = new Set(filtered.map(c => c.nozzleId)).size;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* 1. TOP HEADER ROW */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Nozzle Meter Fuel Sales Log</h1>
          <p className="text-xs text-slate-500">Record and analyze mechanical and electronic totalizer parameters per attendant shift.</p>
        </div>
        <div className="flex gap-2 shrink-0 font-sans">
          <button
            onClick={() => {
              setOpening(488120.4);
              setClosing(489240.8);
              setTesting(10);
              handleNozzleChange('NZ-P1', false);
              setIsFormOpen(true);
            }}
            className="bg-sky-950 text-white hover:bg-sky-900 border border-sky-850 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Record Meter Readings</span>
          </button>
        </div>
      </div>

      {/* SUCCESS/EXPORT NOTIFICATION BAR */}
      {exportNotification && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3.5 rounded-xl flex items-center gap-2 shadow-2xs animate-fade-in text-xs text-emerald-800 font-medium font-sans">
          <span className="p-1 bg-emerald-100 rounded-full text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
          </span>
          <p>{exportNotification}</p>
        </div>
      )}

      {/* 2. OPERATIONAL SUMMARY CODES (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        <div className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-3xs hover:border-slate-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Total Fuel Disbursed</span>
            <span className="p-1.5 bg-sky-50 text-sky-800 rounded-lg">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            </span>
          </div>
          <div className="mt-2.5">
            <h2 className="text-lg font-extrabold text-slate-900 font-mono leading-none">
              {totalVolumeSold.toLocaleString(undefined, { maximumFractionDigits: 2 })} L
            </h2>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 font-medium">
              <span className="text-emerald-600 font-bold">Consolidated net</span>
              <span>across filtered set</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-3xs hover:border-slate-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Gross Wet Value</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-800 rounded-lg">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2.5">
            <h2 className="text-lg font-extrabold text-emerald-700 font-mono leading-none">
              ₹ {totalGrossRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </h2>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 font-medium">
              <span className="text-slate-400 font-bold">Excluding VAT credits</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-3xs hover:border-slate-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Calibration Testing</span>
            <span className="p-1.5 bg-amber-50 text-amber-800 rounded-lg">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2.5">
            <h2 className="text-lg font-extrabold text-slate-900 font-mono leading-none">
              {totalCalibrationLoss.toLocaleString(undefined, { maximumFractionDigits: 1 })} L
            </h2>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-700 font-bold">
              <span>Stamp exempt volume</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-3xs hover:border-slate-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Nozzle Activity</span>
            <span className="p-1.5 bg-slate-50 text-slate-800 rounded-lg">
              <Calculator className="w-3.5 h-3.5 animate-pulse" />
            </span>
          </div>
          <div className="mt-2.5">
            <h2 className="text-lg font-extrabold text-slate-800 font-mono leading-none">
              {loggedNozzlesCount} Nozzles active
            </h2>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
              <span>Out of 5 physical totalizers</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CORE ADAPTIVE SPLIT GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start font-sans">
        
        {/* LEFT 3 COLUMNS: TABLE LISTING AND FILTERS */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* MULTI FILTER PANEL BAR */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs space-y-3.5">
            
            {/* Top row: search & fuel filter */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-4 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search operator, nozzle tag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white text-slate-850 placeholder-slate-400 outline-none transition"
                />
              </div>

              {/* Fuel Product Filter Buttons */}
              <div className="md:col-span-5 flex flex-wrap items-center gap-1.5">
                {['All', 'Petrol', 'Diesel', 'Speed Petrol'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFuelFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition cursor-pointer border ${
                      fuelFilter === cat
                        ? 'bg-sky-950 text-white border-sky-900 shadow-3xs'
                        : 'bg-slate-50 text-slate-600 border-slate-150 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Quick Exports Segment */}
              <div className="md:col-span-3 flex justify-end gap-1.5 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                <button
                  type="button"
                  onClick={() => handleExport('CSV')}
                  className="bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-3xs cursor-pointer transition shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" /> Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('PDF')}
                  className="bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-3xs cursor-pointer transition shrink-0"
                >
                  <FileText className="w-3.5 h-3.5 text-red-500" /> PDF
                </button>
              </div>
            </div>

            {/* Bottom row: shift & date filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3.5 border-t border-slate-50 text-xs">
              
              {/* Shift Filter dropdown pills */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Filter by Operating Shift</label>
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: 'All', label: 'All Shifts' },
                    { id: 'Shift A', label: 'Shift A' },
                    { id: 'Shift B', label: 'Shift B' },
                    { id: 'Shift C', label: 'Shift C' }
                  ].map(sh => (
                    <button
                      key={sh.id}
                      onClick={() => setShiftFilter(sh.id)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition ${
                        (sh.id === 'All' && shiftFilter === 'All') || (sh.id !== 'All' && shiftFilter.includes(sh.id))
                          ? 'bg-sky-900 border-sky-850 text-amber-400 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {sh.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date selection dropdown & quick resets */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Operational Date Calendar</label>
                <div className="flex items-center gap-2">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-none flex-1"
                  >
                    <option value="All">All Registered Dates ({uniqueDates.length} days)</option>
                    {uniqueDates.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => setDateFilter('2026-06-06')}
                      className={`px-2 py-1 text-[10.5px] font-semibold border rounded-lg transition ${
                        dateFilter === '2026-06-06' ? 'bg-sky-50 border-sky-200 text-sky-850' : 'bg-white text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setDateFilter('All')}
                      className="px-2 py-1 text-[10.5px] font-medium border border-dashed rounded-lg text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* MAIN NOZZLE READINGS TABLE */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-3xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    <th className="p-3.5">Filing Nozzle Details</th>
                    <th className="p-3.5">Assigned Attendant</th>
                    <th className="p-3.5 text-right">Odometer Opening</th>
                    <th className="p-3.5 text-right">Odometer Closing</th>
                    <th className="p-3.5 text-right">Tested</th>
                    <th className="p-3.5 text-right bg-sky-50/20 text-sky-950 font-bold">Auto Net Sales</th>
                    <th className="p-3.5 text-right">Rate</th>
                    <th className="p-3.5 text-right">Gross Total Sum</th>
                    <th className="p-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filtered.length > 0 ? (
                    filtered.map((item) => {
                      const isSpeed = item.fuelType === 'Speed Petrol';
                      const isDiesel = item.fuelType === 'Diesel';
                      const badgeColor = isSpeed ? 'bg-amber-100 text-amber-800 border-amber-205' : isDiesel ? 'bg-slate-100 text-slate-800 border-slate-205' : 'bg-sky-100 text-sky-850 border-sky-200';
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition">
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 border rounded text-[10px] font-mono leading-none font-bold shrink-0 ${badgeColor}`}>
                                {item.nozzleId}
                              </span>
                              <div>
                                <span className="font-semibold text-slate-900 block truncate max-w-[100px]">{item.fuelType}</span>
                                <span className="text-[10px] text-slate-400 font-mono block">{item.id} • {item.date}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="font-semibold text-slate-800 block">{item.operator}</span>
                            <span className="text-[10px] text-slate-400 font-sans block">{item.shift}</span>
                          </td>
                          <td className="p-3.5 text-right font-mono text-slate-600 font-medium">{item.openingReading.toLocaleString()}</td>
                          <td className="p-3.5 text-right font-mono text-slate-600 font-medium">{item.closingReading.toLocaleString()}</td>
                          <td className="p-3.5 text-right font-mono text-slate-500">{item.testingQty > 0 ? `${item.testingQty} L` : '-'}</td>
                          <td className="p-3.5 text-right font-bold font-mono bg-sky-50/10 text-sky-950 text-[12.5px]">
                            {item.salesQty.toLocaleString()} L
                          </td>
                          <td className="p-3.5 text-right font-mono text-slate-500">₹{item.rate.toFixed(2)}</td>
                          <td className="p-3.5 text-right font-extrabold font-mono text-slate-900">₹{item.totalAmt.toLocaleString()}</td>
                          <td className="p-3.5 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                              item.status === 'Completed' 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                                : 'bg-amber-50 text-amber-800 border-amber-100'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Completed' ? 'bg-emerald-600' : 'bg-amber-600 animate-pulse'}`} />
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400 font-medium font-sans">
                        No Daily Fuel totalizer logs match the active parameters or dates filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer counts */}
            <div className="bg-slate-50/50 px-4 py-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-mono font-medium">
              <span>Showing {filtered.length} Nozzle Logs in registry</span>
              <span className="font-bold text-slate-700">Accumulated Sum: {totalVolumeSold.toLocaleString()} L</span>
            </div>
          </div>

        </div>

        {/* RIGHT 1 COLUMN: INTERACTIVE TOTALIZER LIVE PLAYGROUND SANDBOX */}
        <div className="lg:col-span-1 space-y-4">
          
          <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md overflow-hidden animate-slide-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-sky-950 to-slate-900 p-4 border-b border-slate-800 flex items-center justify-between font-sans">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">Nozzle Live Sandbox</span>
              </div>
              <span className="text-[9px] bg-sky-900/50 text-sky-450 px-1.5 py-0.5 rounded font-mono font-bold leading-none uppercase select-none">Pre-check</span>
            </div>

            {/* Inputs block */}
            <div className="p-4.5 space-y-3.5 text-xs font-sans">
              <p className="text-[11px] text-slate-400 leading-normal">
                Pre-calculate meter difference and test allocations before committing readings.
              </p>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold font-mono tracking-wider">Select Nozzle to Pre-check</label>
                <select
                  value={sandboxNozzle}
                  onChange={(e) => handleNozzleChange(e.target.value, true)}
                  className="w-full bg-slate-800 text-white border border-slate-700 p-2 rounded-lg text-xs font-medium focus:outline-none"
                >
                  <option value="NZ-P1">NZ-P1 (Petrol MS)</option>
                  <option value="NZ-P2">NZ-P2 (Petrol MS)</option>
                  <option value="NZ-D1">NZ-D1 (Diesel HSD)</option>
                  <option value="NZ-D2">NZ-D2 (Diesel HSD)</option>
                  <option value="NZ-SP1">NZ-SP1 (Speed)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold font-mono tracking-wider">Opening reading</label>
                  <input
                    type="number"
                    step="0.01"
                    value={sandboxOpening}
                    onChange={(e) => setSandboxOpening(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-850 text-white border border-slate-700 p-2 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold font-mono tracking-wider">Closing reading</label>
                  <input
                    type="number"
                    step="0.01"
                    value={sandboxClosing}
                    onChange={(e) => setSandboxClosing(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-850 text-white border border-slate-700 p-2 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold font-mono tracking-wider">Stamp tests (L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={sandboxTesting}
                    onChange={(e) => setSandboxTesting(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-850 text-white border border-slate-700 p-2 rounded-lg text-xs font-mono focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold font-mono tracking-wider">Fuel Rate (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={sandboxRate}
                    onChange={(e) => setSandboxRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-850 text-amber-400 border border-slate-700 p-2 rounded-lg text-xs font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold font-mono tracking-wider">Sandbox Shift</label>
                  <select
                    value={sandboxShift}
                    onChange={(e) => setSandboxShift(e.target.value as any)}
                    className="w-full bg-slate-800 text-white text-[11px] border border-slate-700 p-2 rounded-lg focus:outline-none focus:border-sky-550"
                  >
                    <option value="Shift A (06:00 - 14:00)">Shift A (A.M.)</option>
                    <option value="Shift B (14:00 - 22:00)">Shift B (P.M.)</option>
                    <option value="Shift C (22:00 - 06:00)">Shift C (Night)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold font-mono tracking-wider">Attendant staff</label>
                  <input
                    type="text"
                    value={sandboxOperator}
                    onChange={(e) => setSandboxOperator(e.target.value)}
                    className="w-full bg-slate-850 text-slate-200 border border-slate-700 p-2 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* DYNAMIC AUTO SALES LITRES DISPLAY CARDS */}
              <div className="bg-slate-950 p-3 rounded-xl space-y-2 mt-4 border border-slate-800">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest font-mono block">Auto Sales Litres Output</span>
                
                <div className="flex items-baseline justify-between select-none">
                  <span className="text-[10px] text-slate-400 font-medium">Totalizer Meter Diff:</span>
                  <span className="font-mono text-xs text-white">{sandboxRawDiff > 0 ? `${sandboxRawDiff.toFixed(2)} L` : '0 L'}</span>
                </div>
                <div className="flex items-baseline justify-between border-b border-slate-800 pb-1.5 select-none">
                  <span className="text-[10px] text-slate-400 font-medium">Calibration deduct (L):</span>
                  <span className="font-mono text-xs text-red-400 font-bold">-{sandboxTesting.toFixed(1)} L</span>
                </div>

                <div className="pt-1 select-none">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Calculated net sold:</span>
                  <div className="text-xl font-extrabold text-amber-400 font-mono tracking-tight">
                    {sandboxAutoLiters > 0 ? `${sandboxAutoLiters.toLocaleString()} L` : '0.00 L'}
                  </div>
                  <div className="text-xs text-slate-300 font-mono font-semibold py-0.5">
                    Est. Value: <span className="text-emerald-400 font-extrabold">₹{sandboxEstValue > 0 ? sandboxEstValue.toLocaleString() : '0'}</span>
                  </div>
                </div>
              </div>

              {/* ACTION TOOL FOR QUICK INJECT */}
              <button
                type="button"
                onClick={handleCommitSandbox}
                disabled={sandboxAutoLiters <= 0}
                className="w-full py-2.5 mt-2 bg-gradient-to-tr from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 disabled:from-slate-755 disabled:to-slate-755 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs cursor-pointer transition flex items-center justify-center gap-1.5 uppercase tracking-wide border border-amber-600"
              >
                <Plus className="w-3.5 h-3.5 text-slate-950" /> Commit Checked readings
              </button>

            </div>
          </div>
          
          {/* HELP INFO TIP */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-3xs p-4 space-y-2 font-sans">
            <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider font-extrabold text-slate-700">
              <HelpCircle className="w-3.5 h-3.5 text-sky-800" /> Accounting formula
            </span>
            <p className="text-[10.5px] text-slate-500 leading-normal font-sans">
              Digital totalizer readings reflect displacement flow. The daily operating value is computed as:
            </p>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono text-[10px] font-bold text-slate-700 leading-none py-2.5 text-center">
              Net Sold = (Closing - Opening) - Testing
            </div>
          </div>

        </div>

      </div>

      {/* 4. METER ENTRY DIALOG MODAL / OVERLAY */}
      {isFormOpen && (
        <div id="nozzle-modal-overlay" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden animate-slide-in">
            <div className="bg-sky-950 p-4 text-white flex items-center justify-between border-b border-sky-900">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1 font-sans">
                  <Calculator className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
                  Record Outlet Totalizer readings
                </h3>
                <p className="text-[11px] text-sky-200">Submit electronic dispenser parameters for shift closure auditing.</p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)} 
                className="text-sky-200 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Disbursing Nozzle Tag</label>
                  <select
                    value={nozzleId}
                    onChange={(e) => handleNozzleChange(e.target.value, false)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-sky-850"
                  >
                    <option value="NZ-P1">Nozzle 1 (Petrol - NZ-P1)</option>
                    <option value="NZ-P2">Nozzle 2 (Petrol - NZ-P2)</option>
                    <option value="NZ-D1">Nozzle 3 (Diesel - NZ-D1)</option>
                    <option value="NZ-D2">Nozzle 4 (Diesel - NZ-D2)</option>
                    <option value="NZ-SP1">Nozzle 5 (Speed MS - NZ-SP1)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Product Fuel Base</label>
                  <input
                    type="text"
                    readOnly
                    value={fuelType}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-slate-100 rounded-lg text-slate-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Opening Reading</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={opening}
                    onChange={(e) => setOpening(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg font-mono font-bold bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Closing Reading</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={closing}
                    onChange={(e) => setClosing(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg font-mono font-bold bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Calibrations (L)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={testing}
                    onChange={(e) => setTesting(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg font-mono bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Assigned Shift</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value as any)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                  >
                    <option value="Shift A (06:00 - 14:00)">Shift A (06:00 - 14:00)</option>
                    <option value="Shift B (14:00 - 22:00)">Shift B (14:00 - 22:00)</option>
                    <option value="Shift C (22:00 - 06:00)">Shift C (22:00 - 06:00)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Operator/Attendant</label>
                  <input
                    type="text"
                    required
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-slate-800 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Today's Shift Rate (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 border border-slate-200 font-mono font-extrabold rounded-lg bg-slate-50 text-sky-950 focus:bg-white"
                />
              </div>

              {/* LIVE AUTO CALCULATED DISPLAY INSIDE REGISTER WINDOW */}
              <div className="bg-sky-50 border border-sky-100 p-3.5 rounded-xl text-xs text-sky-900 space-y-1.5 shadow-3xs uppercase">
                <span className="font-bold text-sky-900 block uppercase tracking-wider text-[10px] font-mono mb-1">Calculated Auto values:</span>
                <div className="flex justify-between font-medium">
                  <span>Gross Odom Diff:</span>
                  <span className="font-mono">{opening > 0 && closing > opening ? `${(closing - opening).toFixed(2)} L` : '0 L'}</span>
                </div>
                <div className="flex justify-between font-bold text-[13px] border-t border-sky-200/50 pt-1.5 text-sky-950">
                  <span>Net Auto Sales Litres:</span>
                  <span className="font-mono">{netAutoCalculatedLiters > 0 ? `${netAutoCalculatedLiters.toLocaleString()} L` : '0.00 L'}</span>
                </div>
                <div className="flex justify-between font-extrabold text-emerald-800 text-[13.5px] border-t border-dashed border-sky-200/50 pt-1.5">
                  <span>Est. Collectible Sheet Sum:</span>
                  <span>₹ {autoEstimateCollectible > 0 ? autoEstimateCollectible.toLocaleString() : '0.00'}</span>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-950 hover:bg-sky-900 text-white text-xs rounded-lg font-semibold shadow-3xs"
                >
                  Commit New Meter Log
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
// 2. COLLECTIONS SCREENS SCREEN
// ============================================================================
interface CollectionsScreenProps {
  collections: CollectionBreakdown[];
  onVerify: (id: string) => void;
}

export function CollectionsScreen({ collections, onVerify }: CollectionsScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Dual Tab state: 'summaries' (preexisting unchanged UI) vs 'atlas' (MongoDB Atlas connection)
  const [viewTab, setViewTab] = useState<'summaries' | 'atlas'>('summaries');
  
  // MongoDB Atlas fine-grained data & form states
  const [atlasEntries, setAtlasEntries] = useState<CollectionEntry[]>([]);
  const [loadingAtlas, setLoadingAtlas] = useState(false);
  const [atlasDateFilter, setAtlasDateFilter] = useState('');
  const [atlasShiftFilter, setAtlasShiftFilter] = useState('All');
  const [atlasTypeFilter, setAtlasTypeFilter] = useState('All');
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CollectionEntry | null>(null);

  // Form inputs
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formShift, setFormShift] = useState('Shift A (06:00 - 14:00)');
  const [formType, setFormType] = useState<'Cash' | 'Paytm' | 'DT Plus' | 'Credit'>('Cash');
  const [formAmount, setFormAmount] = useState('');
  const [formOperator, setFormOperator] = useState('');
  const [formRemarks, setFormRemarks] = useState('');
  const [formStatus, setFormStatus] = useState<'Draft' | 'Verified'>('Draft');

  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  };

  // Fetch from Mongo Atlas
  const fetchAtlasEntries = async () => {
    setLoadingAtlas(true);
    try {
      const res = await fetch('/api/collections-entries');
      const json = await res.json();
      if (json.success && json.data) {
        setAtlasEntries(json.data);
      }
    } catch (e) {
      console.error('Failed to load MongoDB Atlas collections entries:', e);
    } finally {
      setLoadingAtlas(false);
    }
  };

  React.useEffect(() => {
    fetchAtlasEntries();
  }, []);

  const resetForm = () => {
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormShift('Shift A (06:00 - 14:00)');
    setFormType('Cash');
    setFormAmount('');
    setFormOperator('');
    setFormRemarks('');
    setFormStatus('Draft');
  };

  const handleEditClick = (entry: CollectionEntry) => {
    if (!entry._id) return;
    setEditingEntry(entry);
    setFormDate(entry.date);
    setFormShift(entry.shift);
    setFormType(entry.collectionType);
    setFormAmount(entry.amount.toString());
    setFormOperator(entry.operator);
    setFormRemarks(entry.remarks || '');
    setFormStatus(entry.status);
    setIsAddingEntry(true);
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || !formOperator) {
      alert('Please fill operating details and amount.');
      return;
    }

    const payload = {
      date: formDate,
      shift: formShift,
      collectionType: formType,
      amount: parseFloat(formAmount),
      operator: formOperator,
      remarks: formRemarks,
      status: formStatus
    };

    try {
      if (editingEntry && editingEntry._id) {
        // Update API
        const res = await fetch(`/api/collections-entries/${editingEntry._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.success && json.data) {
          setAtlasEntries(atlasEntries.map(item => item._id === editingEntry._id ? json.data : item));
          setIsAddingEntry(false);
          setEditingEntry(null);
          resetForm();
        }
      } else {
        // Create API
        const res = await fetch('/api/collections-entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.success && json.data) {
          setAtlasEntries([json.data, ...atlasEntries]);
          setIsAddingEntry(false);
          resetForm();
        }
      }
    } catch (err) {
      console.error('Failed to write collection entry to MongoDB Atlas:', err);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm('Delete chosen collection entry from MongoDB Atlas?')) return;
    try {
      const res = await fetch(`/api/collections-entries/${id}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        setAtlasEntries(atlasEntries.filter(item => item._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete Atlas connection entry:', err);
    }
  };

  const toggleEntryStatus = async (item: CollectionEntry) => {
    if (!item._id) return;
    const nextStatus = item.status === 'Verified' ? 'Draft' : 'Verified';
    try {
      const res = await fetch(`/api/collections-entries/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAtlasEntries(atlasEntries.map(e => e._id === item._id ? json.data : e));
      }
    } catch (err) {
      console.error('Failed to change verification status:', err);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Shift', 'CollectionType', 'Amount', 'Operator', 'Remarks', 'Status', 'CreatedAt'];
    const rows = filteredAtlas.map(e => [
      e.date,
      e.shift,
      e.collectionType,
      e.amount,
      e.operator,
      e.remarks || '',
      e.status,
      e.createdAt || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("id", "csv-download-trigger");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MongoDB_Atlas_Collections_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Main list filters
  const filteredSummaries = collections.filter(c => {
    const matchesSearch = c.shift.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = activeFilter === 'All' || c.status === activeFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredAtlas = atlasEntries.filter(e => {
    const matchesOperator = e.operator.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (e.remarks || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !atlasDateFilter || e.date === atlasDateFilter;
    const matchesShift = atlasShiftFilter === 'All' || e.shift === atlasShiftFilter;
    const matchesType = atlasTypeFilter === 'All' || e.collectionType === atlasTypeFilter;
    return matchesOperator && matchesDate && matchesShift && matchesType;
  });

  // Consolidated Daily Statistics for Atlas Tracker
  const totalCash = filteredAtlas.filter(e => e.collectionType === 'Cash').reduce((sum, e) => sum + e.amount, 0);
  const totalPaytm = filteredAtlas.filter(e => e.collectionType === 'Paytm').reduce((sum, e) => sum + e.amount, 0);
  const totalDtPlus = filteredAtlas.filter(e => e.collectionType === 'DT Plus').reduce((sum, e) => sum + e.amount, 0);
  const totalCredit = filteredAtlas.filter(e => e.collectionType === 'Credit').reduce((sum, e) => sum + e.amount, 0);
  const totalSummaryAmount = filteredAtlas.reduce((sum, e) => sum + e.amount, 0);

  // Reconciliation Analytics
  const verifiedTotal = filteredAtlas.filter(e => e.status === 'Verified').reduce((sum, e) => sum + e.amount, 0);
  const draftTotal = filteredAtlas.filter(e => e.status === 'Draft').reduce((sum, e) => sum + e.amount, 0);
  const reconciliationRate = totalSummaryAmount > 0 ? (verifiedTotal / totalSummaryAmount) * 100 : 0;

  return (
    <div className="space-y-5 animate-fade-in" id="collections-module-container">
      {/* Module Title Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Shift Collections & Loyalty Audits</h1>
        <p className="text-xs text-slate-500">Reconcile operator physical drop box cash against digital receipts (Paytm, DT Plus, cards).</p>
      </div>

      {/* Segmented Controller to shift between views cleanly (with 0 layout disruption) */}
      <div className="flex border-b border-slate-200 mt-2 gap-6" id="collections-tab-headers">
        <button
          id="tab-summaries"
          onClick={() => setViewTab('summaries')}
          className={`pb-2.5 text-xs font-semibold relative transition cursor-pointer ${
            viewTab === 'summaries' ? 'text-sky-950 font-bold border-b-2 border-sky-950' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Shift Settlement Summaries
        </button>
        <button
          id="tab-atlas-ledger"
          onClick={() => setViewTab('atlas')}
          className={`pb-2.5 text-xs font-semibold relative transition cursor-pointer flex items-center gap-1.5 ${
            viewTab === 'atlas' ? 'text-sky-950 font-bold border-b-2 border-sky-950' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          MongoDB Atlas Ledger (CRUD)
        </button>
      </div>

      {/* TAB A: ORIGINAL SUMMARIES VIEW (REMAINS EXACTLY UNCHANGED) */}
      {viewTab === 'summaries' && (
        <div className="space-y-5" id="summaries-view-tab-content">
          <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs flex flex-col md:flex-row items-center gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Shift..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto md:ml-auto">
              {['All', 'Verified', 'Draft'].map(status => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    activeFilter === status
                      ? 'bg-sky-950 text-white border-sky-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono block">Consolidated Cash Drafted</span>
                <span className="text-lg font-bold text-slate-900 font-mono">₹8,10,530</span>
              </div>
              <Wallet className="w-8 h-8 text-slate-300" />
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono block">Consolidated Shortage</span>
                <span className="text-lg font-bold text-red-600 font-mono">-₹90.00</span>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-200" />
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono block">Loyalty (DT Plus Settle)</span>
                <span className="text-lg font-bold text-sky-800 font-mono">₹2,20,000</span>
              </div>
              <Sparkles className="w-8 h-8 text-sky-200" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-3.5">Settlement ID / Date</th>
                    <th className="p-3.5">Shift Log</th>
                    <th className="p-3.5 text-right">Cash Received</th>
                    <th className="p-3.5 text-right">Shift Shortage</th>
                    <th className="p-3.5 text-right">Paytm UPI</th>
                    <th className="p-3.5 text-right">HP DT Plus loyalty</th>
                    <th className="p-3.5 text-right">Subtotal Collection</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredSummaries.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5 font-mono">
                        <span className="font-bold text-slate-900 block">{item.id}</span>
                        <span className="text-[10px] text-slate-400 block">{item.date}</span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800">{item.shift}</td>
                      <td className="p-3.5 text-right font-mono font-semibold text-sky-950">{formatINR(item.cashReceived)}</td>
                      <td className={`p-3.5 text-right font-mono font-medium ${item.shortageExcess < 0 ? 'text-red-650' : 'text-emerald-600'}`}>
                        {item.shortageExcess < 0 ? `-₹${Math.abs(item.shortageExcess)}` : `+₹${item.shortageExcess}`}
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-600">{formatINR(item.paytmReceived)}</td>
                      <td className="p-3.5 text-right font-mono text-amber-600 font-semibold">{formatINR(item.dtPlusReceived)}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900">{formatINR(item.totalCollection)}</td>
                      <td className="p-3.5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          item.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {item.status === 'Draft' ? (
                          <button
                            onClick={() => onVerify(item.id)}
                            className="bg-sky-900 hover:bg-sky-950 text-white text-[11px] font-bold py-1 px-2.5 rounded transition cursor-pointer"
                          >
                            Verify Shift Logs
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-medium font-mono flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: MONGODB ATLAS LEDGER - RICH DIRECT DB CONNECT WITH GRANTED ACCESS */}
      {viewTab === 'atlas' && (
        <div className="space-y-5 animate-fade-in" id="atlas-view-tab-content">
          
          {/* Controls Bar: Filters & Actions */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center gap-3" id="atlas-filters-bar">
            {/* Operator/Remarks input search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Operator or remarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800"
              />
            </div>

            {/* Date Filter */}
            <div className="relative">
              <input
                type="date"
                value={atlasDateFilter}
                onChange={(e) => setAtlasDateFilter(e.target.value)}
                className="py-2 px-3 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800"
                title="Filter by Entry Date"
              />
              {atlasDateFilter && (
                <button 
                  onClick={() => setAtlasDateFilter('')}
                  className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Shift Filter */}
            <select
              value={atlasShiftFilter}
              onChange={(e) => setAtlasShiftFilter(e.target.value)}
              className="py-2 px-3 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-850"
            >
              <option value="All">All Shifts</option>
              <option value="Shift A (06:00 - 14:00)">Shift A</option>
              <option value="Shift B (14:00 - 22:00)">Shift B</option>
              <option value="Shift C (22:00 - 06:00)">Shift C</option>
            </select>

            {/* Collection Type Filter */}
            <select
              value={atlasTypeFilter}
              onChange={(e) => setAtlasTypeFilter(e.target.value)}
              className="py-2 px-3 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-850"
            >
              <option value="All">All Types</option>
              <option value="Cash">Cash Collections</option>
              <option value="Paytm">Paytm UPI Collections</option>
              <option value="DT Plus">DT Plus Loyalty Card</option>
              <option value="Credit">Credit Settlements</option>
            </select>

            {/* Refresh, Export as CSV, Add Entry buttons */}
            <div className="flex gap-2">
              <button
                id="btn-export-csv"
                onClick={handleExportCSV}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 text-xs font-semibold rounded-lg border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                title="Export list to CSV file"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
              
              <button
                id="btn-add-atlas-entry"
                onClick={() => {
                  resetForm();
                  setEditingEntry(null);
                  setIsAddingEntry(true);
                }}
                className="px-4 py-2 bg-sky-900 hover:bg-sky-950 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Collection Entry
              </button>
            </div>
          </div>

          {/* Daily Collection Summary Widgets */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3" id="collection-summary-dashboard-grid">
            <div className="bg-sky-50/40 p-3 rounded-xl border border-sky-100/50 flex flex-col justify-between">
              <span className="text-[9px] text-slate-400 font-mono block uppercase">Cash Ledger sum</span>
              <span className="text-sm font-bold text-sky-900 font-mono mt-1">{formatINR(totalCash)}</span>
            </div>
            
            <div className="bg-amber-50/45 p-3 rounded-xl border border-amber-100/40 flex flex-col justify-between">
              <span className="text-[9px] text-slate-400 font-mono block uppercase">Paytm UPI sum</span>
              <span className="text-sm font-bold text-amber-700 font-mono mt-1">{formatINR(totalPaytm)}</span>
            </div>

            <div className="bg-indigo-50/40 p-3 rounded-xl border border-indigo-100/40 flex flex-col justify-between">
              <span className="text-[9px] text-slate-400 font-mono block uppercase">DT Plus Card sum</span>
              <span className="text-sm font-bold text-indigo-700 font-mono mt-1">{formatINR(totalDtPlus)}</span>
            </div>

            <div className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-100/40 flex flex-col justify-between">
              <span className="text-[9px] text-slate-400 font-mono block uppercase">Credit outstanding sum</span>
              <span className="text-sm font-bold text-emerald-800 font-mono mt-1">{formatINR(totalCredit)}</span>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl flex flex-col justify-between col-span-2 md:col-span-1">
              <span className="text-[9px] text-slate-300 font-mono block uppercase font-semibold">Total Atlas Pool</span>
              <span className="text-base font-bold text-white font-mono mt-1">{formatINR(totalSummaryAmount)}</span>
            </div>
          </div>

          {/* Collection Reconciliation Tracker Indicator */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs" id="collection-reconciliation-tracker">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="text-xs font-bold text-slate-800 tracking-tight">Active Collection Reconciliation</h3>
                  <p className="text-[10px] text-slate-400">Comparing operator submitted entries (Verified vs Draft pending audits)</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <span className="text-[9px] text-emerald-600 font-mono uppercase tracking-wider block font-bold">Verified & Audited</span>
                  <span className="text-xs font-bold font-mono text-emerald-700">{formatINR(verifiedTotal)}</span>
                </div>
                <div className="text-right border-l pl-4">
                  <span className="text-[9px] text-amber-500 font-mono uppercase tracking-wider block font-bold">Draft / In Review</span>
                  <span className="text-xs font-bold font-mono text-amber-600">{formatINR(draftTotal)}</span>
                </div>
                <div className="text-right border-l pl-4">
                  <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider block font-bold">Audit Completion</span>
                  <span className="text-xs font-bold font-mono text-slate-900">{reconciliationRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
            {/* Linear Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${Math.min(reconciliationRate, 100)}%` }}
              />
            </div>
          </div>

          {/* ADD / EDIT TRANSACTION ENTRY FORM DRAWER/CONTAINER */}
          {isAddingEntry && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-3xs animate-fade-in" id="atlas-entry-form-container">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-sky-800" />
                  {editingEntry ? 'Edit MongoDB Atlas Collection Entry' : 'Create New Collection Entry with MongoDB Atlas'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingEntry(false);
                    setEditingEntry(null);
                    resetForm();
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEntry} id="atlas-entry-creator-form">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                  
                  {/* Date Input */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 font-mono">Date</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-sky-900"
                    />
                  </div>

                  {/* Shift Selector */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 font-mono">Shift</label>
                    <select
                      value={formShift}
                      onChange={(e) => setFormShift(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-850"
                    >
                      <option value="Shift A (06:00 - 14:00)">Shift A (Morning)</option>
                      <option value="Shift B (14:00 - 22:00)">Shift B (Evening)</option>
                      <option value="Shift C (22:00 - 06:00)">Shift C (Night)</option>
                    </select>
                  </div>

                  {/* Collection Type Selector */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 font-mono">Collection Type</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-850"
                    >
                      <option value="Cash">Cash Collection Entry</option>
                      <option value="Paytm">Paytm UPI Entry</option>
                      <option value="DT Plus">DT Plus Loyalty Card</option>
                      <option value="Credit">Credit Sales Settlement</option>
                    </select>
                  </div>

                  {/* Amount Drop */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 font-mono">Collection Amount (INR)</label>
                    <input
                      type="number"
                      placeholder="e.g. 75000"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-mono focus:outline-sky-900"
                    />
                  </div>

                  {/* Operator field */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 font-mono">Operator / Cashier Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={formOperator}
                      onChange={(e) => setFormOperator(e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 uppercase tracking-tight focus:outline-sky-900"
                    />
                  </div>

                  {/* Status checklist */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 font-mono">Audit Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-850"
                    >
                      <option value="Draft">Draft (In Review)</option>
                      <option value="Verified">Verified & Reconciled</option>
                    </select>
                  </div>

                  {/* Remarks input description */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 font-mono">Remarks / Memo</label>
                    <input
                      type="text"
                      placeholder="e.g. Card machine batch receipt slip uploaded"
                      value={formRemarks}
                      onChange={(e) => setFormRemarks(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-sky-900"
                    />
                  </div>

                </div>

                <div className="flex justify-end gap-2.5 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingEntry(false);
                      setEditingEntry(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-100 text-xs font-semibold rounded-lg transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-sky-900 hover:bg-sky-950 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Save Connection Record
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Collection History Table */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-2xs overflow-hidden" id="collection-history-table-container">
            <div className="overflow-x-auto">
              {loadingAtlas ? (
                <div className="p-8 text-center" id="table-loading-container">
                  <RefreshCw className="w-6 h-6 text-sky-950 animate-spin mx-auto block mb-2" />
                  <span className="text-xs text-slate-400">Loading fine-grained collection documents from MongoDB Atlas...</span>
                </div>
              ) : filteredAtlas.length === 0 ? (
                <div className="p-10 text-center" id="table-empty-container">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto block mb-2" />
                  <span className="text-xs text-slate-500 font-bold block">No ledger documents found</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Try adjusting your date filters or add a new collection entry.</span>
                </div>
              ) : (
                <table className="w-full text-left border-collapse" id="collections-atlas-table">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-3.5">Log Date</th>
                      <th className="p-3.5">Shift Session</th>
                      <th className="p-3.5">Collection Type</th>
                      <th className="p-3.5 text-right">Settlement Amount</th>
                      <th className="p-3.5">Attendant Operator</th>
                      <th className="p-3.5">Remarks / Remarks Memo</th>
                      <th className="p-3.5 text-center">Audit Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredAtlas.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/70 transition">
                        <td className="p-3.5 font-mono">
                          <span className="font-bold text-slate-900 block">{item.date}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-slate-800">{item.shift}</span>
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.collectionType === 'Cash' ? 'bg-sky-50 text-sky-850' :
                            item.collectionType === 'Paytm' ? 'bg-amber-50 text-amber-800' :
                            item.collectionType === 'DT Plus' ? 'bg-indigo-50 text-indigo-850' : 'bg-emerald-50 text-emerald-800'
                          }`}>
                            {item.collectionType}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                          {formatINR(item.amount)}
                        </td>
                        <td className="p-3.5 font-medium text-slate-650">
                          {item.operator}
                        </td>
                        <td className="p-3.5 text-slate-500 italic max-w-xs truncate" title={item.remarks}>
                          {item.remarks || <span className="text-slate-300 font-mono">-</span>}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => toggleEntryStatus(item)}
                            title="Click to toggle approval status"
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all hover:opacity-85 ${
                              item.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {item.status}
                          </button>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleEditClick(item)}
                              className="text-[11px] text-slate-600 font-bold hover:text-sky-950 px-2 py-1 hover:bg-slate-50 rounded cursor-pointer transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => item._id && handleDeleteEntry(item._id)}
                              className="text-[11px] text-red-500 font-bold hover:text-red-750 px-2 py-1 hover:bg-red-50 rounded cursor-pointer transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ============================================================================
// 3. CASH MANAGEMENT SCREEN
// ============================================================================
interface CashManagementScreenProps {
  logs: CashEntry[];
  onAddLog: (log: CashEntry) => void;
}

export function CashManagementScreen({ logs, onAddLog }: CashManagementScreenProps) {
  const [activeTab, setActiveTab] = useState<'Petty Cash Box' | 'Main Pump Safe'>('Main Pump Safe');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [type, setType] = useState<'Cash Receipt' | 'Bank Deposit' | 'Expense Outflow' | 'Safe Transfer'>('Safe Transfer');
  const [amount, setAmount] = useState(15000);
  const [person, setPerson] = useState('Attendant Vijay Sawant');
  const [remarks, setRemarks] = useState('Night shift petrol cashier float remittance');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: CashEntry = {
      id: `CSH-${Math.floor(200 + Math.random() * 800)}`,
      dateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type,
      amount,
      receivedFromOrPaidTo: person,
      handledBy: 'Manager Sunil Sharma',
      receiptNumber: `RO-LN-${Math.floor(1000 + Math.random() * 9000)}`,
      remarks,
      account: activeTab
    };
    onAddLog(newLog);
    setIsFormOpen(false);
  };

  const filtered = logs.filter(l => l.account === activeTab);
  const balance = filtered.reduce((acc, curr) => {
    if (curr.type === 'Cash Receipt' || (curr.type === 'Safe Transfer' && activeTab === 'Main Pump Safe')) {
      return acc + curr.amount;
    } else if (curr.type === 'Bank Deposit' || curr.type === 'Expense Outflow' || (curr.type === 'Safe Transfer' && activeTab === 'Petty Cash Box')) {
      return acc - curr.amount;
    }
    return acc;
  }, activeTab === 'Main Pump Safe' ? 650000 : 3500); // realistic starting offsets

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Main Pump Cash Safe Ledger</h1>
          <p className="text-xs text-slate-500">Track raw cash deposits, physical bank CDM transit logs, and petty loose change drawer floats.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-sky-950 text-white hover:bg-sky-900 border border-sky-850 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>New Cash Movement</span>
        </button>
      </div>

      {/* Account view switcher tabs */}
      <div className="bg-white p-1 rounded-xl border border-slate-150 inline-flex">
        {(['Main Pump Safe', 'Petty Cash Box'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === tab ? 'bg-sky-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab === 'Main Pump Safe' ? '🏢 Main Pump Secure Safe' : '🪵 Attendant Petty Change Drawer'}
          </button>
        ))}
      </div>

      {/* Current Vault Balance Callout */}
      <div className="bg-sky-50 border border-sky-200/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-3xs">
        <div>
          <span className="text-[10px] text-sky-800 font-bold uppercase tracking-wider block font-mono">Calculated Liquid Vault Float ({activeTab})</span>
          <p className="text-2xl font-extrabold text-sky-950 font-mono tracking-tight mt-1">
            ₹{balance.toLocaleString()}
          </p>
        </div>
        <div className="text-xs text-sky-850">
          <span className="font-semibold block">⚠️ Dual-lock authorization triggered:</span>
          <span>Receipts exceeding ₹1 Lakh require physical counter-signature tags.</span>
        </div>
      </div>

      {/* Ledger Feed */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3.5">Log Date & Ref</th>
                <th className="p-3.5">Action Type</th>
                <th className="p-3.5">Destination / Sender</th>
                <th className="p-3.5">Verified Custodian</th>
                <th className="p-3.5">Particulars / Remarks</th>
                <th className="p-3.5 text-right">Movement Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filtered.map((item) => {
                const isAddition = item.type === 'Cash Receipt' || (item.type === 'Safe Transfer' && activeTab === 'Main Pump Safe');
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 font-mono">
                      <span className="font-bold text-slate-900 block">{item.receiptNumber}</span>
                      <span className="text-[10px] text-slate-400 block">{item.dateTime}</span>
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                        isAddition ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                      }`}>
                        <ArrowRightLeft className="w-3 h-3" />
                        {item.type}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-850">{item.receivedFromOrPaidTo}</td>
                    <td className="p-3.5 text-slate-500">{item.handledBy}</td>
                    <td className="p-3.5 text-slate-500 max-w-xs truncate" title={item.remarks}>{item.remarks}</td>
                    <td className={`p-3.5 text-right font-mono font-bold ${
                      isAddition ? 'text-emerald-700' : 'text-red-650'
                    }`}>
                      {isAddition ? '+' : '-'} ₹{item.amount.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popup Form for Cash Injections */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden">
            <div className="bg-sky-950 p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">New Cash Vault Ledger Entry</h3>
                <p className="text-[11px] text-sky-200">Submit immediate physical cash deposits and disbursements.</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-sky-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Target Terminal Vault</label>
                <div className="p-2 border border-slate-150 rounded bg-slate-50 font-bold text-xs">
                  {activeTab === 'Main Pump Safe' ? '🏢 Main Pump Security Safe' : '🪵 Floor Attendant Petty Drawer'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Movement Class</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full text-xs p-2 border border-slate-200 rounded bg-white text-slate-850 font-medium"
                  >
                    <option value="Safe Transfer">Safe Transfer / Shift Drop</option>
                    <option value="Cash Receipt">Cash Sale Receipt Injection</option>
                    <option value="Bank Deposit">Deposit to SBI CDM Point</option>
                    <option value="Expense Outflow">Draw Cash For Petty Outflow</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Sum Total Amount (INR)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value))}
                    className="w-full text-xs p-2 border border-slate-200 rounded font-mono font-bold text-sky-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">External Custodian / Source</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Attendant Ramesh / SBI Main ATM rep"
                  value={person}
                  onChange={(e) => setPerson(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Statement Remarks / Purpose</label>
                <textarea
                  required
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded font-sans"
                  placeholder="Indicate double-lock reasons or shift totalizer voucher reference number..."
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-950 text-white hover:bg-sky-900 text-xs rounded-lg font-semibold"
                >
                  Confirm Float Movement
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
// 4. EXPENSES SCREEN
// ============================================================================
interface ExpensesScreenProps {
  expenses: ExpenseEntry[];
  onAddExpense: (exp: ExpenseEntry) => void;
  onEditExpense: (exp: ExpenseEntry) => void;
  onDeleteExpense: (id: string) => void;
}

export function ExpensesScreen({ expenses, onAddExpense, onEditExpense, onDeleteExpense }: ExpensesScreenProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [category, setCategory] = useState<'Salary & Wages' | 'Power & Electricity' | 'Generator Fuel' | 'Maintenance & Repairs' | 'Statutory License Fees' | 'Brokerage & Commission' | 'Printing & Stationery' | 'Miscellaneous'>('Power & Electricity');
  const [amount, setAmount] = useState(12000);
  const [vendor, setVendor] = useState('JBVNL Ramgarh division substation');
  const [mode, setMode] = useState<'Cash' | 'Bank Online' | 'Cheque'>('Bank Online');
  const [remarks, setRemarks] = useState('Electricity bill backup surcharge fees');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [approvedBy, setApprovedBy] = useState('Mr. Anand Ashok');

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setCategory('Power & Electricity');
    setAmount(12000);
    setVendor('JBVNL Ramgarh division substation');
    setMode('Bank Online');
    setRemarks('Electricity bill backup surcharge fees');
    setDate(new Date().toISOString().split('T')[0]);
    setApprovedBy('Mr. Anand Ashok');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: ExpenseEntry) => {
    setIsEditing(true);
    setEditingId(item.id);
    setCategory(item.category as any);
    setAmount(item.amount);
    setVendor(item.paidTo);
    setMode(item.paymentMode as any);
    setRemarks(item.remarks);
    setDate(item.date || new Date().toISOString().split('T')[0]);
    setApprovedBy(item.approvedBy || 'Mr. Anand Ashok');
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && editingId) {
      const updatedExp: ExpenseEntry = {
        id: editingId,
        date,
        category,
        amount,
        paidTo: vendor,
        paymentMode: mode,
        approvedBy,
        remarks
      };
      onEditExpense(updatedExp);
    } else {
      const newExp: ExpenseEntry = {
        id: `EXP-${Math.floor(400 + Math.random() * 599)}`,
        date,
        category,
        amount,
        paidTo: vendor,
        paymentMode: mode,
        approvedBy,
        remarks
      };
      onAddExpense(newExp);
    }
    setIsFormOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm(`Are you sure you want to permanently delete Expense Voucher ${id}?`)) {
      onDeleteExpense(id);
    }
  };

  // Searching & Category Filters logic
  const filtered = expenses.filter(e => {
    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    const matchesSearch = searchTerm.trim() === '' ||
      e.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.paidTo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalExpSum = filtered.reduce((a, b) => a + b.amount, 0);

  // Group summary calculations for Monthly Expense Summary UI
  // Dynamically parses dates to group totals of current month vs all
  const categoriesList = ['Salary & Wages', 'Power & Electricity', 'Generator Fuel', 'Maintenance & Repairs', 'Statutory License Fees', 'Printing & Stationery', 'Miscellaneous'];
  const monthSums = expenses.reduce((acc: Record<string, number>, curr) => {
    if (!curr.date) return acc;
    const m = curr.date.substring(0, 7); // 'YYYY-MM'
    acc[m] = (acc[m] || 0) + curr.amount;
    return acc;
  }, {});

  const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7); // e.g., '2026-06'
  const currentMonthTotal = monthSums[currentMonth] || 0;

  // Breakdown bypayment mode
  const modeSums = filtered.reduce((acc: Record<string, number>, curr) => {
    acc[curr.paymentMode] = (acc[curr.paymentMode] || 0) + curr.amount;
    return acc;
  }, { 'Cash': 0, 'Bank Online': 0, 'Cheque': 0 });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Operating Expenses (OpEx) Ledger</h1>
          <p className="text-xs text-slate-500">Record and audit commercial running cost payouts (attendant wages, gensets fuel, nozzle servicing).</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-sky-950 text-white hover:bg-sky-900 border border-sky-850 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Record Expense Payout</span>
        </button>
      </div>

      {/* Monthly Expense Summary Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Consolidated Dynamic Total</span>
          <span className="text-2xl font-black text-slate-900 mt-2 font-mono">₹{totalExpSum.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Filtered opex payouts</span>
        </div>
        <div className="bg-gradient-to-br from-sky-950 to-slate-900 p-4 rounded-xl border border-sky-900 shadow-2xs text-white flex flex-col justify-between">
          <span className="text-[10px] font-bold text-sky-200 uppercase tracking-wider block">Estimated Month Focus</span>
          <span className="text-2xl font-black text-amber-400 mt-2 font-mono">₹{currentMonthTotal.toLocaleString()}</span>
          <span className="text-[10px] text-sky-300 mt-1 block">Summed for current month period</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Corporate Bank Wire (SBI/HDFC)</span>
          <span className="text-lg font-bold text-slate-800 mt-2 font-mono">₹{modeSums['Bank Online'].toLocaleString()}</span>
          <span className="text-[10px] text-emerald-600 mt-1 block">Bank-vouched clearings</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Treasury Safe Drawer (Cash)</span>
          <span className="text-lg font-bold text-slate-800 mt-2 font-mono">₹{modeSums['Cash'].toLocaleString()}</span>
          <span className="text-[10px] text-amber-600 mt-1 block">Cash safe counter withdrawals</span>
        </div>
      </div>

      {/* Advanced Quick Filtering & Search bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-1.5 w-full lg:max-w-md bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses by payee, voucher no, remarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-800 focus:outline-none w-full"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 items-center w-full lg:w-auto">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filter:
            </span>
            {['All', 'Salary & Wages', 'Power & Electricity', 'Generator Fuel', 'Maintenance & Repairs', 'Miscellaneous'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-sky-950 text-white border-sky-900 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table view */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3.5">Voucher / Date</th>
                <th className="p-3.5">Expense Category</th>
                <th className="p-3.5">Vendor Payout Sourced</th>
                <th className="p-3.5">Payment Method</th>
                <th className="p-3.5">Authorized Officer</th>
                <th className="p-3.5">Particulars</th>
                <th className="p-3.5 text-right">Debit Sum</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                    No matching expense vouchers found. Try adjusting filters or searches.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 font-mono">
                      <span className="font-bold text-slate-900 block">{item.id}</span>
                      <span className="text-[10px] text-slate-400 block">{item.date}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-sm bg-slate-100 text-slate-800 font-semibold text-[10.5px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-800">{item.paidTo}</td>
                    <td className="p-3.5 text-slate-500">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        item.paymentMode === 'Cash' ? 'bg-amber-50 text-amber-700' :
                        item.paymentMode === 'Bank Online' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {item.paymentMode}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-sky-850 font-semibold">{item.approvedBy}</td>
                    <td className="p-3.5 text-slate-400 max-w-xs">{item.remarks}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-red-600">₹{item.amount.toLocaleString()}</td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Voucher Details"
                          className="p-1.5 text-slate-400 hover:text-sky-950 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item.id)}
                          title="Delete Voucher"
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Pop Up drawer / form modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden">
            <div className="bg-sky-950 p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">{isEditing ? 'Edit Operating Expense Voucher' : 'Record Commercial Operating Expense'}</h3>
                <p className="text-[11px] text-sky-200">Debit from treasury with executive counter-signature parameters.</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-sky-200 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Expense Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs p-2 border border-slate-200 rounded bg-white text-slate-850 focus:border-sky-950 outline-none"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Sum Total amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2 border border-slate-200 rounded font-mono font-bold text-sky-950 focus:border-sky-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Expense Voucher Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded focus:border-sky-950"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Authorized Audit Signatory</label>
                  <input
                    type="text"
                    required
                    value={approvedBy}
                    onChange={(e) => setApprovedBy(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded focus:border-sky-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Payment Sourced Method</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as any)}
                    className="w-full text-xs p-2 border border-slate-200 rounded bg-white focus:border-sky-950"
                  >
                    <option value="Bank Online">Corporate Bank Wire (SBI/HDFC)</option>
                    <option value="Cash">Cash safe drawer payout</option>
                    <option value="Cheque">Physical Cheque Book Leaf</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Payee Vendor / Attendant Name</label>
                  <input
                    type="text"
                    required
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded focus:border-sky-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Voucher Description & Notes</label>
                <textarea
                  required
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded focus:border-sky-950"
                  placeholder="Record flow meter certifications details, electricity meter readings, bill periods..."
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-[11px] text-amber-800">
                <strong>📝 Audit Notice:</strong> Ashok Fuels requires digital uploads of invoice receipts or engineer certifying signatures on shift files for compliance locks.
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-950 text-white text-xs rounded-lg font-semibold cursor-pointer"
                >
                  {isEditing ? 'Save Changes' : 'Approve & Commit Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

