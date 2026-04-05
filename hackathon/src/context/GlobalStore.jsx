import React, { createContext, useState, useContext } from 'react';
import { MOCK_REQUESTS } from '../data/mockData';

const INITIAL_INVENTORY = [
  { sku: 'MED-001', name: 'First Aid Kits (Standard)', category: 'Medicine', warehouse: 'Lviv West Hub', qty: 12500, maxQty: 15000, status: 'IN_STOCK', daysLeft: 45 },
  { sku: 'MED-042', name: 'Broad-Spectrum Antibiotics', category: 'Medicine', warehouse: 'Kyiv Central', qty: 450, maxQty: 5000, status: 'LOW_STOCK', daysLeft: 3 },
  { sku: 'FOD-991', name: 'MRE Rations (Pallets)', category: 'Food', warehouse: 'Odesa Port', qty: 45000, maxQty: 50000, status: 'IN_STOCK', daysLeft: 120 },
  { sku: 'WAT-100', name: 'Clean Drinking Water (1L)', category: 'Water', warehouse: 'Dnipro Hub', qty: 0, maxQty: 20000, status: 'OUT_OF_STOCK', daysLeft: 0 },
  { sku: 'EQP-005', name: 'Power Generators 5kW', category: 'Equipment', warehouse: 'Lviv West Hub', qty: 12, maxQty: 50, status: 'LOW_STOCK', daysLeft: 5 },
  { sku: 'FUL-022', name: 'Diesel Fuel (Liters)', category: 'Fuel', warehouse: 'Kyiv Central', qty: 8500, maxQty: 10000, status: 'IN_STOCK', daysLeft: 14 },
  { sku: 'MED-112', name: 'Surgical Instruments Kit', category: 'Medicine', warehouse: 'Kharkiv Hub', qty: 120, maxQty: 200, status: 'IN_STOCK', daysLeft: 30 },
  { sku: 'FOD-305', name: 'Canned Goods (Mixed)', category: 'Food', warehouse: 'Dnipro Hub', qty: 850, maxQty: 5000, status: 'LOW_STOCK', daysLeft: 4 },
];

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  // Новий алгоритм
  const [requests, setRequests] = useState(() => 
    MOCK_REQUESTS.map(req => ({
      ...req,
      burnRate: req.burnRate !== undefined ? req.burnRate : Math.floor(Math.random() * 8) + 1, // 1-8 од/год
      hasDeferred: req.hasDeferred !== undefined ? req.hasDeferred : Math.random() > 0.85 // 15% шанс
    }))
  );
  
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);

  const addRequest = (newRequest) => setRequests(prev => [newRequest, ...prev]);

  const updateRequestStatus = (id, newStatus) => {
    setRequests(prevRequests => prevRequests.map(req =>
      req.id === id ? { ...req, status: newStatus, currentStock: newStatus === 'DELIVERED' ? 100 : req.currentStock } : req
    ));
  };

  const updateInventoryQty = (sku, newQty) => {
    setInventory(prev => prev.map(item => {
      if (item.sku === sku) {
        const qty = Number(newQty);
        let status = 'IN_STOCK';
        if (qty === 0) status = 'OUT_OF_STOCK';
        else if (qty < item.maxQty * 0.2) status = 'LOW_STOCK';
        return { ...item, qty, status };
      }
      return item;
    }));
  };

  const addInventoryItem = (newItem) => {
    setInventory(prev => [newItem, ...prev]);
  };

  return (
    <GlobalContext.Provider value={{
      requests, addRequest, updateRequestStatus,
      inventory, updateInventoryQty, addInventoryItem
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);