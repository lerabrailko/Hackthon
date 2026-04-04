import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('logitech_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (username, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let userData = null;

        if (username === 'admin') {
          userData = { name: 'System Admin', role: 'ADMIN', token: '111' };
        } else if (username === 'disp') {
          userData = { name: 'Valeriia', role: 'DISPATCHER', token: '222' };
        } else if (username === 'client') {
          userData = { name: 'Kyiv Hospital #3', role: 'CUSTOMER', token: '333' };
        } else if (username === 'driver') {
          userData = { name: 'Taras (Truck AI-1020)', role: 'DRIVER', token: '444' };
        }

        if (userData && password === '123') {
          setUser(userData);
          localStorage.setItem('logitech_user', JSON.stringify(userData));
          resolve(userData);
        } else {
          reject(new Error('Try: admin/123, disp/123, client/123, driver/123'));
        }
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('logitech_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);