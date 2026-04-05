import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('logitech_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse user data", error);
      }
    }
    
    if (!localStorage.getItem('mock_passwords')) {
      localStorage.setItem('mock_passwords', JSON.stringify({
        admin: '123', disp: '123', client: '123', driver: '123'
      }));
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
          userData = { username: 'admin', name: 'System Admin', role: 'ADMIN', token: '111', email: 'admin@dispatch.x', phone: '+380501234567', avatar: null, ...defaultSettings };
        } else if (username === 'disp') {
          userData = { username: 'disp', name: 'Valeriia', role: 'DISPATCHER', token: '222', email: 'valeriia@dispatch.x', phone: '+380671234567', avatar: null, ...defaultSettings };
        } else if (username === 'client') {
          userData = { username: 'client', name: 'Kyiv Hospital #3', role: 'CUSTOMER', token: '333', email: 'hospital3@kyiv.med', phone: '+380441234567', avatar: null, ...defaultSettings };
        } else if (username === 'driver') {
          userData = { username: 'driver', name: 'Taras (Truck AI-1020)', role: 'DRIVER', token: '444', email: 'taras@dispatch.x', phone: '+380931234567', avatar: null, ...defaultSettings };
        }

        const passwordsDb = JSON.parse(localStorage.getItem('mock_passwords') || '{}');
        const correctPassword = passwordsDb[username];

        if (userData && correctPassword && password === correctPassword) { 
          setUser(userData);
          localStorage.setItem('logitech_user', JSON.stringify(userData));
          resolve(userData);
        } else {
          if (!userData && passwordsDb[username] && password === passwordsDb[username]) {
             const restoredUser = { username, name: username, role: 'CUSTOMER', token: '555', ...defaultSettings };
             setUser(restoredUser);
             localStorage.setItem('logitech_user', JSON.stringify(restoredUser));
             resolve(restoredUser);
          } else {
            reject(new Error('Invalid credentials.'));
          }
        }
      }, 800);
    });
  };

  const register = async (username, password, role) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const passwordsDb = JSON.parse(localStorage.getItem('mock_passwords') || '{}');
        if (passwordsDb[username]) {
          reject(new Error('User already exists!'));
          return;
        }

        const newUser = {
          username: username,
          name: username,
          role: role,
          token: `token_${Math.floor(Math.random() * 1000)}`,
          email: `${username}@example.com`,
          phone: '',
          avatar: null,
          notifications: { email: true, sms: false, push: false },
          security: { twoFactor: false }
        };

        passwordsDb[username] = password;
        localStorage.setItem('mock_passwords', JSON.stringify(passwordsDb));
        
        setUser(newUser);
        localStorage.setItem('logitech_user', JSON.stringify(newUser));
        resolve(newUser);
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('logitech_user');
  };

  const updateProfile = (updates) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('logitech_user', JSON.stringify(updatedUser));
  };

  const changePassword = async (currentPass, newPass) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const passwordsDb = JSON.parse(localStorage.getItem('mock_passwords') || '{}');
        const userLoginId = user.username;

        if (passwordsDb[userLoginId] !== currentPass) {
          reject(new Error('Incorrect current password')); 
        } else {
          passwordsDb[userLoginId] = newPass;
          localStorage.setItem('mock_passwords', JSON.stringify(passwordsDb));
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