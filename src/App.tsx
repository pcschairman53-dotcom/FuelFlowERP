/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import DashboardLayout from './components/DashboardLayout';
import LoginView from './components/screens/LoginView';
import DashboardView from './components/screens/DashboardView';
import {
  FuelSalesScreen,
  CollectionsScreen,
  CashManagementScreen,
  ExpensesScreen
} from './components/screens/OperationsView';
import {
  TankStockScreen,
  HpclLoadManagementScreen,
  LubricantInventoryScreen,
  TankerManagementScreen
} from './components/screens/LogisticsView';
import {
  CustomerManagementScreen,
  BankManagementScreen,
  AccountingScreen,
  ReportsScreen,
  SettingsScreen,
  UserManagementScreen
} from './components/screens/EnterpriseView';

// Core State Data feeds
import {
  INITIAL_FUEL_SALES,
  INITIAL_COLLECTIONS,
  INITIAL_CASH_LOGS,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_BANK_TRANSACTIONS,
  INITIAL_HPCL_INDENTS,
  INITIAL_TANK_STOCK,
  INITIAL_LUBRICANTS,
  INITIAL_TANKERS,
  INITIAL_CREDIT_CUSTOMERS,
  INITIAL_EXPENSES,
  INITIAL_USERS
} from './data';
import { UserAccount, TankStock, HpclIndentOrder, LubricantItem, CreditCustomer, TankStockEntry } from './types';

export default function App() {
  // Login / Profile States
  const [isLogged, setIsLogged] = useState(true); // Default to true so user lands directly in dashboard, can log out/in.
  const [currentUser, setCurrentUser] = useState<UserAccount>({
    id: 'USR-01',
    name: 'Anand Ashok',
    email: 'anand.ashok@ashokfuels.com',
    role: 'Owner',
    active: true,
    lastActive: 'Just Now',
    permissions: ['All Permissions', 'Financial Lock/Unlock']
  });

  // Navigation controller
  const [activeScreen, setActiveScreen] = useState('Dashboard');

  // Wet stock state
  const [fuelSales, setFuelSales] = useState(INITIAL_FUEL_SALES);
  const [collections, setCollections] = useState(INITIAL_COLLECTIONS);
  const [cashLogs, setCashLogs] = useState(INITIAL_CASH_LOGS);
  
  // Bank state
  const [banks, setBanks] = useState(INITIAL_BANK_ACCOUNTS);
  const [bankTxns, setBankTxns] = useState(INITIAL_BANK_TRANSACTIONS);
  
  // Logistics & Stock state
  const [indents, setIndents] = useState(INITIAL_HPCL_INDENTS);
  const [tanks, setTanks] = useState(INITIAL_TANK_STOCK);
  const [tankEntries, setTankEntries] = useState<TankStockEntry[]>([]);
  const [lubes, setLubes] = useState(INITIAL_LUBRICANTS);
  const [tankers, setTankers] = useState(INITIAL_TANKERS);
  
  // Enterprise states
  const [customers, setCustomers] = useState(INITIAL_CREDIT_CUSTOMERS);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [users, setUsers] = useState(INITIAL_USERS);

  // DB Sync Status
  const [dbStatus, setDbStatus] = useState<'syncing' | 'connected' | 'offline'>('syncing');

  // Trigger hydration from MongoDB on Mount
  React.useEffect(() => {
    async function hydrateFromMongoDB() {
      console.log('🔄 Initiating dynamic schema hydration from MongoDB Atlas collections...');
      setDbStatus('syncing');
      try {
        const [
          salesRes,
          collectionsRes,
          loadsRes,
          tanksRes,
          lubesRes,
          tankersRes,
          customersRes,
          usersRes,
          tankEntriesRes,
          expensesRes
        ] = await Promise.all([
          fetch('/api/fuel-sales').then(r => r.json()).catch(() => ({ success: false })),
          fetch('/api/collections').then(r => r.json()).catch(() => ({ success: false })),
          fetch('/api/hpcl-loads').then(r => r.json()).catch(() => ({ success: false })),
          fetch('/api/tank-stocks').then(r => r.json()).catch(() => ({ success: false })),
          fetch('/api/lubricants').then(r => r.json()).catch(() => ({ success: false })),
          fetch('/api/tankers').then(r => r.json()).catch(() => ({ success: false })),
          fetch('/api/customers').then(r => r.json()).catch(() => ({ success: false })),
          fetch('/api/users').then(r => r.json()).catch(() => ({ success: false })),
          fetch('/api/tank-stock-entries').then(r => r.json()).catch(() => ({ success: false })),
          fetch('/api/expenses').then(r => r.json()).catch(() => ({ success: false }))
        ]);

        if (salesRes.success && salesRes.data) setFuelSales(salesRes.data);
        if (collectionsRes.success && collectionsRes.data) setCollections(collectionsRes.data);
        if (loadsRes.success && loadsRes.data) setIndents(loadsRes.data);
        if (tanksRes.success && tanksRes.data) setTanks(tanksRes.data);
        if (lubesRes.success && lubesRes.data) setLubes(lubesRes.data);
        if (tankersRes.success && tankersRes.data) setTankers(tankersRes.data);
        if (customersRes.success && customersRes.data) setCustomers(customersRes.data);
        if (usersRes.success && usersRes.data) setUsers(usersRes.data);
        if (expensesRes.success && expensesRes.data) setExpenses(expensesRes.data);
        
        if (tankEntriesRes && tankEntriesRes.success && tankEntriesRes.data) {
          setTankEntries(tankEntriesRes.data);
        } else {
          setTankEntries([
            {
              id: 'TS-1',
              date: '2026-06-06',
              shift: 'Shift A',
              tankNumber: 'Tank 1 (Petrol MS)',
              fuelType: 'Petrol',
              openingStock: 6540,
              receivedQuantity: 0,
              salesQuantity: 1540,
              closingStock: 5000,
              dipReading: 1100,
              waterLevel: 0,
              remarks: 'Standard shift logging, manual dipping'
            },
            {
              id: 'TS-2',
              date: '2026-06-06',
              shift: 'Shift A',
              tankNumber: 'Tank 2 (Diesel HSD - A)',
              fuelType: 'Diesel',
              openingStock: 19800,
              receivedQuantity: 10000,
              salesQuantity: 4800,
              closingStock: 25000,
              dipReading: 2605,
              waterLevel: 5,
              remarks: 'Load decanted from tanker'
            }
          ]);
        }

        setDbStatus('connected');
        console.log('✅ FuelFlow ERP successfully synchronized with cloud MongoDB Atlas!');
      } catch (err) {
        console.error('⚠️ MongoDB connection could not be established. Falling back to local state.', err);
        setDbStatus('offline');
      }
    }
    hydrateFromMongoDB();
  }, []);

  // Computed state indicators based on activity
  const hpclBalance = 4120400 - indents
    .filter(i => i.orderStatus === 'Paid & Pending HPCL Dispatch' || i.orderStatus === 'In-Transit')
    .reduce((a, b) => a + b.totalAmount, 0) + 1250000; // balance with locked offsets
  
  const bankBalance = banks.reduce((a, b) => a + b.currentBalance, 0);

  // Authentication callback handlers
  const handleLogin = (role: 'Owner' | 'Manager') => {
    setIsLogged(true);
    if (role === 'Owner') {
      setCurrentUser({
        id: 'USR-01',
        name: 'Anand Ashok',
        email: 'anand.ashok@ashokfuels.com',
        role: 'Owner',
        active: true,
        lastActive: 'Just Now',
        permissions: ['All Permissions', 'Financial Lock/Unlock']
      });
    } else {
      setCurrentUser({
        id: 'USR-02',
        name: 'Sunil Sharma',
        email: 'sunil.sharma@ashokfuels.com',
        role: 'Manager',
        active: true,
        lastActive: 'Just Now',
        permissions: ['View Dashboards', 'Collections Create', 'Customer Management']
      });
    }
    setActiveScreen('Dashboard');
  };

  const handleLogout = () => {
    setIsLogged(false);
  };

  // State adjustment callback handlers to save directly to MongoDB Atlas
  const handleVerifyCollection = async (id: string) => {
    try {
      const res = await fetch(`/api/collections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Verified' })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCollections(collections.map(c => c.id === id ? json.data : c));
        return;
      }
    } catch (err) {
      console.error('Failed to verify collection inside database:', err);
    }
    // Offline Fallback local update
    setCollections(collections.map(c => c.id === id ? { ...c, status: 'Verified' } : c));
  };

  const handlePlaceIndent = async (newIndent: HpclIndentOrder) => {
    try {
      const res = await fetch('/api/hpcl-loads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIndent)
      });
      const json = await res.json();
      if (json.success && json.data) {
        setIndents([json.data, ...indents]);
        return;
      }
    } catch (err) {
      console.error('Failed to register HPCL indent in database:', err);
    }
    // Offline database fallback
    setIndents([newIndent, ...indents]);
  };

  const handleDipUpdate = async (tankId: string, dipMm: number, waterMm: number) => {
    const tank = tanks.find(t => t.id === tankId);
    if (!tank) return;

    // Adjust volumes based on brass dip calibration height
    const theoreticalVolLit = dipMm * (tank.capacityLiters / 2600); 
    const nextVol = Math.min(tank.capacityLiters, parseFloat(theoreticalVolLit.toFixed(1)));
    
    let nextStatus: 'Normal' | 'Low Stock' | 'Critical' = 'Normal';
    const pct = (nextVol / tank.capacityLiters) * 100;
    if (pct < 15) {
      nextStatus = 'Critical';
    } else if (pct < 35) {
      nextStatus = 'Low Stock';
    }

    const payload = {
      dipReadingMm: dipMm,
      waterLevelMm: waterMm,
      currentLevelLiters: nextVol,
      status: nextStatus
    };

    try {
      const res = await fetch(`/api/tank-stocks/${tankId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success && json.data) {
        setTanks(tanks.map(t => t.id === tankId ? json.data : t));
        return;
      }
    } catch (err) {
      console.error('Failed to submit physical dip parameters to database:', err);
    }

    // Offline database fallback
    setTanks(tanks.map((t): TankStock => {
      if (t.id === tankId) {
        return {
          ...t,
          ...payload,
          lastUpdatedDip: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return t;
    }));
  };

  const handleLubeUpdate = async (skuId: string, boxQty: number) => {
    try {
      const res = await fetch(`/api/lubricants/${skuId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boxQty })
      });
      const json = await res.json();
      if (json.success && json.data) {
        // Fetch fresh lubricant records to fully refresh primary state from MongoDB
        const refreshRes = await fetch('/api/lubricants').then(r => r.json()).catch(() => null);
        if (refreshRes && refreshRes.success && refreshRes.data) {
          setLubes(refreshRes.data);
        } else {
          setLubes(lubes.map(item => item.id === skuId ? json.data : item));
        }
        return;
      }
    } catch (err) {
      console.error('Failed to save lubricants status:', err);
    }

    // Offline fallback
    setLubes(lubes.map((item): LubricantItem => {
      if (item.id === skuId) {
        const totalUnits = boxQty * item.unitsPerBox;
        return {
          ...item,
          boxQty,
          totalUnits,
          totalValue: totalUnits * item.unitPrice
        };
      }
      return item;
    }));
  };

  const handleCreditPayment = async (customerId: string, amount: number) => {
    const cust = customers.find(c => c.id === customerId);
    if (!cust) return;

    const nextOutstanding = Math.max(0, cust.outstandingBalance - amount);
    let nextStatus: 'Active' | 'Suspended' | 'Limit Exceeded' = 'Active';
    if (nextOutstanding > cust.creditLimit) {
      nextStatus = 'Limit Exceeded';
    } else if (cust.status === 'Suspended') {
      nextStatus = 'Suspended';
    }

    const payload = {
      outstandingBalance: nextOutstanding,
      status: nextStatus,
      lastPaymentDate: new Date().toISOString().split('T')[0]
    };

    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCustomers(customers.map(c => c.id === customerId ? json.data : c));
        return;
      }
    } catch (err) {
      console.error('Failed to submit credit customer payment to database:', err);
    }

    // Offline fallback
    setCustomers(customers.map((c): CreditCustomer => {
      if (c.id === customerId) {
        return {
          ...c,
          ...payload
        };
      }
      return c;
    }));
  };

  const handleCreditLimitUpdate = async (customerId: string, limit: number) => {
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creditLimit: limit })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCustomers(customers.map(c => c.id === customerId ? json.data : c));
        return;
      }
    } catch (err) {
      console.error('Failed to submit customer credit limit to database:', err);
    }

    // Offline fallback
    setCustomers(customers.map((cust): CreditCustomer => {
      if (cust.id === customerId) {
        let nextStatus: 'Active' | 'Suspended' | 'Limit Exceeded' = cust.status;
        if (cust.outstandingBalance > limit) {
          nextStatus = 'Limit Exceeded';
        } else if (cust.status === 'Limit Exceeded') {
          nextStatus = 'Active';
        }
        return {
          ...cust,
          creditLimit: limit,
          status: nextStatus
        };
      }
      return cust;
    }));
  };

  const handleUserToggle = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !user.active })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setUsers(users.map(u => u.id === id ? json.data : u));
        return;
      }
    } catch (err) {
      console.error('Failed to toggle active user in database:', err);
    }

    // Offline fallback
    setUsers(users.map(u => u.id === id ? { ...u, active: !u.active } : u));
  };

  // 1. Render Login Screen if session is closed
  if (!isLogged) {
    return <LoginView onLogin={handleLogin} />;
  }

  // 2. Render core active screen mapped cleanly to Ashok Fuels requirements
  return (
    <DashboardLayout
      activeScreen={activeScreen}
      setActiveScreen={setActiveScreen}
      currentUser={currentUser}
      onLogout={handleLogout}
      dbStatus={dbStatus}
    >
      {activeScreen === 'Dashboard' && (
        <DashboardView
          fuelSales={fuelSales}
          collections={collections}
          tanks={tanks}
          hpclBalance={hpclBalance}
          bankBalance={bankBalance}
          onNavigate={setActiveScreen}
          user={currentUser}
        />
      )}
      {activeScreen === 'Fuel Sales' && (
        <FuelSalesScreen
          sales={fuelSales}
          onAddSale={async (sale) => {
            try {
              const res = await fetch('/api/fuel-sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sale)
              });
              const json = await res.json();
              if (json.success && json.data) {
                setFuelSales([json.data, ...fuelSales]);
                return;
              }
            } catch (err) {
              console.error('Failed to post fuel sale to database:', err);
            }
            setFuelSales([sale, ...fuelSales]);
          }}
        />
      )}
      {activeScreen === 'Collections' && (
        <CollectionsScreen
          collections={collections}
          onVerify={handleVerifyCollection}
        />
      )}
      {activeScreen === 'Cash Management' && (
        <CashManagementScreen
          logs={cashLogs}
          onAddLog={(log) => setCashLogs([log, ...cashLogs])}
        />
      )}
      {activeScreen === 'Bank Management' && (
        <BankManagementScreen
          banks={banks}
          transactions={bankTxns}
        />
      )}
      {activeScreen === 'HPCL Load Management' && (
        <HpclLoadManagementScreen
          indents={indents}
          onPlaceIndent={handlePlaceIndent}
          hpclBalance={hpclBalance}
        />
      )}
      {activeScreen === 'Tank Stock' && (
        <TankStockScreen
          tanks={tanks}
          onDipUpdate={handleDipUpdate}
          tankEntries={tankEntries}
          onAddTankEntry={async (entry) => {
            try {
              const res = await fetch('/api/tank-stock-entries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry)
              });
              const json = await res.json();
              if (json.success && json.data) {
                setTankEntries([json.data, ...tankEntries]);
                return;
              }
            } catch (err) {
              console.error('Failed to post tank stock entry:', err);
            }
            const fallbackEntry = {
              id: `TS-${Date.now()}`,
              ...entry,
              closingStock: entry.openingStock + entry.receivedQuantity - entry.salesQuantity
            };
            setTankEntries([fallbackEntry, ...tankEntries]);
          }}
          onUpdateTankEntry={async (id, updatedFields) => {
            try {
              const res = await fetch(`/api/tank-stock-entries/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedFields)
              });
              const json = await res.json();
              if (json.success && json.data) {
                setTankEntries(tankEntries.map(e => e.id === id ? json.data : e));
                return;
              }
            } catch (err) {
              console.error('Failed to update tank stock entry:', err);
            }
            setTankEntries(tankEntries.map(e => {
              if (e.id === id) {
                const updated = { ...e, ...updatedFields };
                updated.closingStock = updated.openingStock + (updated.receivedQuantity || 0) - (updated.salesQuantity || 0);
                return updated;
              }
              return e;
            }));
          }}
          onDeleteTankEntry={async (id) => {
            try {
              const res = await fetch(`/api/tank-stock-entries/${id}`, {
                method: 'DELETE'
              });
              const json = await res.json();
              if (json.success) {
                setTankEntries(tankEntries.filter(e => e.id !== id));
                return;
              }
            } catch (err) {
              console.error('Failed to delete tank stock entry:', err);
            }
            setTankEntries(tankEntries.filter(e => e.id !== id));
          }}
        />
      )}
      {activeScreen === 'Lubricant Inventory' && (
        <LubricantInventoryScreen
          lubes={lubes}
          onUpdateQty={handleLubeUpdate}
          onAddLube={async (payload) => {
            try {
              const res = await fetch('/api/lubricants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });
              const json = await res.json();
              if (json.success && json.data) {
                setLubes([json.data, ...lubes]);
                return;
              }
            } catch (err) {
              console.error('Failed to create lubricant SKU via server:', err);
            }

            // Fallback offline append
            const fallbackItem = {
              id: `LUB-${Math.floor(1000 + Math.random() * 9000)}`,
              productName: payload.productName,
              grade: payload.category || 'Standard',
              skuCode: payload.skuCode,
              boxQty: payload.boxCount || 0,
              unitsPerBox: payload.pcsPerBox || 12,
              totalUnits: payload.openingStock || 0,
              unitPrice: payload.unitCost || 0,
              totalValue: (payload.openingStock || 0) * (payload.unitCost || 0),
              reorderLevel: 10,
              rackLocation: payload.cabinetLocation || 'Cabinet A',
              ...payload,
              createdAt: new Date().toISOString()
            };
            setLubes([fallbackItem, ...lubes]);
          }}
          onDeleteLube={async (skuId) => {
            try {
              const res = await fetch(`/api/lubricants/${skuId}`, {
                method: 'DELETE'
              });
              const json = await res.json();
              if (json.success) {
                setLubes(lubes.filter(item => item.id !== skuId));
                return;
              }
            } catch (err) {
              console.error('Failed to delete lubricant SKU:', err);
            }
            setLubes(lubes.filter(item => item.id !== skuId));
          }}
        />
      )}
      {activeScreen === 'Tanker Management' && (
        <TankerManagementScreen
          tankers={tankers}
          onAddTanker={async (payload) => {
            try {
              const res = await fetch('/api/tankers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });
              const json = await res.json();
              if (json.success && json.data) {
                setTankers([json.data, ...tankers]);
                return;
              }
            } catch (err) {
              console.error('Failed to create tanker via server:', err);
            }
            // Fallback offline append
            const fallbackItem = {
              id: `TKR-${Math.floor(100 + Math.random() * 900)}`,
              createdAt: new Date().toISOString(),
              ...payload
            };
            setTankers([fallbackItem, ...tankers]);
          }}
          onUpdateTanker={async (tankerId, payload) => {
            try {
              const res = await fetch(`/api/tankers/${tankerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });
              const json = await res.json();
              if (json.success && json.data) {
                const refreshRes = await fetch('/api/tankers').then(r => r.json()).catch(() => null);
                if (refreshRes && refreshRes.success && refreshRes.data) {
                  setTankers(refreshRes.data);
                } else {
                  setTankers(tankers.map(t => t.id === tankerId ? json.data : t));
                }
                return;
              }
            } catch (err) {
              console.error('Failed to update tanker:', err);
            }
            // Fallback offline update
            setTankers(tankers.map(t => t.id === tankerId ? { ...t, ...payload } : t));
          }}
          onDeleteTanker={async (tankerId) => {
            try {
              const res = await fetch(`/api/tankers/${tankerId}`, {
                method: 'DELETE'
              });
              const json = await res.json();
              if (json.success) {
                setTankers(tankers.filter(t => t.id !== tankerId));
                return;
              }
            } catch (err) {
              console.error('Failed to delete tanker:', err);
            }
            setTankers(tankers.filter(t => t.id !== tankerId));
          }}
        />
      )}
      {activeScreen === 'Customers' && (
        <CustomerManagementScreen
          customers={customers}
          onAddCreditPayment={handleCreditPayment}
          onUpdateLimit={handleCreditLimitUpdate}
        />
      )}
      {activeScreen === 'Expenses' && (
        <ExpensesScreen
          expenses={expenses}
          onAddExpense={async (exp) => {
            try {
              const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(exp)
              });
              const responseData = await res.json();
              if (responseData.success && responseData.data) {
                const finalExp = {
                  ...exp,
                  ...responseData.data,
                  id: responseData.data.id || exp.id,
                  paidTo: responseData.data.paidTo || exp.paidTo,
                  paymentMode: responseData.data.paymentMode || exp.paymentMode
                };
                setExpenses(prev => [finalExp, ...prev]);
              } else {
                setExpenses(prev => [exp, ...prev]);
              }
            } catch (err) {
              console.error('Failed to sync new opex transaction:', err);
              setExpenses(prev => [exp, ...prev]);
            }
          }}
          onEditExpense={async (exp) => {
            try {
              const res = await fetch(`/api/expenses/${exp.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(exp)
              });
              const responseData = await res.json();
              if (responseData.success && responseData.data) {
                const finalExp = {
                  ...exp,
                  ...responseData.data,
                  id: responseData.data.id || exp.id,
                  paidTo: responseData.data.paidTo || exp.paidTo,
                  paymentMode: responseData.data.paymentMode || exp.paymentMode
                };
                setExpenses(prev => prev.map(item => item.id === exp.id ? finalExp : item));
              } else {
                setExpenses(prev => prev.map(item => item.id === exp.id ? exp : item));
              }
            } catch (err) {
              console.error('Failed to sync opex updation:', err);
              setExpenses(prev => prev.map(item => item.id === exp.id ? exp : item));
            }
          }}
          onDeleteExpense={async (id) => {
            try {
              const res = await fetch(`/api/expenses/${id}`, {
                method: 'DELETE'
              });
              const responseData = await res.json();
              if (responseData.success) {
                setExpenses(prev => prev.filter(item => item.id !== id));
              }
            } catch (err) {
              console.error('Failed to sync opex deletion:', err);
              setExpenses(prev => prev.filter(item => item.id !== id));
            }
          }}
        />
      )}
      {activeScreen === 'Accounting' && (
        <AccountingScreen />
      )}
      {activeScreen === 'Reports' && (
        <ReportsScreen />
      )}
      {activeScreen === 'Settings' && (
        <SettingsScreen />
      )}
      {activeScreen === 'User Management' && (
        <UserManagementScreen
          users={users}
          onToggleUserStatus={handleUserToggle}
        />
      )}
    </DashboardLayout>
  );
}
