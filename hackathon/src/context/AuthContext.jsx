import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Відновлення сесії при завантаженні додатка з безпечним парсингом
  useEffect(() => {
    const savedUser = localStorage.getItem('logitech_user');
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

        // Дефолтні налаштування для профілю (settings)
        const defaultSettings = {
          notifications: { email: true, sms: false, push: false },
          security: { twoFactor: false }
        };

        // Розширені дані користувачів з інтегрованими налаштуваннями
        if (username === 'admin') {
          userData = { name: 'System Admin', role: 'ADMIN', token: '111', email: 'admin@logitech.ai', phone: '+380501234567', avatar: null, ...defaultSettings };
        } else if (username === 'disp') {
          userData = { name: 'Valeriia', role: 'DISPATCHER', token: '222', email: 'valeriia@logitech.ai', phone: '+380671234567', avatar: null, ...defaultSettings };
        } else if (username === 'client') {
          userData = { name: 'Kyiv Hospital #3', role: 'CUSTOMER', token: '333', email: 'hospital3@kyiv.med', phone: '+380441234567', avatar: null, ...defaultSettings };
        } else if (username === 'driver') {
          userData = { name: 'Taras (Truck AI-1020)', role: 'DRIVER', token: '444', email: 'taras@logitech.ai', phone: '+380931234567', avatar: null, ...defaultSettings };
        }

        if (userData && password === '123') { 
          setUser(userData);
          localStorage.setItem('logitech_user', JSON.stringify(userData));
          resolve(userData);
        } else {
          // Замість алертів (як ми й домовлялися) повертаємо помилку через reject
          reject(new Error('Try: admin/123, disp/123, client/123, driver/123'));
        }
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('logitech_user');
  };

  // Функція для оновлення профілю та налаштувань із SettingsPage
  const updateProfile = (updates) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('logitech_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

// Безпечний хук для використання контексту
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};