/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Menu, X, Fuel, LayoutDashboard, Receipt, Wallet, Landmark, Layers, Database,
  Box, Truck, Users, Activity, BarChart3, Settings, ShieldCheck, Search, Bell,
  Flame, ChevronDown, LogOut, Moon, Sun, Monitor, HelpCircle, Briefcase, Plus, TrendingUp
} from 'lucide-react';
import { COMPANY_DETAILS } from '../data';
import { UserAccount } from '../types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeScreen: string;
  setActiveScreen: (screenId: string) => void;
  currentUser: UserAccount;
  onLogout: () => void;
  dbStatus?: 'syncing' | 'connected' | 'offline';
}

export default function DashboardLayout({
  children,
  activeScreen,
  setActiveScreen,
  currentUser,
  onLogout,
  dbStatus = 'connected'
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState('1'); // Ashok Fuels - Ramgarh
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  
  // Theme Switch Simulation State
  const [simulatedTheme, setSimulatedTheme] = useState<'light' | 'dark' | 'auto'>('light');

  // Multi branch selection dropdown values
  const outlets = COMPANY_DETAILS.companyList;

  // Static high-fidelity notifications
  const [notifications, setNotifications] = useState([
    { id: '1', text: 'Critical: Tank 4 Speed MS dip level trigger warning (<2,500L).', type: 'warn', time: '10m ago' },
    { id: '2', text: 'System: Shift A Collections verified with zero cash discrepancy.', type: 'info', time: '2h ago' },
    { id: '3', text: 'HPCL Dispatch: Tanker JH-09-Y-5421 en-route carrying 24KL Diesel.', type: 'success', time: '4h ago' }
  ]);

  // Sidebar list items explicitly defined by Ashok Fuels Specifications
  const menuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'Fuel Sales', label: 'Fuel Sales', icon: Fuel },
    { id: 'Collections', label: 'Collections', icon: Receipt },
    { id: 'Cash Management', label: 'Cash Management', icon: Wallet },
    { id: 'Bank Management', label: 'Bank Management', icon: Landmark },
    { id: 'HPCL Load Management', label: 'HPCL Load Management', icon: Layers },
    { id: 'Tank Stock', label: 'Tank Stock', icon: Database },
    { id: 'Lubricant Inventory', label: 'Lubricant Inventory', icon: Box },
    { id: 'Tanker Management', label: 'Tanker Management', icon: Truck },
    { id: 'Customers', label: 'Customers', icon: Users },
    { id: 'Expenses', label: 'Expenses', icon: Activity },
    { id: 'Accounting', label: 'Accounting', icon: Briefcase },
    { id: 'Reports', label: 'Reports', icon: BarChart3 },
    { id: 'Settings', label: 'Settings', icon: Settings },
    { id: 'User Management', label: 'User Management', icon: ShieldCheck }
  ];

  // Search filter across the 15 screens for quick navigation
  const searchResults = menuItems.filter(item =>
    globalSearchTerm ? item.label.toLowerCase().includes(globalSearchTerm.toLowerCase()) : false
  );

  const handleSearchResultClick = (id: string) => {
    setActiveScreen(id);
    setGlobalSearchTerm('');
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex font-sans ${simulatedTheme === 'dark' ? 'dark-preview-filter' : ''}`}>
      
      {/* 1. MOBILE HEADER BAR */}
      <div id="mobile-header-bar" className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-sky-950 border-b border-sky-900 text-white flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <Menu className="w-5 h-5 text-slate-200 cursor-pointer" onClick={() => setIsSidebarOpen(true)} />
          <div className="flex items-center gap-2">
            <Fuel className="w-5 h-5 text-amber-400" />
            <span className="font-extrabold tracking-tight text-sm">FuelFlow ERP</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="relative p-1.5 hover:bg-sky-900 rounded-full">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full"></span>
          </button>
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
            alt="Owner"
            className="w-8 h-8 rounded-full border border-sky-800"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          />
        </div>
      </div>

      {/* MOBILE BACKDROP OVERLAY */}
      {isSidebarOpen && (
        <div
          id="mobile-sidebar-overlay"
          className="lg:hidden fixed inset-0 bg-slate-950/65 backdrop-blur-xs z-45 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. RECONCILED COLLAPSIBLE SIDEBAR: DESKTOP & MOBILE TRANSIT */}
      <aside
        id="side-nav-column"
        className={`fixed lg:sticky top-0 bottom-0 left-0 w-64 bg-sky-950 border-r border-sky-900 text-white flex flex-col justify-between shrink-0 z-50 transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } h-screen overflow-y-auto`}
      >
        <div>
          {/* Sidebar Brand Header */}
          <div className="h-16 px-6 border-b border-sky-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-lg shadow-sm shrink-0">
                <Fuel className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-sans font-extrabold text-white text-md tracking-tight leading-none block">FuelFlow ERP</span>
                <span className="text-[9px] tracking-wider font-semibold font-mono text-amber-400 block uppercase pt-0.5">Ashok Fuels Group</span>
              </div>
            </div>
            <button className="lg:hidden text-sky-200.hover:text-white" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Core Navigation Items List */}
          <nav className="p-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveScreen(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-tight transition cursor-pointer ${
                    isActive
                      ? 'bg-sky-900 text-amber-400 shadow-sm font-bold border-l-3 border-amber-400 pl-2.5'
                      : 'text-sky-200 hover:text-white hover:bg-sky-900/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-sky-300'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile / Logout bottom anchor */}
        <div className="p-4 border-t border-sky-900 bg-sky-900/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-sky-950 font-bold flex items-center justify-center text-xs shadow-sm shadow-black/25 shrink-0 uppercase">
              {currentUser.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-white leading-none">{currentUser.name}</p>
              <p className="text-[10px] text-sky-350 truncate block mt-0.5 font-mono">{currentUser.role} (Verified)</p>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-sky-350 hover:text-white hover:bg-sky-900 rounded-lg transition"
              title="Secure System Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 3. MAIN DASHBOARD CONTENT AREA */}
      <div id="main-content-column" className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0">
        
        {/* DESKTOP TOP HEADER (Sticky, high-end, Zoho Books grade) */}
        <header id="top-nav-bar" className="hidden lg:flex h-16 bg-white border-b border-slate-100 items-center justify-between px-6 sticky top-0 z-30">
          
          {/* LEFT: Multi branch selector */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                id="company-branch-selector"
                value={selectedOutlet}
                onChange={(e) => {
                  setSelectedOutlet(e.target.value);
                  alert(`Company context switched to: ${outlets.find(o => o.id === e.target.value)?.name}. Data loaded represents consolidated outlet parameters.`);
                }}
                className="appearance-none font-bold text-slate-800 text-xs py-2 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition focus:outline-none"
              >
                {outlets.map(out => (
                  <option key={out.id} value={out.id}>{out.name}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-[11px] text-slate-500 pointer-events-none" />
            </div>

            {/* Database Sync Status Badge Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-[10px] font-extrabold shadow-3xs tracking-wide">
              <span className={`w-2 h-2 rounded-full ${
                dbStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
                dbStatus === 'syncing' ? 'bg-amber-500 animate-bounce' : 'bg-red-500'
              }`} />
              <span className={
                dbStatus === 'connected' ? 'text-emerald-700 font-sans' :
                dbStatus === 'syncing' ? 'text-amber-700 font-sans' : 'text-red-700 font-sans'
              }>
                {dbStatus === 'connected' ? 'MongoDB Atlas' :
                 dbStatus === 'syncing' ? 'Hydrating Mongo DB...' : 'Offline Fallback'}
              </span>
            </div>

            {/* Quick Actions trigger popover placeholder */}
            <div className="relative">
              <button
                onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                className="bg-amber-500 text-sky-950 px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:bg-amber-400 transition cursor-pointer shadow-3xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Quick Actions</span>
              </button>
              
              {isQuickActionsOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-50 animate-fade-in text-slate-700 font-sans font-medium text-xs leading-none">
                  <div className="px-3.5 py-1.5 font-bold text-[10px] text-slate-400 border-b border-slate-50 uppercase tracking-widest">Operations shortcuts</div>
                  <button onClick={() => { setActiveScreen('Fuel Sales'); setIsQuickActionsOpen(false); }} className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2">
                    <Fuel className="w-3.5 h-3.5 text-sky-700" /> <span>Nozzle Totalizers log</span>
                  </button>
                  <button onClick={() => { setActiveScreen('HPCL Load Management'); setIsQuickActionsOpen(false); }} className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-amber-500" /> <span>Place HPCL Indent</span>
                  </button>
                  <button onClick={() => { setActiveScreen('Tank Stock'); setIsQuickActionsOpen(false); }} className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-sky-805" /> <span>Physical Dip Reading</span>
                  </button>
                  <button onClick={() => { setActiveScreen('Expenses'); setIsQuickActionsOpen(false); }} className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-red-650" /> <span>Add Expense Voucher</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* CENTER: Global Search Bar targeting active views jump */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Jump to screens (e.g. Tanker, Reports)..."
              value={globalSearchTerm}
              onChange={(e) => setGlobalSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl text-xs placeholder-slate-400 text-slate-800 transition"
            />
            {globalSearchTerm && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 z-50 text-xs">
                {searchResults.length > 0 ? (
                  searchResults.map(res => (
                    <button
                      key={res.id}
                      onClick={() => handleSearchResultClick(res.id)}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-semibold flex items-center justify-between"
                    >
                      <span>{res.label}</span>
                      <span className="text-[10px] text-slate-400">Jump ↵</span>
                    </button>
                  ))
                ) : (
                  <div className="p-2.5 text-center text-slate-400 font-medium">No system screens matches query.</div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Notifications, Theme Switch Placeholder & Profile */}
          <div className="flex items-center gap-4">
            
            {/* Theme switcher simulator UI widget */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-1 flex gap-1 items-center shrink-0">
              <button
                onClick={() => setSimulatedTheme('light')}
                className={`p-1 rounded ${simulatedTheme === 'light' ? 'bg-white shadow-3xs text-sky-950' : 'text-slate-400 hover:text-slate-600'}`}
                title="SaaS Light Mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSimulatedTheme('dark')}
                className={`p-1 rounded ${simulatedTheme === 'dark' ? 'bg-white shadow-3xs text-sky-850' : 'text-slate-400 hover:text-slate-600'}`}
                title="Highlight Night Shift"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Notifications Popover widget */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 hover:bg-slate-50 rounded-xl text-slate-600 cursor-pointer border border-slate-100 shadow-3xs bg-white"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-504 rounded-full"></span>
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-100 rounded-2xl shadow-xl py-3 z-50 animate-fade-in text-xs font-sans text-slate-700 font-medium">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between font-bold text-slate-800">
                    <span>Notifications ({notifications.length})</span>
                    <button onClick={() => setNotifications([])} className="text-[10px] text-slate-400 hover:underline">Clear all</button>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className="p-3 hover:bg-slate-50 leading-relaxed font-sans">
                          <p className="text-slate-700">{n.text}</p>
                          <span className="text-[9px] text-slate-400 block mt-1 font-mono">{n.time}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-400">All alerts reconciled.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-xl transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-sky-950 font-bold text-white flex items-center justify-center text-xs shadow-3xs uppercase">
                  {currentUser.name[0]}
                </div>
                <div className="text-left min-w-0">
                  <span className="font-sans font-bold text-slate-800 text-xs block leading-none">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">{currentUser.role}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 z-50 text-slate-700 text-xs">
                  <div className="px-3.5 py-2 border-b border-slate-100 leading-normal">
                    <span className="font-sans font-bold text-slate-800 block">{currentUser.name}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{currentUser.email}</span>
                  </div>
                  <button onClick={() => { alert('Enterprise Profile Settings is coming in SaaS multi-branch release.'); setIsProfileOpen(false); }} className="w-full text-left px-3.5 py-2 hover:bg-slate-100">
                    My Profile Preferences
                  </button>
                  <button onClick={onLogout} className="w-full text-left px-3.5 py-2 hover:bg-slate-100 text-red-650 font-semibold border-t border-slate-100">
                    Log Out Terminal
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* 4. MAIN SCREEN CONTAINER */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto animate-fade-in max-w-7xl w-full mx-auto pb-16">
          {children}
        </main>
      </div>

    </div>
  );
}
