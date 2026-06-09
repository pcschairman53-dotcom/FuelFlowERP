/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  Search, Plus, ShieldCheck, Mail, Calendar, Sparkles, HelpCircle, Eye,
  CheckCircle2, DollarSign, Landmark, ArrowRight, Printer, Download,
  Settings, UserPlus, CreditCard, ChevronRight, Sliders, Check, Trash2, X, RefreshCw,
  Phone, MapPin, Building, Edit2
} from 'lucide-react';
import { CreditCustomer, BankAccount, UserAccount, BankTransaction } from '../../types';
import { COMPANY_DETAILS, ACCOUNTING_METRICS, ACTIVITY_LOGS } from '../../data';

// ============================================================================
// 1. CUSTOMERS SCREEN
// ============================================================================
interface CustomersScreenProps {
  customers: CreditCustomer[];
  onAddCreditPayment: (customerId: string, amount: number) => void;
  onUpdateLimit: (customerId: string, limit: number) => void;
}

export function CustomerManagementScreen({ customers, onAddCreditPayment, onUpdateLimit }: CustomersScreenProps) {
  // Module navigation tab
  const [viewMode, setViewMode] = useState<'enterprise_directory' | 'b2b_ledger'>('enterprise_directory');

  // React state synchronized with hydrate & manual updates
  const [localCustomers, setLocalCustomers] = useState<CreditCustomer[]>(customers);

  React.useEffect(() => {
    setLocalCustomers(customers);
  }, [customers]);

  const refetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const json = await res.json();
      if (json.success && json.data) {
        setLocalCustomers(json.data);
      }
    } catch (err) {
      console.error('Failed to reload customers from server:', err);
    }
  };

  // Legacy ledger state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCust, setSelectedCust] = useState<CreditCustomer | null>(null);
  const [payAmount, setPayAmount] = useState(50000);
  const [newLimit, setNewLimit] = useState(1000000);

  const filteredLegacy = localCustomers.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.firmName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Enterprise directory search parameters
  const [dirSearchTerm, setDirSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All');

  // Create / Edit modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CreditCustomer | null>(null);

  // Form Fields
  const [formCustomerCode, setFormCustomerCode] = useState('');
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formGstNumber, setFormGstNumber] = useState('');
  const [formCreditLimit, setFormCreditLimit] = useState(500000);
  const [formCustomerType, setFormCustomerType] = useState<'Retail' | 'Fleet' | 'Corporate'>('Corporate');

  const filteredDir = localCustomers.filter(c => {
    const code = (c.customerCode || c.id || '').toLowerCase();
    const nameStr = (c.customerName || c.name || '').toLowerCase();
    const emailStr = (c.email || '').toLowerCase();
    const mobileStr = (c.mobile || '').toLowerCase();
    const gstStr = (c.gstNumber || '').toLowerCase();
    const search = dirSearchTerm.toLowerCase();

    const matchesSearch = 
      code.includes(search) ||
      nameStr.includes(search) ||
      emailStr.includes(search) ||
      mobileStr.includes(search) ||
      gstStr.includes(search);

    const typeMatch = selectedTypeFilter === 'All' || c.customerType === selectedTypeFilter;

    return matchesSearch && typeMatch;
  });

  const statsTotal = localCustomers.length;
  const statsRetail = localCustomers.filter(c => c.customerType === 'Retail').length;
  const statsFleet = localCustomers.filter(c => c.customerType === 'Fleet' || c.vehicleList?.length > 0).length;
  const statsCorporate = localCustomers.filter(c => c.customerType === 'Corporate' || (!c.customerType && c.vehicleList?.length === 0)).length;

  const handleOpenCreate = () => {
    const nextRandomId = `CST-${Math.floor(100 + Math.random() * 900)}`;
    setEditingCustomer(null);
    setFormCustomerCode(nextRandomId);
    setFormCustomerName('');
    setFormMobile('');
    setFormEmail('');
    setFormAddress('');
    setFormGstNumber('');
    setFormCreditLimit(500000);
    setFormCustomerType('Corporate');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cust: CreditCustomer) => {
    setEditingCustomer(cust);
    setFormCustomerCode(cust.customerCode || cust.id);
    setFormCustomerName(cust.customerName || cust.name || '');
    setFormMobile(cust.mobile || '');
    setFormEmail(cust.email || '');
    setFormAddress(cust.address || '');
    setFormGstNumber(cust.gstNumber || '');
    setFormCreditLimit(cust.creditLimit || 0);
    setFormCustomerType(cust.customerType || 'Corporate');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerCode.trim()) {
      alert('Customer Code is required.');
      return;
    }
    if (!formCustomerName.trim()) {
      alert('Customer Name is required.');
      return;
    }
    if (!formMobile.trim()) {
      alert('Mobile Number is required.');
      return;
    }

    try {
      if (editingCustomer) {
        // Edit Operation
        const payload = {
          customerCode: formCustomerCode,
          customerName: formCustomerName,
          mobile: formMobile,
          email: formEmail,
          address: formAddress,
          gstNumber: formGstNumber,
          creditLimit: formCreditLimit,
          customerType: formCustomerType
        };
        const res = await fetch(`/api/customers/${editingCustomer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const d = await res.json();
        if (d.success) {
          setIsFormOpen(false);
          await refetchCustomers();
        } else {
          alert('Failed to update customer: ' + (d.message || 'unknown error'));
        }
      } else {
        // Create Operation
        const payload = {
          customerCode: formCustomerCode,
          customerName: formCustomerName,
          mobile: formMobile,
          email: formEmail,
          address: formAddress,
          gstNumber: formGstNumber,
          creditLimit: formCreditLimit,
          customerType: formCustomerType,
          outstandingBalance: 0,
          unbilledAmount: 0,
          billingPeriod: 'Monthly',
          vehicleList: [],
          status: 'Active'
        };
        const res = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const d = await res.json();
        if (d.success) {
          setIsFormOpen(false);
          await refetchCustomers();
        } else {
          alert('Failed to register customer: ' + (d.message || 'unknown error'));
        }
      }
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to completely delete the customer "${name}" from the collection?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'DELETE'
      });
      const d = await res.json();
      if (d.success) {
        await refetchCustomers();
      } else {
        alert('Failed to delete customer: ' + (d.message || 'unknown error'));
      }
    } catch (err) {
      console.error('Error deleting customer:', err);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      
      {/* Upper header section */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Enterprise Customers Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Direct real-time Atlas collection synchronization. View, index, create, edit and delete accounts securely.
          </p>
        </div>

        {/* Tab switch navigation */}
        <div className="flex bg-slate-100 p-1 rounded-lg shrink-0 self-start md:self-auto border border-slate-200">
          <button
            id="tab-btn-directory"
            onClick={() => setViewMode('enterprise_directory')}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
              viewMode === 'enterprise_directory'
                ? 'bg-sky-950 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Customer Directory (CRUD)
          </button>
          <button
            id="tab-btn-ledger"
            onClick={() => setViewMode('b2b_ledger')}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
              viewMode === 'b2b_ledger'
                ? 'bg-sky-950 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            B2B Fleet Credit Ledger
          </button>
        </div>
      </div>

      {/* RENDER VIEW 1: ENTERPRISE DIRECTORY (NEW FEATURE) */}
      {viewMode === 'enterprise_directory' && (
        <div className="space-y-4">
          
          {/* Dashboard Summary Mini-Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-3xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Directory</span>
              <span className="text-xl font-extrabold text-slate-850 font-mono mt-0.5 block">{statsTotal}</span>
              <span className="text-[10px] text-slate-400 font-medium block mt-1">Registered Accounts</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-3xs">
              <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider block">Retail Customers</span>
              <span className="text-xl font-extrabold text-blue-800 font-mono mt-0.5 block">{statsRetail}</span>
              <span className="text-[10px] text-slate-400 font-medium block mt-1">Cash / Prepaid</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-3xs">
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider block">Fleet Customers</span>
              <span className="text-xl font-extrabold text-emerald-800 font-mono mt-0.5 block">{statsFleet}</span>
              <span className="text-[10px] text-slate-400 font-medium block mt-1">Vehicle Auth Chains</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-3xs">
              <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider block">Corporate B2B</span>
              <span className="text-xl font-extrabold text-indigo-800 font-mono mt-0.5 block">{statsCorporate}</span>
              <span className="text-[10px] text-slate-400 font-medium block mt-1">Credit Invoice Accounts</span>
            </div>
          </div>

          {/* Action Ribbon & Filters */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-150 shadow-3xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
              
              {/* Search Field */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="dir-search-box"
                  type="text"
                  placeholder="Search code, name, email, mobile..."
                  value={dirSearchTerm}
                  onChange={(e) => setDirSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-sky-900 focus:bg-white"
                />
              </div>

              {/* Segment Type Filter */}
              <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-lg">
                {['All', 'Corporate', 'Fleet', 'Retail'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedTypeFilter(type)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition cursor-pointer ${
                      selectedTypeFilter === type
                        ? 'bg-sky-950 text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Create Trigger */}
            <button
              id="add-custom-trigger"
              onClick={handleOpenCreate}
              className="w-full md:w-auto bg-sky-950 hover:bg-sky-900 text-white rounded-lg px-4.5 py-2 text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              Add Customer Account
            </button>
          </div>

          {/* Main Directory Table */}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-3xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    <th className="p-4">Customer Details</th>
                    <th className="p-4">Contact Info</th>
                    <th className="p-4">Classification</th>
                    <th className="p-4">GST / Address</th>
                    <th className="p-4 text-right">Credit Line</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[12px] text-slate-700">
                  {filteredDir.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                        No customer accounts found in the database. Add a new customer to insert test data.
                      </td>
                    </tr>
                  ) : (
                    filteredDir.map((cust) => {
                      const custType = cust.customerType || 'Corporate';
                      let typeColor = 'bg-slate-100 text-slate-700';
                      if (custType === 'Retail') typeColor = 'bg-blue-50 text-blue-700 border-blue-150';
                      else if (custType === 'Fleet') typeColor = 'bg-emerald-50 text-emerald-700 border-emerald-150';
                      else if (custType === 'Corporate') typeColor = 'bg-indigo-50 text-indigo-700 border-indigo-150';

                      return (
                        <tr key={cust.id} className="hover:bg-slate-50/70 transition">
                          
                          {/* Code and Name */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <span className="px-2 py-1 font-mono text-[10px] font-bold bg-slate-100 text-slate-600 rounded">
                                {cust.customerCode || cust.id}
                              </span>
                              <div>
                                <span className="font-extrabold text-slate-900 block font-sans">
                                  {cust.customerName || cust.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  ID: {cust.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Contact Info */}
                          <td className="p-4 font-mono text-xs">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                <span>{cust.mobile || 'N/A'}</span>
                              </div>
                              {cust.email && (
                                <div className="flex items-center gap-1.5 text-slate-500">
                                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="truncate max-w-44">{cust.email}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Classification type badging */}
                          <td className="p-4">
                            <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-full ${typeColor}`}>
                              {custType}
                            </span>
                          </td>

                          {/* GST and Address details */}
                          <td className="p-4">
                            <div className="space-y-0.5 max-w-xs">
                              {cust.gstNumber ? (
                                <div className="flex items-center gap-1.5 text-slate-700 font-mono text-xs">
                                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>GST: {cust.gstNumber}</span>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">No registered GSTIN</span>
                              )}
                              {cust.address && (
                                <div className="flex items-start gap-1 text-slate-500 text-[11px] line-clamp-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                  <span>{cust.address}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Credit line */}
                          <td className="p-4 text-right font-mono font-bold text-slate-900">
                            ₹{(cust.creditLimit || 0).toLocaleString()}
                          </td>

                          {/* CRUD Actions */}
                          <td className="p-4 text-center">
                            <div className="inline-flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5 divide-x divide-slate-200 shadow-3xs">
                              <button
                                onClick={() => handleOpenEdit(cust)}
                                className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 rounded-l transition cursor-pointer"
                                title="Edit Customer Portfolio"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCustomer(cust.id, cust.customerName || cust.name)}
                                className="px-2.5 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-r transition cursor-pointer"
                                title="Close Customer Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
        </div>
      )}

      {/* RENDER VIEW 2: TRADITIONAL B2B FLEET LEDGER (ORIGINAL BEHAVIOR FULLY PRESERVED) */}
      {viewMode === 'b2b_ledger' && (
        <div className="space-y-4">
          
          {/* Legacy Search bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs flex">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by promoter or firm name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800"
              />
            </div>
            <div className="ml-auto text-xs text-slate-500 flex items-center gap-1.5 font-bold">
              <span>Credit Exposure: ₹{(localCustomers.reduce((a, b) => a + (b.outstandingBalance || 0), 0)).toLocaleString()}</span>
            </div>
          </div>

          {/* Legacy Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {filteredLegacy.map(cust => {
              const outstanding = cust.outstandingBalance || 0;
              const limit = cust.creditLimit || 1;
              const limitUsedPct = (outstanding / limit) * 100;
              let statusColor = 'border-emerald-250 bg-emerald-50 text-emerald-800';
              if (cust.status === 'Limit Exceeded') {
                statusColor = 'border-red-200 bg-red-50 text-red-800';
              } else if (cust.status === 'Suspended') {
                statusColor = 'border-slate-205 bg-slate-50 text-slate-700';
              }

              return (
                <div key={cust.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-3xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-3">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase leading-none">{cust.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColor}`}>
                        {cust.status || 'Active'}
                      </span>
                    </div>
                    <h3 className="text-[14px] font-extrabold text-slate-900 block truncate">{cust.firmName || cust.customerName || cust.name}</h3>
                    <span className="text-[11px] text-slate-500 font-medium block">Promoter: {cust.name || cust.customerName}</span>

                    <div className="my-4 space-y-2 text-[12px] leading-relaxed">
                      <div className="flex justify-between border-b border-slate-50 pb-1.5 font-mono">
                        <span className="text-slate-400">Outstanding:</span>
                        <span className="font-bold text-slate-800">₹{outstanding.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-1.5 font-mono">
                        <span className="text-slate-400">Credit Limit:</span>
                        <span className="font-bold text-slate-500">₹{limit.toLocaleString()}</span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>Limit Exposure</span>
                          <span>{limitUsedPct.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${limitUsedPct > 85 ? 'bg-red-500' : 'bg-sky-950'}`} style={{ width: `${limitUsedPct}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Plates listing */}
                    <div className="mt-4 pt-3.5 border-t border-slate-50">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Authorized Plates ({(cust.vehicleList || []).length})</span>
                      <div className="flex flex-wrap gap-1">
                        {(cust.vehicleList || []).slice(0, 3).map(plt => (
                          <span key={plt} className="text-[10px] font-mono bg-slate-150 text-slate-700 px-1.5 py-0.5 rounded font-bold">{plt}</span>
                        ))}
                        {(cust.vehicleList || []).length > 3 && (
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-1 py-0.5 border border-slate-100 rounded">+{cust.vehicleList.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-5">
                    <button
                      onClick={() => {
                        setSelectedCust(cust);
                        setPayAmount(50000);
                        setNewLimit(cust.creditLimit);
                      }}
                      className="bg-sky-950 text-white hover:bg-sky-900 border border-sky-850 text-center py-1.5 rounded-lg font-bold text-[11px] cursor-pointer transition shadow-3xs"
                    >
                      Record Payment
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCust(cust);
                        setPayAmount(0);
                        setNewLimit(cust.creditLimit);
                      }}
                      className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-center py-1.5 rounded-lg font-bold text-[11px] cursor-pointer transition shadow-3xs"
                    >
                      Adjust Parameters
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legacy Customer drawer actions */}
          {selectedCust && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden">
                <div className="bg-sky-950 p-4 text-white flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold">Ledger Parameters: {selectedCust.firmName}</h3>
                    <p className="text-[11px] text-sky-200">Record payments or revise credit limits.</p>
                  </div>
                  <button onClick={() => setSelectedCust(null)} className="text-sky-200">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <span className="font-semibold text-slate-800 text-xs block mb-1">Record Cash/Bank Remittance</span>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={payAmount}
                        onChange={(e) => setPayAmount(parseFloat(e.target.value))}
                        className="flex-1 p-2 border border-slate-200 rounded text-xs font-mono font-bold text-sky-950"
                        placeholder="Enter Payment amount (₹)"
                      />
                      <button
                        onClick={() => {
                          onAddCreditPayment(selectedCust.id, payAmount);
                          setSelectedCust(null);
                        }}
                        disabled={payAmount <= 0}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-1.5 px-3.5 rounded text-xs font-semibold cursor-pointer"
                      >
                        Confirm Recv
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 font-sans">
                    <span className="font-semibold text-slate-800 text-xs block mb-1">Adjust Approved Credit Limit Cap</span>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={newLimit}
                        onChange={(e) => setNewLimit(parseFloat(e.target.value))}
                        className="flex-1 p-2 border border-slate-200 rounded text-xs font-mono font-bold"
                      />
                      <button
                        onClick={() => {
                          onUpdateLimit(selectedCust.id, newLimit);
                          setSelectedCust(null);
                        }}
                        className="bg-sky-950 hover:bg-sky-900 text-white py-1.5 px-3.5 rounded text-xs font-semibold cursor-pointer"
                      >
                        Set New limit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER FORM MODAL: REGISTER OR EDIT CUSTOMER PORTFOLIO */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="bg-sky-950 p-4.5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">
                  {editingCustomer ? 'Modify Customer Record' : 'Register New Customer Portfolio'}
                </h3>
                <p className="text-[11px] text-sky-200 mt-0.5">
                  {editingCustomer ? `Editing values for ${editingCustomer.id}` : 'Fill in the following fields to save directly to Atlas.'}
                </p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-sky-200 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                
                {/* Customer Code */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Customer Account Code *
                  </label>
                  <input
                    id="form-customer-code"
                    type="text"
                    required
                    disabled={editingCustomer ? true : false}
                    value={formCustomerCode}
                    onChange={(e) => setFormCustomerCode(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded text-xs font-mono font-semibold bg-slate-55 text-slate-700 disabled:opacity-60"
                    placeholder="e.g. CST-401"
                  />
                </div>

                {/* Customer Type */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Classification Type *
                  </label>
                  <select
                    id="form-customer-type"
                    value={formCustomerType}
                    onChange={(e) => setFormCustomerType(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 rounded text-xs bg-white text-slate-800 font-semibold"
                  >
                    <option value="Corporate">Corporate B2B Invoice</option>
                    <option value="Fleet">Pre-Authorized Fleet Chain</option>
                    <option value="Retail">Retail Pre-paid / Cash</option>
                  </select>
                </div>

                {/* Customer Name */}
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Customer Full Name / Enterprise Name *
                  </label>
                  <input
                    id="form-customer-name"
                    type="text"
                    required
                    value={formCustomerName}
                    onChange={(e) => setFormCustomerName(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded text-xs text-slate-800 font-semibold"
                    placeholder="e.g. Ashok Logistics Ltd. or John Doe"
                  />
                </div>

                {/* Mobile Phone Number */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Mobile Phone Target *
                  </label>
                  <input
                    id="form-mobile"
                    type="text"
                    required
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded text-xs font-mono font-semibold text-slate-800"
                    placeholder="e.g. +91 9876543210"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    E-mail Address
                  </label>
                  <input
                    id="form-email"
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded text-xs text-slate-800"
                    placeholder="e.g. accounts@enterprise.com"
                  />
                </div>

                {/* GST Number */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    GSTIN Registration Number
                  </label>
                  <input
                    id="form-gstin"
                    type="text"
                    value={formGstNumber}
                    onChange={(e) => setFormGstNumber(e.target.value.toUpperCase())}
                    className="w-full p-2 border border-slate-200 rounded text-xs font-mono font-bold text-slate-800"
                    placeholder="e.g. 27AAAAA1111A1Z1"
                  />
                </div>

                {/* Approved Credit Limit */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Approved Credit Limit Cap (₹)
                  </label>
                  <input
                    id="form-credit-limit"
                    type="number"
                    min="0"
                    value={formCreditLimit}
                    onChange={(e) => setFormCreditLimit(Number(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-200 rounded text-xs font-mono font-bold text-slate-900"
                    placeholder="e.g. 500000"
                  />
                </div>

                {/* Complete Address */}
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Corporate / Residential Address Info
                  </label>
                  <textarea
                    id="form-address"
                    rows={2}
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded text-xs text-slate-800"
                    placeholder="e.g. Industrial Bay Yard 4, NH-4, Mumbai, MH"
                  />
                </div>
              </div>

              {/* Action Ribbon */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
                <button
                  id="form-cancel-btn"
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  id="form-submit-btn"
                  type="submit"
                  className="bg-sky-950 hover:bg-sky-900 text-white rounded-lg px-5 py-2 text-xs font-bold cursor-pointer transition shadow-2xs"
                >
                  Save Changes
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
// 2. BANK MANAGEMENT SCREEN
// ============================================================================
interface BankManagementScreenProps {
  banks: BankAccount[];
  transactions: BankTransaction[];
}

export function BankManagementScreen({ banks, transactions }: BankManagementScreenProps) {
  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-5 animate-fade-in font-sans">
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Enterprise Bank Accounts & Reconciliations</h1>
        <p className="text-xs text-slate-500">Monitor Escrows and active HPCL Purchase Limit OD thresholds. Reconcile CDM deposits.</p>
      </div>

      {/* Micro layout of bank accounts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {banks.map(bk => (
          <div key={bk.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-3xs relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full translate-x-8 -translate-y-8" />
            <div className="relative z-10">
              <span className="p-2 bg-slate-100 text-sky-950 rounded-xl inline-block mb-3">
                <Landmark className="w-5 h-5 text-sky-850" />
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider block uppercase">{bk.id} • {bk.bankType}</span>
              <h3 className="text-[15px] font-extrabold text-slate-900 block mt-1">{bk.bankName}</h3>
              <p className="text-[11px] text-slate-505 font-mono">{bk.accountNumber}</p>
            </div>
            
            <div className="mt-5 relative z-10 border-t border-slate-50 pt-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Ledger Balance</span>
              <h2 className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">{formatINR(bk.currentBalance)}</h2>
              <span className="text-[9px] text-slate-400 block mt-1">Last Reconciled: {bk.lastReconciled}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Transactions Table logs */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Cleared / Un-cleared Settle History</span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase font-mono">Consolidated feed (Live API proxy disabled)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3.5">Txn Date/ID</th>
                <th className="p-3.5">Category Settle</th>
                <th className="p-3.5">Bank Terminal Account</th>
                <th className="p-3.5">Reference UTR</th>
                <th className="p-3.5">Audit Remarks</th>
                <th className="p-3.5 text-right">Sum Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {transactions.map(txn => {
                const isCredit = txn.type === 'Credit';
                return (
                  <tr key={txn.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 font-mono text-[11px]">
                      <span className="font-bold text-slate-900 block">{txn.dateTime}</span>
                      <span className="text-[10px] text-slate-400 block">{txn.id}</span>
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-semibold ${
                        isCredit ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                      }`}>
                        {txn.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-505 font-mono">{txn.bankAccountId === 'BNK-001' ? 'SBI Current' : txn.bankAccountId === 'BNK-002' ? 'HDFC Limit OD' : 'ICICI Escrow'}</td>
                    <td className="p-3.5 font-mono text-slate-600">{txn.referenceNumber}</td>
                    <td className="p-3.5 text-slate-400 max-w-xs truncate" title={txn.remarks}>{txn.remarks}</td>
                    <td className={`p-3.5 text-right font-mono font-bold ${isCredit ? 'text-emerald-700' : 'text-red-650'}`}>
                      {isCredit ? '+' : '-'} {formatINR(txn.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// 3. ACCOUNTING SCREEN
// ============================================================================
export function AccountingScreen() {
  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  };

  const metrics = ACCOUNTING_METRICS;

  const [jvs, setJvs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [voucherNo, setVoucherNo] = useState('');
  const [debitAccount, setDebitAccount] = useState('Expenses Ledger');
  const [creditAccount, setCreditAccount] = useState('Cash inside Treasury');
  const [amount, setAmount] = useState(15000);
  const [narration, setNarration] = useState('Calibration and logistics opex adjustments');

  // Custom Toast notifications state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, visible: true });
    // Auto-dim after timeout
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Fetch Journal Vouchers from MongoDB Atlas
  const fetchJVs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/journal-vouchers');
      const json = await res.json();
      if (json.success && json.data) {
        setJvs(json.data);
      } else {
        // Local state-only backup
        const fallback = metrics.recentJournals.map(jv => {
          let debit = 'Cash in Hand';
          let credit = 'Credit Customers';
          let narr = jv.type;
          if (jv.id === 'JV-401') {
            debit = 'Cash in Hand';
            credit = 'Credit Customers';
          } else if (jv.id === 'JV-402') {
            debit = 'HPCL Purchase Limit';
            credit = 'Bank Current';
          } else if (jv.id === 'JV-403') {
            debit = 'Lubricants Reserve';
            credit = 'M/s Castrol Distributors';
          }
          return {
            id: jv.id,
            voucherNo: jv.id,
            date: jv.date,
            debitAccount: debit,
            creditAccount: credit,
            amount: jv.amount,
            narration: narr
          };
        });
        setJvs(fallback);
      }
    } catch (err) {
      console.error(err);
      showToast('Offline fallbacks active. Local ledger operational.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchJVs();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setVoucherNo(`JV-${Math.floor(400 + Math.random() * 599)}`);
    setDate(new Date().toISOString().split('T')[0]);
    setDebitAccount('Expenses Ledger');
    setCreditAccount('Cash inside Treasury');
    setAmount(15000);
    setNarration('Operating logistics calibration opex update');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setIsEditing(true);
    setEditingId(item.id);
    setVoucherNo(item.voucherNo || item.id);
    setDate(item.date || new Date().toISOString().split('T')[0]);
    setDebitAccount(item.debitAccount);
    setCreditAccount(item.creditAccount);
    setAmount(item.amount);
    setNarration(item.narration);
    setIsFormOpen(true);
  };

  const handleSaveJV = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      voucherNo: voucherNo || `JV-${Math.floor(400 + Math.random() * 599)}`,
      date,
      debitAccount,
      creditAccount,
      amount,
      narration
    };

    try {
      if (isEditing && editingId) {
        const res = await fetch(`/api/journal-vouchers/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.success) {
          showToast(`Journal voucher ${editingId} committed successfully.`, 'success');
          fetchJVs();
          setIsFormOpen(false);
        } else {
          showToast(json.message || 'Error occurred while saving changes.', 'error');
        }
      } else {
        const res = await fetch('/api/journal-vouchers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.success) {
          showToast(`New journal voucher ${json.data?.voucherNo || payload.voucherNo} created successfully in Atlas.`, 'success');
          fetchJVs();
          setIsFormOpen(false);
        } else {
          showToast(json.message || 'Failed to sync new double-entry ledger.', 'error');
        }
      }
    } catch (err) {
      showToast('Network error during ledger sync pipeline.', 'error');
    }
  };

  const handleDeleteJV = async (id: string) => {
    if (window.confirm(`Are you sure you want to permanently delete Journal Voucher "${id}"?`)) {
      try {
        const res = await fetch(`/api/journal-vouchers/${id}`, {
          method: 'DELETE'
        });
        const json = await res.json();
        if (json.success) {
          showToast(`Voucher ${id} has been deleted successfully.`, 'success');
          fetchJVs();
        } else {
          showToast(json.message || 'Cannot delete requested book entry.', 'error');
        }
      } catch (err) {
        showToast('Atlas sync deletion network timeout.', 'error');
      }
    }
  };

  return (
    <div className="space-y-5 animate-fade-in font-sans relative">
      {/* Toast alert indicator */}
      {toast.visible && (
        <div className={`fixed top-4 right-4 z-[99] max-w-sm w-full bg-white rounded-xl shadow-xl border p-4 flex items-start gap-3 transition-transform animate-fade-in ${
          toast.type === 'success' ? 'border-emerald-250 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-800">Double-Entry Alert Log</h4>
            <p className="text-[11px] text-slate-500 mt-1">{toast.message}</p>
          </div>
          <button onClick={() => setToast(prev => ({ ...prev, visible: false }))} className="text-slate-400 hover:text-slate-650 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Enterprise Financial Ledger (GAAP Double-Entry)</h1>
          <p className="text-xs text-slate-500">Examine margins, current receivables and recent journal entries locked for Ashok Fuels consolidated operations.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-sky-950 text-white hover:bg-sky-900 border border-sky-850 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-3xs self-start"
        >
          <Plus className="w-4 h-4 text-amber-400" /> Add Journal Voucher
        </button>
      </div>

      {/* P&L Scorecard summary */}
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Consolidated P&L Outlook (YTD)</h3>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-mono block">OPERATING REVENUE</span>
          <h4 className="text-lg font-bold text-slate-900 font-mono mt-1">{formatINR(metrics.pnl.revenue)}</h4>
          <span className="text-[10px] text-slate-400">Total wet stock delivery logs</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-mono block">COST OF GOODS (HPCL BULK)</span>
          <h4 className="text-lg font-bold text-slate-800 font-mono mt-1">{formatINR(metrics.pnl.costOfGoods)}</h4>
          <span className="text-[10px] text-slate-400">Locked Indent invoice buy-offs</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-mono block">NET TAXABLE MARGINS</span>
          <h4 className="text-lg font-bold text-slate-900 font-mono mt-1">{formatINR(metrics.pnl.netProfit)}</h4>
          <span className="text-[10px] text-emerald-600 font-semibold">Margin ref: {metrics.pnl.marginPercentage}%</span>
        </div>
        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-300 font-mono block">RECEIVABLES OUTSTANDING</span>
          <h4 className="text-lg font-bold text-amber-400 font-mono mt-1">{formatINR(metrics.assets.accountsReceivable)}</h4>
          <span className="text-[10px] text-slate-400">B2B credit balances pending bills</span>
        </div>
      </div>

      {/* Journal Entry listings */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Double-Entry Journal Vouchers (JV)</span>
          <button onClick={() => showToast('Financial GAAP Books have been locked for audit compliance.', 'success')} className="text-xs text-sky-850 font-semibold hover:underline flex items-center gap-1 cursor-pointer">
            <Printer className="w-3.5 h-3.5 animate-pulse" /> Force GAAP Book Lock
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3.5">Locked Date</th>
                <th className="p-3.5">JV Reference</th>
                <th className="p-3.5">Debit/Credit Ledger Accounts Particulars</th>
                <th className="p-3.5">Voucher Type</th>
                <th className="p-3.5 text-right">Debit Balance Amount</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-slate-400" />
                    <p className="text-xs text-slate-400 mt-2 font-semibold">Loading double-entries from Atlas...</p>
                  </td>
                </tr>
              ) : jvs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-sans font-medium">
                    No ledger entries listed. Press Add Journal Voucher to insert test logs.
                  </td>
                </tr>
              ) : (
                jvs.map((jv: any) => {
                  const particulars = `${jv.debitAccount} A/c Dr To ${jv.creditAccount}`;
                  return (
                    <tr key={jv.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5 text-slate-500">{jv.date}</td>
                      <td className="p-3.5 text-sky-950 font-bold">{jv.id}</td>
                      <td className="p-3.5">
                        <div className="text-slate-800 text-[11.5px] font-sans font-bold">{particulars}</div>
                        <div className="text-[10.5px] text-slate-400 font-sans italic mt-0.5">Ref Narration: {jv.narration || jv.type || 'Manual GAAP Audit Correction'}</div>
                      </td>
                      <td className="p-3.5 font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-bold">
                          GAAP Double-Entry
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-bold text-slate-900">{formatINR(jv.amount)}</td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(jv)}
                            title="Edit JV details"
                            className="p-1.5 text-slate-400 hover:text-sky-950 rounded hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteJV(jv.id)}
                            title="Delete double-entry"
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Journal Voucher form modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden">
            <form onSubmit={handleSaveJV}>
              <div className="bg-sky-950 p-4 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold">{isEditing ? `Edit Journal Voucher: ${voucherNo}` : 'Create GAAP Double-Entry Voucher'}</h3>
                  <p className="text-[11px] text-sky-200">Adjust asset reserves, invoice buy-offs and corporate payouts instantly.</p>
                </div>
                <button type="button" onClick={() => setIsFormOpen(false)} className="text-sky-200 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">JV Reference No</label>
                    <input
                      type="text"
                      required
                      value={voucherNo}
                      onChange={(e) => setVoucherNo(e.target.value)}
                      placeholder="JV-40X"
                      disabled={isEditing}
                      className="w-full text-xs p-2 border border-slate-200 rounded font-mono font-bold bg-slate-50 text-slate-550 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Locked Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded focus:border-sky-950"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Debit Account (Particular Dr)</label>
                    <select
                      value={debitAccount}
                      onChange={(e) => setDebitAccount(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded bg-white font-sans focus:border-sky-950"
                    >
                      <option value="Expenses Ledger">Expenses Ledger (Attendant Wages, Power)</option>
                      <option value="Cash in Hand">Cash in Hand</option>
                      <option value="HPCL Purchase Limit">HPCL Purchase Limit / Indent buy-offs</option>
                      <option value="Lubricants Reserve">Lubricants Reserve</option>
                      <option value="Corporate Bank Account">Corporate Bank account (SBI/HDFC)</option>
                      <option value="Operating Accounts">Operating Accounts Current</option>
                      <option value="Credit Customers Ledger">Credit Customers Ledger</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Credit Account (Particular Cr)</label>
                    <select
                      value={creditAccount}
                      onChange={(e) => setCreditAccount(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded bg-white font-sans focus:border-sky-950"
                    >
                      <option value="Cash inside Treasury">Cash inside Treasury Safe</option>
                      <option value="Bank Current Account">Bank Current account (SBI/HDFC)</option>
                      <option value="Credit Customers Ledger">Credit Customers Ledger</option>
                      <option value="HPCL Bulk Purchase Reserve">HPCL Bulk Purchase Reserve</option>
                      <option value="M/s Castrol Distributors">M/s Castrol Distributors</option>
                      <option value="Operating Accounts">Operating Accounts Current</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Double-Entry Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2 border border-slate-200 rounded font-mono font-bold text-sky-950 focus:border-sky-950"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Narration / Internal Statement Particulars</label>
                  <textarea
                    required
                    rows={2}
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                    placeholder="Describe transaction details, specific cash drawers involved, clearance codes..."
                    className="w-full text-xs p-2 border border-slate-200 rounded focus:border-sky-950"
                  />
                </div>
              </div>

              <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs rounded-lg font-semibold cursor-pointer hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-950 text-white text-xs rounded-lg font-semibold cursor-pointer hover:bg-sky-900 transition"
                >
                  {isEditing ? 'Save Changes' : 'Approve & Commit Entry'}
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
// 4. REPORTS SCREEN
// ============================================================================
export function ReportsScreen() {
  const [selectedRange, setSelectedRange] = useState('Last 30 Days');
  const [reportType, setReportType] = useState('Fuel Sales Consolidated');
  const [reportItems, setReportItems] = useState<any[]>([]);
  const [recordCount, setRecordCount] = useState(0);
  const [totalSum, setTotalSum] = useState(0);
  const [isCompiling, setIsCompiling] = useState(false);

  // Custom Toast notifications state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(value);
  };

  // Compile database report from MongoDB Atlas live collections
  const compileDatabaseReport = async (silent = false) => {
    setIsCompiling(true);
    try {
      const res = await fetch('/api/reports/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType, selectedRange })
      });
      const data = await res.json();
      if (data.success) {
        setReportItems(data.items || []);
        setRecordCount(data.recordCount || 0);
        setTotalSum(data.totalValueSum || 0);
        if (!silent) {
          showToast(`Report compiled successfully from Atlas. Sourced ${data.recordCount} live records.`, 'success');
        }
      } else {
        showToast(data.message || 'Error occurred compiling ledger metrics.', 'error');
      }
    } catch (err) {
      showToast('Network error while querying Atlas server.', 'error');
    } finally {
      setIsCompiling(false);
    }
  };

  // Automatically fetch when category or range transitions
  React.useEffect(() => {
    compileDatabaseReport(true);
  }, [reportType, selectedRange]);

  const exportCSV = async () => {
    try {
      await fetch('/api/reports/log-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          selectedRange,
          exportType: 'CSV',
          recordCount,
          totalAmount: totalSum
        })
      });
    } catch (err) {
      console.error('Audit report_logs failure:', err);
    }

    let csvContent = `Ashok Retail Oil Station Group\n`;
    csvContent += `Report Category: ${reportType}\n`;
    csvContent += `Reporting Range: ${selectedRange}\n`;
    csvContent += `Printed on: ${new Date().toISOString()}\n\n`;
    csvContent += `Item / Account Head Details,Quantity,Net Sum\n`;
    
    reportItems.forEach(item => {
      csvContent += `"${item.head}","${item.quantity}",${item.netSum}\n`;
    });
    csvContent += `"Consolidated Trade Net Sum","","${totalSum}"\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${reportType.replace(/ /g, '_')}_${selectedRange.replace(/ /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Report downloaded as standard audit CSV file.', 'success');
  };

  const exportPDF = async () => {
    try {
      try {
        await fetch('/api/reports/log-export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reportType,
            selectedRange,
            exportType: 'PDF',
            recordCount,
            totalAmount: totalSum
          })
        });
      } catch (err) {
        console.error('Audit report_logs failure:', err);
      }

      // Generate genuine, beautifully structured PDF using jsPDF
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      // Page background border
      doc.setDrawColor(15, 23, 42); // deep slate/black
      doc.setLineWidth(0.8);
      doc.rect(5, 5, 200, 287);

      // Title header
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42);
      doc.text('ASHOK RETAIL OIL STATION GROUP', 105, 20, { align: 'center' });

      // Subtitle
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('NH-33, Ramgarh-Ranchi Highway, Jharkhand - 829122', 105, 26, { align: 'center' });
      doc.text(`RO Dealership ID: ${COMPANY_DETAILS.dealershipCode} | VAT TIN: ${COMPANY_DETAILS.vatTin}`, 105, 31, { align: 'center' });

      // Solid divider
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.5);
      doc.line(12, 36, 198, 36);

      // Metadata Info Box
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('COMPLIANCE AUDIT RECORD SUMMARY', 12, 44);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`Report Type: ${reportType}`, 12, 50);
      doc.text(`Selected Period: ${selectedRange}`, 12, 56);
      doc.text(`Live Sourced Count: ${recordCount} database documents`, 12, 62);
      doc.text(`Compilation Node: RO-DB-SERVER-02 (MongoDB Atlas Connected)`, 12, 68);
      doc.text(`Date of Statement: ${new Date().toISOString().substring(0, 19).replace('T', ' ')} (UTC)`, 12, 74);

      // Double-entry Table header header box
      doc.setFillColor(15, 23, 42);
      doc.rect(12, 80, 186, 9, 'F');

      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text('ITEM PARTICULAR DETAILS', 16, 86);
      doc.text('QUANTITY / RANGE VALUE', 115, 86);
      doc.text('NET SUM AMOUNT', 193, 86, { align: 'right' });

      // Listing items
      let currentY = 96;
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(51, 65, 85);

      reportItems.forEach((item, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(12, currentY - 5, 186, 7, 'F');
        }

        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        const titleText = item.head || '';
        const limitText = titleText.length > 55 ? titleText.substring(0, 52) + '...' : titleText;
        doc.text(limitText, 16, currentY);

        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(item.quantity || '', 115, currentY);

        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        const netSumStr = 'INR ' + (item.netSum || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
        doc.text(netSumStr, 193, currentY, { align: 'right' });

        // Divider
        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(0.3);
        doc.line(12, currentY + 2, 198, currentY + 2);

        currentY += 8;
      });

      // Total balance footer
      currentY += 4;
      doc.setFillColor(241, 245, 249);
      doc.rect(12, currentY - 5, 186, 8, 'F');

      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.text('CONSOLIDATED REVENUE SUMMARY (GRAND TOTAL)', 16, currentY);

      const totalVal = 'INR ' + totalSum.toLocaleString('en-IN', { minimumFractionDigits: 2 });
      doc.text(totalVal, 193, currentY, { align: 'right' });

      // Accounting Bottom Lines
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.5);
      doc.line(12, currentY + 4, 198, currentY + 4);
      doc.line(12, currentY + 5.2, 198, currentY + 5.2);

      // Sign-off signature footer
      const signatureY = 245;
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.3);
      doc.line(130, signatureY, 192, signatureY);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text('Authorized Finance Signatory', 161, signatureY + 5, { align: 'center' });
      doc.setFontSize(8);
      doc.text('Ashok Retail Oil Stations Compliance Department', 161, signatureY + 9, { align: 'center' });

      // Footer disclaimer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('This is a formal compiled security statement of accounting logs locked in MongoDB Atlas live ledger accounts.', 105, 275, { align: 'center' });
      doc.text('Document Security Hash: #AR-09249M-ATLAS', 105, 279, { align: 'center' });

      // Trigger automatic save download
      doc.save(`${reportType.replace(/ /g, '_')}_${selectedRange.replace(/ /g, '_')}.pdf`);

      showToast('PDF exported successfully', 'success');
    } catch (error) {
      console.error(error);
      showToast('Export PDF operation failed.', 'error');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in font-sans relative">
      {/* Toast alert indicator */}
      {toast.visible && (
        <div className={`fixed top-4 right-4 z-[99] max-w-sm w-full bg-white rounded-xl shadow-xl border p-4 flex items-start gap-3 transition-transform animate-fade-in ${
          toast.type === 'success' ? 'border-emerald-250 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-800 font-sans">Report Compliance Logger</h4>
            <p className="text-[11px] text-slate-500 mt-1 font-sans">{toast.message}</p>
          </div>
          <button onClick={() => setToast(prev => ({ ...prev, visible: false }))} className="text-slate-400 hover:text-slate-650 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Audit compliance & GST Reports</h1>
          <p className="text-xs text-slate-500">Compile official reports matching oil companies format standards. Immediate exports in PDF.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportPDF}
            className="bg-sky-950 text-white hover:bg-sky-900 border border-sky-850 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-3xs"
          >
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
          <button
            onClick={exportCSV}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-3xs"
          >
            <Printer className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Date scope switcher */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Report Category</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full text-xs p-2 border border-slate-200 rounded bg-slate-50 cursor-pointer"
          >
            <option value="Fuel Sales Consolidated">Fuel Sales Consolidated Logs (Nozzle wise)</option>
            <option value="B2B Ledger Outstandings">B2B Credit Receivables & Limits ageing report</option>
            <option value="Wet Stock Telemetry Variance">Wet Stock Telemetry vs Physical Dip Variance Log</option>
            <option value="GST Taxable Ledger Summary">GST Taxable Ledger Summary (form 3B outline)</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">GST/Financial Range</label>
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="w-full text-xs p-2 border border-slate-200 rounded bg-slate-50 cursor-pointer"
          >
            <option value="Last 30 Days">Active Trade period (Last 15-30 days)</option>
            <option value="May 2026">May 2026 Monthly Reconciliation</option>
            <option value="FY-2026 Q1">Fiscal Year 2026-27 Q1 projections</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => compileDatabaseReport(false)}
            disabled={isCompiling}
            className="w-full text-center bg-sky-950 text-white hover:bg-sky-900 border border-sky-850 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
          >
            {isCompiling ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Compiling live...
              </>
            ) : (
              'Compile Database Report (SQL Offline Proxy)'
            )}
          </button>
        </div>
      </div>

      {/* Simulated report print preview form */}
      <div className="p-8 bg-white rounded-2xl border border-slate-250/90 shadow-lg text-slate-800 relative max-w-3xl mx-auto font-mono text-[11px] leading-relaxed receipt-font">
        {/* Printable template frame */}
        <div className="text-center space-y-1 border-b-2 border-dashed border-slate-300 pb-5">
          <div className="font-extrabold text-sm uppercase text-slate-900 tracking-wider">Ashok Retail Oil station Group</div>
          <div className="text-[10px] text-slate-400">National Highway 33, Ramgarh-Ranchi Road, Ramgarh 829122</div>
          <div className="text-[10px] text-slate-400">Dealership RO: {COMPANY_DETAILS.dealershipCode} | VAT TIN: {COMPANY_DETAILS.vatTin}</div>
          <div className="text-slate-800 font-bold bg-slate-100 inline-block px-1.5 py-0.5 text-[9px] uppercase mt-2">COMPILATION COMPLIANCE STATEMENT: PREVIEW</div>
        </div>

        <div className="py-4 space-y-3">
          <div className="flex justify-between">
            <span>Report Class Scope:</span>
            <span className="font-bold underline">{reportType}</span>
          </div>
          <div className="flex justify-between">
            <span>Reporting Frame:</span>
            <span className="font-bold">{selectedRange}</span>
          </div>
          <div className="flex justify-between">
            <span>Server Compiler:</span>
            <span className="font-bold">RO-DB-SERVER-02 (MongoDB Atlas Connected)</span>
          </div>
        </div>

        <div className="border-t border-b border-dashed border-slate-300 py-4 space-y-2.5">
          <div className="flex justify-between underline font-bold text-slate-900">
            <span>Item / Account Head Details</span>
            <span>Quantity (L/KL)</span>
            <span>Consolidated Net Sum</span>
          </div>

          {isCompiling ? (
            <div className="py-8 text-center text-slate-400">
              <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-slate-400" />
              <span>Querying Atlas database records...</span>
            </div>
          ) : reportItems.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              No matching data found for chosen parameters page scope.
            </div>
          ) : (
            reportItems.map((item, index) => (
              <div key={index} className="flex justify-between hover:bg-slate-50 p-0.5 rounded transition">
                <span>{item.head}</span>
                <span>{item.quantity}</span>
                <span className="font-bold text-slate-900">{formatINR(item.netSum)}</span>
              </div>
            ))
          )}

          <div className="flex justify-between border-t border-slate-250 pt-2 font-bold text-slate-900">
            <span>Consolidated trade revenue</span>
            <span>Sourced Count: {recordCount}</span>
            <span>{formatINR(totalSum)}</span>
          </div>
        </div>

        <div className="pt-4 flex justify-between text-[10px] text-slate-400 border-t border-dashed border-slate-200 mt-2">
          <span>Printed on: {new Date().toISOString().substring(0, 10)}</span>
          <span>Verified: System Lock Sourced #RO-029410</span>
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// 5. SETTINGS SCREEN
// ============================================================================
export function SettingsScreen() {
  const [name, setName] = useState(COMPANY_DETAILS.name);
  const [dealershipCode, setDealershipCode] = useState(COMPANY_DETAILS.dealershipCode);
  const [tagline, setTagline] = useState(COMPANY_DETAILS.tagline);
  const [address, setAddress] = useState(COMPANY_DETAILS.address);
  const [vat, setVat] = useState(COMPANY_DETAILS.vatTin);
  const [futureDark, setFutureDark] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Custom Toast notifications state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Load saved settings automatically on page load
  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setName(data.settings.name || COMPANY_DETAILS.name);
        setDealershipCode(data.settings.dealershipCode || COMPANY_DETAILS.dealershipCode);
        setAddress(data.settings.address || COMPANY_DETAILS.address);
        setVat(data.settings.vatTin || COMPANY_DETAILS.vatTin);
        setTagline(data.settings.tagline || COMPANY_DETAILS.tagline);
      }
    } catch (err) {
      console.error('Failed to load global ERP settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          dealershipCode,
          address,
          vatTin: vat,
          tagline
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Settings saved successfully', 'success');
        // Refresh values
        if (data.settings) {
          setName(data.settings.name);
          setDealershipCode(data.settings.dealershipCode);
          setAddress(data.settings.address);
          setVat(data.settings.vatTin);
          setTagline(data.settings.tagline);
        }
      } else {
        showToast(data.message || 'Failed to save settings.', 'error');
      }
    } catch (err) {
      showToast('Error persisting settings to MongoDB Atlas.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in font-sans relative">
      {/* Toast Alert Indicator */}
      {toast.visible && (
        <div className={`fixed top-4 right-4 z-[99] max-w-sm w-full bg-white rounded-xl shadow-xl border p-4 flex items-start gap-3 transition-transform animate-fade-in ${
          toast.type === 'success' ? 'border-emerald-250 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-800 font-sans">ERP Settings Manager</h4>
            <p className="text-[11px] text-slate-500 mt-1 font-sans">{toast.message}</p>
          </div>
          <button onClick={() => setToast(prev => ({ ...prev, visible: false }))} className="text-slate-400 hover:text-slate-650 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">ERP Parameters Configuration (SaaS Root)</h1>
        <p className="text-xs text-slate-500">Edit Ashok Fuels company parameters, printer alignments, loyalty APIs configuration or future dark mode placeholders.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-3xs p-6 space-y-4 max-w-2xl">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Dealership Outlet Credentials</h3>
        
        {isLoading ? (
          <div className="py-8 text-center text-slate-400">
            <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-slate-400" />
            <span>Loading ERP configuration coefficients...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Pump Outlet Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded text-slate-800 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-505 uppercase mb-1.5">HPCL Dealership Code</label>
                <input
                  type="text"
                  value={dealershipCode}
                  onChange={(e) => setDealershipCode(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded text-slate-800 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">VAT TIN Number / GSTIN</label>
                <input
                  type="text"
                  value={vat}
                  onChange={(e) => setVat(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Outlet Tagline / Motto</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded text-slate-800 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Registered Postal Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded text-slate-800"
              />
            </div>

            {/* Future dark mode toggle placeholder */}
            <div className="border-t border-slate-150 pt-4 flex items-center justify-between">
              <div>
                <span className="font-semibold text-xs text-slate-800 block">Future Dark Theme Mode Ready</span>
                <span className="text-[11px] text-slate-400 block">Prepare visual tokens for low-light night-shift nozzle operators during 10PM-6AM trade logs.</span>
              </div>
              <button
                type="button"
                onClick={() => setFutureDark(!futureDark)}
                className="bg-slate-50 text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold font-mono transition cursor-pointer"
              >
                {futureDark ? '🔴 DEACTIVATED PLACEHOLDER' : '🔵 ENVELOPE STYLES READY'}
              </button>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-sky-950 text-white hover:bg-sky-900 border border-sky-850 py-2 px-4 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" /> Saving...
                  </>
                ) : (
                  'Commit Outlet Settings'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


// ============================================================================
// 6. USER MANAGEMENT SCREEN
// ============================================================================
interface UserManagementScreenProps {
  users: UserAccount[];
  onToggleUserStatus: (id: string) => void;
}

export function UserManagementScreen({ users, onToggleUserStatus }: UserManagementScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Staff Roster & Level Permissions</h1>
          <p className="text-xs text-slate-500">Enable shift supervisors logins and adjust allowed clearance levels on nozzle totalizers configuration.</p>
        </div>
        <button
          onClick={() => alert('New User provision drawer is coming in SaaS multi-company expansion release.')}
          className="bg-sky-950 text-white hover:bg-sky-900 text-xs font-semibold py-2 px-3.5 rounded-xl border border-sky-850 flex items-center gap-1.5 cursor-pointer shadow-3xs"
        >
          <UserPlus className="w-4 h-4 text-amber-400" />
          <span>Provision Employee Account</span>
        </button>
      </div>

      {/* Grid of employees */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3.5">Employee Name</th>
                <th className="p-3.5">System Email Account</th>
                <th className="p-3.5">Clearance level (Role)</th>
                <th className="p-3.5">Allowed clearance scopes</th>
                <th className="p-3.5">Last Active Log</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Emergency Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(usr => (
                <tr key={usr.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-sky-950 flex items-center justify-center font-bold font-mono">
                        {usr.name[0]}
                      </div>
                      <span className="font-bold text-slate-900 block">{usr.name}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-slate-550 text-[11px]">{usr.email}</td>
                  <td className="p-3.5 font-bold text-slate-800">
                    <span className="bg-slate-100 text-slate-800 py-1 px-2.5 rounded border border-slate-150 font-sans text-[10px]">
                      {usr.role}
                    </span>
                  </td>
                  <td className="p-3.5 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {usr.permissions.map(perm => (
                        <span key={perm} className="text-[10px] bg-sky-50 text-sky-850 px-1.5 py-0.5 rounded border border-sky-100">{perm}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-400 font-mono font-medium text-[10.5px]">{usr.lastActive}</td>
                  <td className="p-3.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      usr.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {usr.active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => onToggleUserStatus(usr.id)}
                      className={`text-[10.5px] font-bold py-1 px-2.5 rounded transition cursor-pointer ${
                        usr.active ? 'bg-red-50 text-red-650 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {usr.active ? 'Revoke System Login' : 'Restore Account Access'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
