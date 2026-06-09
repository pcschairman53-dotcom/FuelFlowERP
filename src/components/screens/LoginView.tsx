/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Fuel, Shield, Lock, Landmark, FileText, CheckCircle2 } from 'lucide-react';

interface LoginViewProps {
  onLogin: (role: 'Owner' | 'Manager') => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [username, setUsername] = useState('anand.ashok@ashokfuels.com');
  const [password, setPassword] = useState('••••••••••••');
  const [dealershipCode, setDealershipCode] = useState('HPCL-RO-029410');
  const [statusMsg, setStatusMsg] = useState('');

  const handleSubmit = (e: React.FormEvent, role: 'Owner' | 'Manager') => {
    e.preventDefault();
    setStatusMsg(`Verifying credentials with HPCL Enterprise Grid...`);
    setTimeout(() => {
      onLogin(role);
    }, 850);
  };

  return (
    <div id="login-container" className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div id="login-grid" className="max-w-5xl w-full bg-white rounded-2xl shadow-xl overflow-hidden grid md:grid-cols-12 min-h-[600px] border border-slate-100">
        
        {/* Left column - Brand & Information Pitch */}
        <div id="login-brand-panel" className="md:col-span-5 bg-sky-950 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle gradient pattern overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-transparent to-sky-900/60 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-xl shadow-lg">
                <Fuel className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight font-sans text-white block">FuelFlow ERP</span>
                <span className="text-[10px] text-amber-400 font-mono tracking-widest uppercase block">Next-Gen Automation</span>
              </div>
            </div>

            <div className="space-y-6 mt-12">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Enterprise Automation for Fuel Retail Networks
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                A highly secure, cloud-based ERP scaling pump operations, automated wet-stock audits, dry lubricants trading, and high-frequency credit customer billing cycles.
              </p>
            </div>
          </div>

          {/* Key capabilities list */}
          <div className="relative z-10 space-y-3.5 mt-8 border-t border-sky-900/80 pt-6">
            <div className="flex items-center gap-3 text-xs text-sky-200">
              <CheckCircle2 className="w-4.5 h-4.5 text-amber-400 shrink-0" />
              <span>Wet-Stock Loss Reconciliation (Tatsuno & Tatsuno)</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-sky-200">
              <CheckCircle2 className="w-4.5 h-4.5 text-amber-400 shrink-0" />
              <span>Automated HPCL Indent Payments via UTR</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-sky-200">
              <CheckCircle2 className="w-4.5 h-4.5 text-amber-400 shrink-0" />
              <span>Multi-Outlet Consolidated Financial Reporting</span>
            </div>
          </div>

          <div className="relative z-10 mt-12 flex items-center justify-between text-[11px] text-slate-400 border-t border-sky-900/40 pt-4 font-mono">
            <span>v2.8.4 Enterprise</span>
            <span>Ashok Fuels Terminal</span>
          </div>
        </div>

        {/* Right column - Clean Financial ERP Login fields */}
        <div id="login-form-panel" className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <span className="text-xs font-semibold tracking-wider text-sky-900 uppercase block mb-1">Secure Sign-On</span>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Access Petrol Station ERP</h2>
              <p className="text-xs text-slate-500 mt-1">Authorized terminals only. Activities are audited by HPCL Area Managers.</p>
            </div>

            <form onSubmit={(e) => handleSubmit(e, 'Owner')} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">HPCL Dealership RO Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Landmark className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={dealershipCode}
                    onChange={(e) => setDealershipCode(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-slate-900 transition-colors"
                    placeholder="HPCL-RO-XXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Corporate Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-slate-900 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">ERP Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-slate-900 transition-colors"
                  />
                </div>
              </div>

              {statusMsg && (
                <div className="text-[12px] bg-sky-50 text-sky-800 p-2.5 rounded border border-sky-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-600 animate-ping"></span>
                  <span>{statusMsg}</span>
                </div>
              )}

              {/* Action Buttons to select pre-seeded high-fidelity profile directly */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  id="btn-login-owner"
                  onClick={(e) => {
                    setUsername('anand.ashok@ashokfuels.com');
                    handleSubmit(e, 'Owner');
                  }}
                  className="w-full bg-slate-900 text-white py-2 px-4 rounded-lg font-medium text-xs hover:bg-slate-850 active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border border-slate-800"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Log in as Owner</span>
                </button>
                <button
                  type="button"
                  id="btn-login-manager"
                  onClick={(e) => {
                    setUsername('sunil.sharma@ashokfuels.com');
                    handleSubmit(e, 'Manager');
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-700 py-2 px-4 rounded-lg font-medium text-xs hover:bg-slate-50 hover:text-slate-900 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <UserAccountButtonIcon />
                  <span>Log in as Manager</span>
                </button>
              </div>
            </form>

            <div className="text-center pt-4">
              <span className="text-[11px] text-slate-400 hover:underline cursor-pointer">
                Trouble logging in? Contact Lubricant & Wet-stock Systems IT Desk
              </span>
            </div>
            
            {/* Demo quick credential highlight box */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100/80 text-[11px] text-amber-800">
              <span className="font-semibold block mb-0.5">💡 Interactive ERP Sandbox Mode:</span>
              <span>Click either button above to bypass security and launch with simulated real-time data feeds as either Ashok Fuels Owner or Manager.</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

function UserAccountButtonIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-sky-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
