/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell, PieChart, Pie
} from 'recharts';
import {
  TrendingUp, Fuel, DollarSign, Wallet, CreditCard, Droplet,
  ArrowRight, Activity, Calendar, MapPin, CheckCircle, ShieldAlert,
  ArrowUpRight, ArrowDownRight, RefreshCw, Layers
} from 'lucide-react';
import {
  DailyFuelSale, CollectionBreakdown, TankStock, UserAccount
} from '../../types';
import { ACTIVITY_LOGS, COMPANY_DETAILS } from '../../data';

interface DashboardViewProps {
  fuelSales: DailyFuelSale[];
  collections: CollectionBreakdown[];
  tanks: TankStock[];
  hpclBalance: number;
  bankBalance: number;
  onNavigate: (screenId: string) => void;
  user: UserAccount;
}

export default function DashboardView({
  fuelSales,
  collections,
  tanks,
  hpclBalance,
  bankBalance,
  onNavigate,
  user
}: DashboardViewProps) {

  const [summaryData, setSummaryData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    console.log('[DashboardView] Initializing dashboard summary telemetry fetch...');
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch('/api/dashboard/summary')
      .then(res => {
        console.log('[DashboardView] API Response Status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (isMounted) {
          console.log('[DashboardView] API telemetry received successfully:', data);
          setSummaryData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error('[DashboardView] Telemetry fetch encountered issue:', err);
          setError('Failed to fetch dashboard summary.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-slate-500 font-mono flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Loading Live Monitor...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <ShieldAlert className="w-10 h-10 text-red-500 mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Connection Error</h3>
        <p className="text-sm text-slate-500">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm transition hover:bg-slate-700">
          Try Again
        </button>
      </div>
    );
  }

  // Calculations for KPI Cards
  const todayDate = '2026-06-05'; // Realistic static operational day
  const todaySales = fuelSales.filter(s => s.date === todayDate);
  
  const petrolSalesLtrs = summaryData ? summaryData.petrolSales : todaySales
    .filter(s => s.fuelType === 'Petrol' || s.fuelType === 'Speed Petrol')
    .reduce((a, b) => a + b.salesQty, 0);

  const dieselSalesLtrs = summaryData ? summaryData.dieselSales : todaySales
    .filter(s => s.fuelType === 'Diesel')
    .reduce((a, b) => a + b.salesQty, 0);

  const todayColl = collections.find(c => c.date === todayDate);
  const totalSalesAmtToday = todaySales.reduce((a, b) => a + b.totalAmt, 0);

  // Default fallbacks in case collection object is pending
  const cashCollection = summaryData ? summaryData.cashCollection : (todayColl ? todayColl.cashReceived : 725330);
  const paytmCollection = summaryData ? summaryData.paytmCollection : (todayColl ? todayColl.paytmReceived : 265600);
  const dtPlusCollection = summaryData ? summaryData.dtPlusCollection : (todayColl ? todayColl.dtPlusReceived : 205000);
  const totalCollection = todayColl ? todayColl.totalCollection : 2016420;

  // Use backend mock data if available
  const displayHpclBalance = summaryData ? summaryData.hpclBalance : hpclBalance;
  const displayBankBalance = summaryData ? summaryData.bankBalance : bankBalance;

  // Chart 1: Nozzle Fuel Sales Pattern (Liters)
  const salesHistoryChartData = [
    { name: '06/01', Petrol: 1800, Diesel: 4200, Speed: 320 },
    { name: '06/02', Petrol: 2100, Diesel: 4800, Speed: 400 },
    { name: '06/03', Petrol: 1950, Diesel: 5120, Speed: 380 },
    { name: '06/04', Petrol: 2400, Diesel: 6050, Speed: 490 },
    { name: '06/05', Petrol: petrolSalesLtrs - 483.5, Diesel: dieselSalesLtrs, Speed: 483.5 }, // Dynamically plug state
    { name: '06/06', Petrol: 555.4, Diesel: 1180.4, Speed: 150 }, // morning shift partial
  ];

  // Chart 2: Collection Payment Modes breakdown
  const paymentBreakdownData = [
    { name: 'Cash', value: cashCollection, color: '#0369a1' },
    { name: 'Paytm/UPI', value: paytmCollection, color: '#0284c7' },
    { name: 'DT Plus Card', value: dtPlusCollection, color: '#f59e0b' },
    { name: 'Online Banks', value: todayColl ? (todayColl.phonepeReceived + todayColl.gpayReceived) : 250000, color: '#10b981' },
    { name: 'Outstanding Credit', value: todayColl ? todayColl.creditOutstanding : 370000, color: '#ef4444' }
  ];

  // Formatter for Currency
  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Alert Ribbon for Critical parameters */}
      {(tanks || []).some(t => t && t.status === 'Critical') && (
        <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded-r-xl flex items-start gap-3 shadow-xs animate-fade-in">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-xs text-red-800 uppercase tracking-wider block">Critical Fuel Shortage Alert</span>
            <p className="text-xs text-red-700 mt-0.5">
              Speed Premium MS in <strong>Tank 4</strong> is at {(tanks || []).find(t => t && t.fuelType === 'Speed Petrol')?.currentLevelLiters ?? 0} Liters (Threshold Limit: 3,000L). Immediate HPCL Loading Indent required.
            </p>
          </div>
          <button
            onClick={() => onNavigate('HPCL Load Management')}
            className="text-xs font-semibold bg-red-100 hover:bg-red-200 text-red-800 py-1.5 px-3 rounded-lg transition"
          >
            Dispatch Tanker Now
          </button>
        </div>
      )}

      {/* Top Welcome Title Grid */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-slate-400 font-mono uppercase block">Ashok Fuels • Ramgarh Terminal</span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Owner Dashboard <span className="text-xs font-normal bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">Live Monitor</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, <strong className="text-slate-800">{user.name}</strong>. Daily nozzle totalizers and tank dippings have been verified.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-medium shadow-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>June 05, 2026 (Active Trade Day)</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-xl transition cursor-pointer shadow-xs"
            title="Refresh ERP telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 9 KPI Scorecard Grid */}
      <div id="dashboard-kpis" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        
        {/* KPI 1: Petrol Sales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-xs font-medium font-sans">Today's Petrol Sales</span>
              <span className="p-1.5 bg-sky-50 text-sky-700 rounded-lg group-hover:bg-sky-100 transition">
                <Fuel className="w-4 h-4" />
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-mono tracking-tight">{petrolSalesLtrs.toFixed(1)} L</h3>
            <span className="text-[11px] text-slate-400 tracking-tight font-mono block mt-1">Rate: Avg ₹104.20/L</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-600 font-medium flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14.2%
            </span>
            <span className="text-slate-400">vs yesterday</span>
          </div>
        </div>

        {/* KPI 2: Diesel Sales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-xs font-medium font-sans">Today's Diesel Sales</span>
              <span className="p-1.5 bg-amber-50 text-amber-700 rounded-lg group-hover:bg-amber-100 transition">
                <Droplet className="w-4 h-4" />
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-mono tracking-tight">{dieselSalesLtrs.toFixed(1)} L</h3>
            <span className="text-[11px] text-slate-400 tracking-tight font-mono block mt-1">Rate: Avg ₹92.50/L</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-600 font-medium flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +8.5%
            </span>
            <span className="text-slate-400">vs yesterday</span>
          </div>
        </div>

        {/* KPI 3: Today's Collection */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-xs font-medium font-sans">Today's Net Rev</span>
              <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg group-hover:bg-emerald-100 transition">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-mono tracking-tight">{formatINR(totalSalesAmtToday)}</h3>
            <span className="text-[11px] text-emerald-600 flex items-center gap-0.5 mt-1 font-mono">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 inline" /> Fully Sourced
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Gross Margin</span>
            <span className="font-semibold text-slate-700 font-mono">₹1,14,000</span>
          </div>
        </div>

        {/* KPI 4: Cash Collection */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-xs font-medium font-sans">Cash Sourced (Safe)</span>
              <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg group-hover:bg-indigo-100 transition">
                <Wallet className="w-4 h-4" />
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-mono tracking-tight">{formatINR(cashCollection)}</h3>
            <span className="text-[11px] text-slate-400 block mt-1">Reconciled Shift drops</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Short/Excess</span>
            <span className="font-semibold text-red-500 font-mono">-₹90.00</span>
          </div>
        </div>

        {/* KPI 5: Digital (Paytm/DTPlus) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-xs font-medium font-sans">UPI & DT Plus Card</span>
              <span className="p-1.5 bg-purple-50 text-purple-700 rounded-lg group-hover:bg-purple-100 transition">
                <CreditCard className="w-4 h-4" />
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-mono tracking-tight">{formatINR(paytmCollection + dtPlusCollection)}</h3>
            <span className="text-[11px] text-slate-400 tracking-tight block mt-1">Paytm UPI: {formatINR(paytmCollection)}</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-[#002f34] font-medium flex items-center gap-1">
              HP Loyalty
            </span>
            <span className="font-mono text-slate-600">{formatINR(dtPlusCollection)}</span>
          </div>
        </div>
      </div>

      {/* Secondary Balance KPI Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tank wet stock percentage status bars */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Physical Tank Wet Stock</span>
            <button onClick={() => onNavigate('Tank Stock')} className="text-[11px] text-sky-800 font-semibold hover:underline flex items-center gap-0.5">
              Dip Logs <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {(tanks || [])
              .filter(t => t && t.tankName && t.capacityLiters !== undefined)
              .map(t => {
                let currentLevelLiters = t.currentLevelLiters ?? 0;
                if (summaryData && summaryData.tankStock) {
                  currentLevelLiters = Number(summaryData.tankStock) || 0;
                }
                const cap = t.capacityLiters || 1;
                const pct = (currentLevelLiters / cap) * 100;
                let barColor = 'bg-emerald-500';
                if (pct <= 15) barColor = 'bg-red-500';
                else if (pct <= 35) barColor = 'bg-amber-500';

                return (
                  <div key={t.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-600">
                      <span className="truncate">{t.tankName}</span>
                      <span className="font-semibold text-slate-900">{currentLevelLiters.toLocaleString()} / {(t.capacityLiters ?? 0).toLocaleString()} L</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className={`${barColor} h-full rounded-full`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* HPCL Balance Card */}
        <div className="bg-sky-950 p-5 rounded-2xl border border-sky-900 text-white shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-900/45 rounded-full blur-2xl translate-x-12 -translate-y-12"></div>
          <div>
            <div className="flex items-center justify-between mb-3 text-sky-300">
              <span className="text-xs font-medium font-sans">HPCL Indent Limit Balance</span>
              <Layers className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-2xl font-bold font-mono tracking-tight text-amber-400">{formatINR(displayHpclBalance)}</h2>
            <p className="text-[11px] text-sky-200 mt-1 lines-clamp-2">
              Credit threshold balance with HPCL. Running default OD limit for high capacity indents.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-sky-900/60 flex items-center justify-between text-[11.5px] text-sky-300 font-mono">
            <span>Uptime ID: RO-029410</span>
            <button onClick={() => onNavigate('HPCL Load Management')} className="text-amber-400 hover:underline flex items-center gap-0.5 font-sans font-semibold">
              Top Up Indent <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bank Balances Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Consolidated Banks balance</span>
              <button onClick={() => onNavigate('Bank Management')} className="text-[11px] text-sky-800 font-semibold hover:underline">
                Reconcile
              </button>
            </div>
            <h2 className="text-2xl font-bold font-mono text-slate-900 tracking-tight">{formatINR(displayBankBalance)}</h2>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100/80">
                <span className="text-[10px] text-slate-500 block">SBI Current</span>
                <span className="text-[12px] font-bold text-slate-800 font-mono">₹24.15L</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100/80">
                <span className="text-[10px] text-slate-500 block">HDFC Limit OD</span>
                <span className="text-[12px] font-bold text-slate-800 font-mono">₹41.20L</span>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-3 text-right">
            Synced from 3 banks last hour
          </div>
        </div>
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Chart column (8 spans) */}
        <div className="xl:col-span-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Weekly Retail Fuel Sales Trend</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Continuous flow nozzle delivery quantities (Liters)</p>
            </div>
            <div className="flex items-center gap-3.5 text-xs">
              <div className="flex items-center gap-1 text-sky-700">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-700"></span>
                <span>Petrol (MS)</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span>Diesel (HSD)</span>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Premium (Speed)</span>
              </div>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesHistoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="petrolGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="dieselGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#475569" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#475569" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip formatter={(value) => [`${value} Liters`]} />
                <Area type="monotone" dataKey="Petrol" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#petrolGrad)" />
                <Area type="monotone" dataKey="Diesel" stroke="#475569" strokeWidth={2} fillOpacity={1} fill="url(#dieselGrad)" />
                <Area type="monotone" dataKey="Speed" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#speedGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar logs / payment mix (4 spans) */}
        <div className="xl:col-span-4 grid grid-rows-2 gap-4">
          
          {/* Payment Mix Pie visual */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">Revenue Mode mix</h4>
            <div className="grid grid-cols-2 items-center gap-2">
              <div className="h-[100px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentBreakdownData} innerRadius={28} outerRadius={42} dataKey="value">
                      {paymentBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Total</span>
                  <span className="text-xs font-extrabold text-slate-700">₹2.01M</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {paymentBreakdownData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-[10px] text-slate-600">
                    <span className="w-2 h-2 rounded-full block shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="truncate max-w-[80px]">{item.name}</span>
                    <span className="font-semibold font-mono ml-auto">{(item.value / 100000).toFixed(1)}L</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Recent activity logs</span>
              <Activity className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="space-y-2.5 mt-2 overflow-y-auto max-h-[110px] pr-1">
              {ACTIVITY_LOGS.slice(0, 3).map((log, index) => (
                <div key={index} className="text-[11px] leading-relaxed relative pl-3.5 border-l-2 border-sky-800/20">
                  <span className="absolute top-1 left-0 -translate-x-[50%] w-1.5 h-1.5 rounded-full bg-sky-850"></span>
                  <div className="flex items-center justify-between font-mono text-[9px] text-slate-400">
                    <span>{log.user}</span>
                    <span>{log.time}</span>
                  </div>
                  <p className="text-slate-600 line-clamp-1">{log.action}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
