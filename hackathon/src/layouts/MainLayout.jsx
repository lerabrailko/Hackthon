import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { useNotify } from '../context/NotificationContext';

const Icons = {
  tracking: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
  map: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>,
  inventory: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
  analytics: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
};

const TYPE_ICONS = { success: '✓', danger: '✕', warning: '⚠', info: 'i' };

const BrandIconSvg = () => (
  <img 
    src="/favicon.svg" 
    alt="DispatchX Logo" 
    className="custom-brand-logo"
  />
);

const NotificationCenter = () => {
  const { history, unreadCount, markAllAsRead, clearHistory } = useNotify();
  const { t } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && unreadCount > 0) markAllAsRead();
  };

  return (
    <div ref={wrapperRef} className="notif-center-wrapper">
      <button onClick={handleToggle} className={`notif-bell-btn ${unreadCount > 0 ? 'bell-active' : ''}`}>
        <svg className={`bell-icon ${unreadCount > 0 ? 'bell-shake' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && <span className="notif-dot" />}
      </button>

      {isOpen && (
        <div className="notif-dropdown animate-in">
          <div className="notif-dropdown-header">
            <span className="notif-dropdown-title">{t('notifications_title')}</span>
            {history.length > 0 && (
              <button onClick={clearHistory} className="notif-clear-btn">
                {t('clear_all')}
              </button>
            )}
          </div>
          <div className="notif-list">
            {history.length === 0 ? (
              <div className="notif-empty">
                <span>{t('no_notifications')}</span>
              </div>
            ) : (
              history.map(notif => (
                <div key={notif.id} className={`notif-item notif-item-${notif.type} ${notif.read ? 'notif-read' : 'notif-unread'}`}>
                  <span className="notif-item-icon">{TYPE_ICONS[notif.type]}</span>
                  <div className="notif-item-body">
                    <p className="notif-item-message">{notif.message}</p>
                    <span className="notif-item-time">{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {!notif.read && <span className="notif-unread-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MainLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLang();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { name: t('menu_dispatch'), path: ROUTES.DASHBOARD, icon: Icons.tracking },
    { name: t('menu_radar'), path: ROUTES.MAP, icon: Icons.map },
    { name: t('menu_inventory'), path: '/inventory', icon: Icons.inventory },
    { name: t('menu_analytics'), path: '/analytics', icon: Icons.analytics },
    { name: t('menu_settings'), path: '/settings', icon: Icons.settings },
  ];

  useEffect(() => { setIsMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate(ROUTES.LOGIN); };

  if (user?.role === 'DRIVER') {
    return <div className="driver-layout-wrapper">{children}</div>;
  }

  return (
    <div className="app-layout">
      {/* Мобільна шапка */}
      <div className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setIsMobileOpen(!isMobileOpen)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div className="brand-logo">
          <div className="brand-icon">
            <BrandIconSvg />
          </div>
          <div className="brand-text">Dispatch<span>X</span></div>
        </div>
        <div className="mobile-notifications">
          <NotificationCenter />
        </div>
      </div>

      {/* Оверлей сайдбару */}
      {isMobileOpen && <div className="sidebar-overlay" onClick={() => setIsMobileOpen(false)}></div>}

      {/* Сайдбар */}
      <aside className={`app-sidebar ${isMobileOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <BrandIconSvg />
          </div>
          <div className="brand-text">Dispatch<span>X</span></div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">{t('main_menu')}</div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`nav-link ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="user-profile">
              <div className="user-avatar">
                {user.avatar ? <img src={user.avatar} alt="P" /> : user.name?.charAt(0)}
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-role">{user.role}</div>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="logout-btn">
            {Icons.logout} {t('sign_out')}
          </button>
        </div>
      </aside>

      {/* Основний контент */}
      <main className="app-main-content">
        <div className="top-bar-controls">
          <NotificationCenter />
        </div>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;