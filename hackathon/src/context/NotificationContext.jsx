import React, { createContext, useState, useContext } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          padding: '16px 24px',
          backgroundColor: notification.type === 'danger' ? '#f43f5e' : '#0ea5e9',
          color: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          fontWeight: 'bold',
          zIndex: 1000,
          animation: 'slideUp 0.3s ease'
        }}>
          {notification.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotify = () => useContext(NotificationContext);