import React, { createContext, useState, useContext } from 'react';
import { MOCK_REQUESTS } from '../data/mockData';

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [requests, setRequests] = useState(MOCK_REQUESTS);

  const addRequest = (newRequest) => {
    setRequests(prev => [newRequest, ...prev]);
  };

  const updateStatus = (id, status) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status } : req
    ));
  };

  return (
    <GlobalContext.Provider value={{ requests, addRequest, updateStatus }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error('useGlobalContext must be used within GlobalProvider');
  return context;
};