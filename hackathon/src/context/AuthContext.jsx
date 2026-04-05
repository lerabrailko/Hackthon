import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [mockPassword, setMockPassword] = useState('123');

  useEffect(() => {
    const savedUser = localStorage.getItem('DispatchX_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
      }
    }
  }, []);

  const login = async (username, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let userData = null;

        const defaultSettings = {
          notifications: { email: true, sms: false, push: false },
          security: { twoFactor: false }
        };

        if (username === 'admin') {
          userData = { name: 'System Admin', role: 'ADMIN', token: '111', email: 'admin@dispatchx.com', phone: '+380501234567', avatar: null, ...defaultSettings };
        } else if (username === 'disp') {
          userData = { name: 'Valeriia', role: 'DISPATCHER', token: '222', email: 'valeriia@dispatchx.com', phone: '+380671234567', avatar: null, ...defaultSettings };
        } else if (username === 'client') {
          userData = { name: 'Kyiv Hospital #3', role: 'CUSTOMER', token: '333', email: 'hospital3@kyiv.med', phone: '+380441234567', avatar: null, ...defaultSettings };
        } else if (username === 'driver') {
          userData = { name: 'Taras (Truck AI-1020)', role: 'DRIVER', token: '444', email: 'taras@dispatchx.com', phone: '+380931234567', avatar: null, ...defaultSettings };
        }

        if (userData && password === mockPassword) { 
          setUser(userData);
          localStorage.setItem('DispatchX_user', JSON.stringify(userData));
          resolve(userData);
        } else {
          reject(new Error('Invalid credentials. Try standard mock logins.'));
        }
      }, 800);
    });
  };

  const register = async (username, password, role) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const newUser = {
          name: username,
          role: role,
          token: `token_${Math.floor(Math.random() * 1000)}`,
          email: `${username}@example.com`,
          phone: '',
          avatar: null,
          notifications: { email: true, sms: false, push: false },
          security: { twoFactor: false }
        };

        setMockPassword(password);
        setUser(newUser);
        localStorage.setItem('DispatchX_user', JSON.stringify(newUser));
        resolve(newUser);
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('DispatchX_user');
  };

  const updateProfile = (updates) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('DispatchX_user', JSON.stringify(updatedUser));
  };

  const changePassword = async (currentPass, newPass) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (currentPass !== mockPassword) {
          reject(new Error('Incorrect current password')); 
        } else {
          setMockPassword(newPass); 
          resolve(true);
        }
      }, 600);
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};