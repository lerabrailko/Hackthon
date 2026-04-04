import React, { createContext, useState, useContext, useCallback, useRef, useMemo } from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const NotificationContext = createContext(null);

const initialNotifications = [
  {
    id: 101,
    message: 'Critical deficit: Lviv Hub urgently needs 150 units of "Ammunition".',
    type: 'danger',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false
  },
  {
    id: 102,
    message: 'Warning: Transport delay on Kyiv-Rivne route due to weather conditions.',
    type: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: true
  }
];

export const NotificationProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const [history, setHistory] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialNotifications.filter(n => !n.read).length);
  const timerRef = useRef(null);

  const icons = {
    success: <CheckCircle size={20} />,
    danger: <XCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />
  };

  const closeToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  const showNotification = useCallback((message, type = 'info', isSystem = false) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const newNotif = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
      read: false
    };

    setToast(newNotif);

    if (!isSystem) {
      setHistory(prev => [newNotif, ...prev.slice(0, 49)]);
      setUnreadCount(prev => prev + 1);
    }

    timerRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  const markAllAsRead = useCallback(() => {
    setHistory(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setUnreadCount(0);
  }, []);

  const value = useMemo(() => ({
    showNotification,
    history,
    unreadCount,
    markAllAsRead,
    clearHistory,
    toast,
    setToast
  }), [showNotification, history, unreadCount, markAllAsRead, clearHistory, toast]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {toast && (
        <div className={`app-toast toast-${toast.type} animate-slide-up`}>
          <div className="toast-icon">
            {icons[toast.type] || icons.info}
          </div>
          <div className="toast-content">
            <span className="toast-message">{toast.message}</span>
          </div>
          <button className="toast-close" onClick={closeToast} aria-label="Close">
            <X size={18} />
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotify = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotify must be used within a NotificationProvider');
  }
  return context;
};