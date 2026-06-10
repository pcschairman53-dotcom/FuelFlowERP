/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Wallet, Plus, Trash2, ArrowRightLeft, TrendingUp, TrendingDown,
  Calendar, User, CheckCircle, AlertCircle, FileText, Info,
  ArrowUpRight, ArrowDownLeft, RefreshCw, Layers, Sliders, Filter
} from 'lucide-react';

interface CashMovement {
  id: string;
  _id?: string;
  date: string;
  type: 'CASH_IN' | 'CASH_OUT' | 'SAFE_TRANSFER' | 'BANK_DEPOSIT' | 'BANK_WITHDRAWAL';
  amount: number;
  source: string;
  destination: string;
  remarks: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

const TYPE_LABELS: Record<CashMovement['type'], string> = {
  CASH_IN: 'Cash In (Receipt)',
  CASH_OUT: 'Cash Out (Payment)',
  SAFE_TRANSFER: 'Safe Vault Transfer',
  BANK_DEPOSIT: 'Bank Deposit (CDM)',
  BANK_WITHDRAWAL: 'Bank Withdrawal'
};

const TYPE_COLORS: Record<CashMovement['type'], { bg: string; text: string; icon: string }> = {
  CASH_IN: { bg: 'bg-emerald-50 border-emerald-150', text: 'text-emerald-800', icon: 'text-emerald-600' },
  CASH_OUT: { bg: 'bg-red-50 border-red-150', text: 'text-red-800', icon: 'text-red-600' },
  SAFE_TRANSFER: { bg: 'bg-indigo-50 border-indigo-150', text: 'text-indigo-800', icon: 'text-indigo-600' },
  BANK_DEPOSIT: { bg: 'bg-amber-50 border-amber-150', text: 'text-amber-800', icon: 'text-amber-600' },
  BANK_WITHDRAWAL: { bg: 'bg-sky-50 border-sky-150', text: 'text-sky-800', icon: 'text-sky-600' }
};

export function CashManagementScreen() {
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'offline'>('syncing');

  // Local storage Opening Cash Float
  const [openingCash, setOpeningCash] = useState<number>(() => {
    const saved = localStorage.getItem('ashok_fuels_opening_cash');
    return saved ? parseFloat(saved) : 150000;
  });
  const [tempOpening, setTempOpening] = useState(openingCash.toString());
  const [isEditingOpening, setIsEditingOpening] = useState(false);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<CashMovement['type']>('CASH_IN');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formAmount, setFormAmount] = useState('');
  const [formSource, setFormSource] = useState('');
  const [formDestination, setFormDestination] = useState('');
  const [formRemarks, setFormRemarks] = useState('');
  const [formCreatedBy, setFormCreatedBy] = useState('Staff Manager');

  // Filter states
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterDate, setFilterDate] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Local state helper for fallbacks
  const loadFallbackData = () => {
    const initialList: CashMovement[] = [
      {
        id: 'CM-101',
        date: '2026-06-08',
        type: 'CASH_IN',
        amount: 150000,
        source: 'Safe Vault',
        destination: 'Counter Till',
        remarks: 'Opening cashier cash setup',
        createdBy: 'Anand Ashok',
        createdAt: '2026-06-08T09:00:00.000Z'
      },
      {
        id: 'CM-102',
        date: '2026-06-08',
        type: 'BANK_DEPOSIT',
        amount: 100000,
        source: 'Counter Till',
        destination: 'SBI Current Account',
        remarks: 'Daily evening deposit to bank',
        createdBy: 'Anand Ashok',
        createdAt: '2026-06-08T18:00:00.000Z'
      },
      {
        id: 'CM-103',
        date: '2026-06-09',
        type: 'CASH_IN',
        amount: 75000,
        source: 'Safe Vault',
        destination: 'Counter Till',
        remarks: 'Daily cash replenishment',
        createdBy: 'Anand Ashok',
        createdAt: '2026-06-09T09:00:00.000Z'
      },
      {
        id: 'CM-104',
        date: '2026-06-09',
        type: 'CASH_OUT',
        amount: 12000,
        source: 'Counter Till',
        destination: 'Office Stationery Shop',
        remarks: 'Cash payout for printer paper and binders',
        createdBy: 'Staff Cashier',
        createdAt: '2026-06-09T14:30:00.000Z'
      }
    ];
    setMovements(initialList);
  };

  // Fetch all movements on mount
  const fetchMovements = async () => {
    setLoading(true);
    setSyncStatus('syncing');
    try {
      const response = await fetch('/api/cash-movements');
      const json = await response.json();
      if (json.success && Array.isArray(json.data)) {
        setMovements(json.data);
        setSyncStatus('synced');
        setErrorMsg(null);
      } else {
        throw new Error('Database response failed');
      }
    } catch (err) {
      console.warn('⚠️ Server connection offline. Falling back to local/cached data.', err);
      setSyncStatus('offline');
      if (movements.length === 0) {
        loadFallbackData();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const handleSaveOpeningCash = () => {
    const val = parseFloat(tempOpening);
    if (!isNaN(val) && val >= 0) {
      setOpeningCash(val);
      localStorage.setItem('ashok_fuels_opening_cash', val.toString());
      setIsEditingOpening(false);
    } else {
      alert('Please enter a valid positive number for Opening Float');
    }
  };

  // Open transaction modal of specific type with smart defaults
  const openTypedModal = (type: CashMovement['type']) => {
    setModalMode(type);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormAmount('');
    setFormRemarks('');

    if (type === 'CASH_IN') {
      setFormSource('Counter Till Remittance');
      setFormDestination('Safe Vault');
    } else if (type === 'CASH_OUT') {
      setFormSource('Safe Vault');
      setFormDestination('Petty Cash / Wages Settle');
    } else if (type === 'SAFE_TRANSFER') {
      setFormSource('Counter Till');
      setFormDestination('Safe Vault');
    } else if (type === 'BANK_DEPOSIT') {
      setFormSource('Safe Vault');
      setFormDestination('SBI Bank CDM');
    } else if (type === 'BANK_WITHDRAWAL') {
      setFormSource('SBI Current Account');
      setFormDestination('Safe Vault');
    }

    setIsModalOpen(true);
  };

  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(formAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid numeric amount greater than ₹0');
      return;
    }

    const payload = {
      date: formDate,
      type: modalMode,
      amount: amt,
      source: formSource.trim(),
      destination: formDestination.trim(),
      remarks: formRemarks.trim() || 'Logged cash flow movement',
      createdBy: formCreatedBy.trim() || 'Staff Manager'
    };

    setSyncStatus('syncing');
    try {
      const response = await fetch('/api/cash-movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await response.json();
      if (json.success && json.data) {
        setMovements(prev => [json.data, ...prev]);
        setSyncStatus('synced');
        setIsModalOpen(false);
      } else {
        throw new Error(json.message || 'Server error saving transaction');
      }
    } catch (err) {
      console.error('Offline / Failed to write Cash Movement to API:', err);
      // Fallback offline insert
      const fallbackItem: CashMovement = {
        id: `CM-${Math.floor(200 + Math.random() * 799)}`,
        date: formDate,
        type: modalMode,
        amount: amt,
        source: formSource.trim(),
        destination: formDestination.trim(),
        remarks: formRemarks.trim() || 'Logged offline flow record',
        createdBy: formCreatedBy.trim() || 'Staff Manager',
        createdAt: new Date().toISOString()
      };
      setMovements(prev => [fallbackItem, ...prev]);
      setSyncStatus('offline');
      setIsModalOpen(false);
    }
  };

  const handleDeleteMovement = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this cash movement log? This action is irreversible.')) {
      return;
    }

    setSyncStatus('syncing');
    try {
      const response = await fetch(`/api/cash-movements/${id}`, {
        method: 'DELETE'
      });
      const json = await response.json();
      if (json.success) {
        setMovements(prev => prev.filter(m => m.id !== id));
        setSyncStatus('synced');
      } else {
        throw new Error(json.message || 'Failed to delete on server');
      }
    } catch (err) {
      console.warn('Offline deletion locally applied', err);
      setMovements(prev => prev.filter(m => m.id !== id));
      setSyncStatus('offline');
    }
  };

  // Computations
  // Opening Cash is a static/user set baseline at beginning of shift tracking.
  // We calculate net flows.
  const totals = movements.reduce(
    (acc, m) => {
      if (m.type === 'CASH_IN') {
        acc.cashIn += m.amount;
      } else if (m.type === 'CASH_OUT') {
        acc.cashOut += m.amount;
      } else if (m.type === 'SAFE_TRANSFER') {
        acc.safeTransfers += m.amount;
      } else if (m.type === 'BANK_DEPOSIT') {
        acc.bankDeposits += m.amount;
      } else if (m.type === 'BANK_WITHDRAWAL') {
        acc.bankWithdrawals += m.amount;
      }
      return acc;
    },
    { cashIn: 0, cashOut: 0, safeTransfers: 0, bankDeposits: 0, bankWithdrawals: 0 }
  );

  // Closing Cash / Current total safe float in-hand calculation:
  // Baseline setup: Opening cash limit + Counter/Office Settle Cash In - Cash Out - Bank CDM deposits + Bank Withdrawals
  // NOTE: safe transfers is internal flow, so it preserves total cash level.
  const currentCashBalance = openingCash + totals.cashIn + totals.bankWithdrawals - totals.cashOut - totals.bankDeposits;

  // Filtered listing
  const filteredMovements = movements.filter(m => {
    const matchesSearch =
      m.remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.createdBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'ALL' || m.type === filterType;
    const matchesDate = filterDate === 'ALL' || m.date === filterDate;

    return matchesSearch && matchesType && matchesDate;
  });

  const uniqueDates = Array.from(new Set(movements.map(m => m.date))).sort().reverse();

  return (
    <div className="space-y-6 animate-fade-in font-sans" id="cash-management-view">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-500" />
            <span>Treasury &amp; Cash Management Floor Module</span>
          </h1>
          <p className="text-xs text-slate-500">Record cash drawer handovers, safe transfers, bank CDM slips, and daily closing vault balances.</p>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-2">
          {syncStatus === 'syncing' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-800 border border-yellow-150 rounded-lg text-xs font-semibold">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-yellow-600" />
              <span>Syncing with Cloud...</span>
            </span>
          )}
          {syncStatus === 'synced' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-lg text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>MongoDB Atlas Connected</span>
            </span>
          )}
          {syncStatus === 'offline' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-650 border border-slate-200 rounded-lg text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Offline Database Fallback</span>
            </span>
          )}
        </div>
      </div>

      {/* CORE STATS BOARD (Closing, Opening, Cash In, Cash Out, Safe, bank) */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Total Cash Balance Card */}
        <div className="bg-sky-950 text-white rounded-2xl p-4 border border-sky-900 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-sky-200 uppercase tracking-widest font-mono font-bold">Total Cash Settle (Closing)</span>
            <span className="p-1.5 bg-sky-900 rounded-lg text-amber-400">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black font-mono tracking-tight text-white leading-none">
              ₹{currentCashBalance.toLocaleString()}
            </h2>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-sky-200">
              <Info className="w-3 h-3 text-sky-300" />
              <span>Closing Treasury Cash Settle</span>
            </div>
          </div>
        </div>

        {/* Opening Cash Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-150 shadow-3xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Day Opening Float</span>
            <button
              onClick={() => {
                setTempOpening(openingCash.toString());
                setIsEditingOpening(true);
              }}
              className="text-[10px] text-sky-700 hover:text-sky-900 font-bold hover:underline cursor-pointer"
            >
              Configure
            </button>
          </div>
          <div className="mt-3">
            {isEditingOpening ? (
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  type="number"
                  value={tempOpening}
                  onChange={(e) => setTempOpening(e.target.value)}
                  className="w-24 p-1 text-xs border border-slate-300 rounded focus:outline-sky-850 font-mono font-bold"
                />
                <button
                  onClick={handleSaveOpeningCash}
                  className="px-2 py-1 bg-sky-950 text-white text-[10px] uppercase font-bold rounded hover:bg-sky-900 cursor-pointer"
                >
                  Set
                </button>
                <button
                  onClick={() => setIsEditingOpening(false)}
                  className="text-slate-400 text-xs hover:text-slate-600 px-1"
                >
                  ✕
                </button>
              </div>
            ) : (
              <h2 className="text-2xl font-black font-mono tracking-tight text-slate-800 leading-none">
                ₹{openingCash.toLocaleString()}
              </h2>
            )}
            <p className="text-[10px] text-slate-400 mt-2 block">Shift physical startup float</p>
          </div>
        </div>

        {/* Cash In Flow Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-150 shadow-3xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Total Cash Inflows</span>
            <span className="p-1 bg-emerald-50 text-emerald-700 rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-emerald-700 font-mono tracking-tight leading-none">
              ₹{totals.cashIn.toLocaleString()}
            </h2>
            <p className="text-[10px] text-slate-400 mt-2 block">Counter desk sales settle float</p>
          </div>
        </div>

        {/* Cash Out Flow Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-150 shadow-3xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Total Cash Outflows</span>
            <span className="p-1 bg-red-50 text-red-700 rounded-lg">
              <ArrowDownLeft className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-red-600 font-mono tracking-tight leading-none">
              ₹{totals.cashOut.toLocaleString()}
            </h2>
            <p className="text-[10px] text-slate-400 mt-2 block">Wages &amp; petty expense withdrawals</p>
          </div>
        </div>

        {/* Bank deposits summary card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-150 shadow-3xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Deposits to Bank CDM</span>
            <span className="p-1 bg-amber-50 text-amber-700 rounded-lg">
              <ArrowRightLeft className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-amber-700 font-mono tracking-tight leading-none">
              ₹{totals.bankDeposits.toLocaleString()}
            </h2>
            <p className="text-[10px] text-slate-400 mt-2 block">Cleared vault cash to State Bank</p>
          </div>
        </div>
      </div>

      {/* QUICK INJECTORS CONTROL PANEL BAR */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-3xs">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-mono mb-3">Instant Cash-Flow Action triggers</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => openTypedModal('CASH_IN')}
            className="flex items-center justify-center gap-2 p-3 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-150 rounded-xl text-xs font-bold cursor-pointer transition shadow-2xs"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Record Cash In</span>
          </button>
          
          <button
            onClick={() => openTypedModal('CASH_OUT')}
            className="flex items-center justify-center gap-2 p-3 bg-red-50 text-red-800 hover:bg-red-100 border border-red-150 rounded-xl text-xs font-bold cursor-pointer transition shadow-2xs"
          >
            <TrendingDown className="w-4 h-4" />
            <span>Record Cash Out</span>
          </button>

          <button
            onClick={() => openTypedModal('SAFE_TRANSFER')}
            className="flex items-center justify-center gap-2 p-3 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-150 rounded-xl text-xs font-bold cursor-pointer transition shadow-2xs"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Safe Vault Transfer</span>
          </button>

          <button
            onClick={() => openTypedModal('BANK_DEPOSIT')}
            className="flex items-center justify-center gap-2 p-3 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-150 rounded-xl text-xs font-bold cursor-pointer transition shadow-2xs"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Bank CDM Deposit</span>
          </button>

          <button
            onClick={() => openTypedModal('BANK_WITHDRAWAL')}
            className="flex items-center justify-center gap-2 p-3 bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-150 rounded-xl text-xs font-bold cursor-pointer transition col-span-2 sm:col-span-1 shadow-2xs"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Withdraw from SBI</span>
          </button>
        </div>
      </div>

      {/* TABULAR LOG DATA VIEWER WITH FILTERS */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden space-y-4 p-4.5">
        
        {/* Filtering & Search Row */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="relative flex-1">
            <Sliders className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by custodian, source/destination, remarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 placeholder-slate-400 focus:outline-sky-950"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Filter by Type */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] font-mono mr-1">Movement:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="p-1.5 border border-slate-200 rounded bg-white text-[11px] font-semibold focus:outline-none"
              >
                <option value="ALL">All Movements</option>
                <option value="CASH_IN">Cash In (Receipt)</option>
                <option value="CASH_OUT">Cash Out (Payout)</option>
                <option value="SAFE_TRANSFER">Vault Transfer</option>
                <option value="BANK_DEPOSIT">Bank CDM Deposit</option>
                <option value="BANK_WITHDRAWAL">Bank Withdrawal</option>
              </select>
            </div>

            {/* Filter by Date */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] font-mono mr-1">Date:</span>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="p-1.5 border border-slate-200 rounded bg-white text-[11px] font-semibold focus:outline-none"
              >
                <option value="ALL">All Dates ({uniqueDates.length})</option>
                {uniqueDates.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* LEDGER GRID TABLE */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono">
                <th className="p-3.5">Log Date &amp; Voucher</th>
                <th className="p-3.5">Classification Type</th>
                <th className="p-3.5 text-right">Sum amount</th>
                <th className="p-3.5">Cash Source</th>
                <th className="p-3.5">Intended Destination</th>
                <th className="p-3.5">Logged By</th>
                <th className="p-3.5">Particulars Remarks</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-sky-950 mx-auto block mb-2" />
                    <span>Hydrating transaction logs from database...</span>
                  </td>
                </tr>
              ) : filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400 font-semibold font-sans">
                    No cash flow movements found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((item) => {
                  const style = TYPE_COLORS[item.type] || { bg: 'bg-slate-50', text: 'text-slate-800', icon: 'text-slate-500' };
                  const isOutflow = item.type === 'CASH_OUT' || item.type === 'BANK_DEPOSIT';
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/75 transition text-[12.5px]">
                      <td className="p-3.5">
                        <span className="font-bold font-mono text-slate-900 block leading-tight">{item.id}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 leading-none">{item.date}</span>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded border text-[10.5px] font-bold ${style.bg} ${style.text}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {TYPE_LABELS[item.type]}
                        </span>
                      </td>
                      <td className={`p-3.5 text-right font-mono font-black ${isOutflow ? 'text-red-650' : 'text-emerald-700'}`}>
                        {isOutflow ? '-' : '+'} ₹{item.amount.toLocaleString()}
                      </td>
                      <td className="p-3.5 font-medium text-slate-700">{item.source}</td>
                      <td className="p-3.5 font-medium text-slate-700">{item.destination}</td>
                      <td className="p-3.5 font-mono text-sky-850 font-semibold">{item.createdBy}</td>
                      <td className="p-3.5 text-slate-400 max-w-xs truncate" title={item.remarks}>
                        {item.remarks || <span className="text-slate-350 italic">No notes</span>}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleDeleteMovement(item.id)}
                          title="Delete cash flow entry"
                          className="p-1.5 text-slate-350 hover:text-red-600 rounded hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD TRANSACTION FORM LIGHTBOX MODAL */}
      {isModalOpen && (
        <div id="modal-overlay-container" className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-xs text-slate-800">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-150 max-w-lg w-full overflow-hidden animate-slide-in">
            {/* Modal Header */}
            <div className="bg-sky-950 p-4.5 text-white flex items-center justify-between border-b border-sky-900 font-sans">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-amber-300" />
                  <span>Record {TYPE_LABELS[modalMode]}</span>
                </h3>
                <p className="text-[11px] text-sky-200">Register and audit raw flow patterns directly inside the ERP master log.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-sky-200 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddMovement} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono mb-1">Voucher Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-xs font-semibold focus:outline-sky-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono mb-1">Voucher Sum (₹ Amount)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 15000"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-mono font-bold text-sky-950 block text-xs focus:outline-sky-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono mb-1">Sourced From (Origin)</label>
                  <input
                    type="text"
                    required
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-semibold text-xs focus:outline-sky-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono mb-1">Intended Destination</label>
                  <input
                    type="text"
                    required
                    value={formDestination}
                    onChange={(e) => setFormDestination(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-semibold text-xs focus:outline-sky-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono mb-1">Acting Officer (Created By)</label>
                  <input
                    type="text"
                    required
                    value={formCreatedBy}
                    onChange={(e) => setFormCreatedBy(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-semibold text-xs focus:outline-sky-900"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-150 text-[10.5px] text-slate-500 font-sans leading-snug">
                    <span>Baseline startup: <strong>₹{openingCash.toLocaleString()}</strong></span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono mb-1">Voucher Description Remarks</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Record reasons for withdrawal, shift attendant name, or invoice receipt links..."
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 block font-sans text-xs focus:outline-sky-900"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-150 text-[10.5px] text-amber-800 leading-normal flex gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <p>
                  <strong>⚠️ Statutory Audit Mandate:</strong> Physical vouchers must be counter-signed by floor coordinators. Handover values are dual-logged against shift collections.
                </p>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-950 hover:bg-sky-900 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  Approve Float Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
