import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../context/AuthContext';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: ROUTES.DASHBOARD },
    { name: 'Map', path: ROUTES.MAP },
    { name: 'Settings', path: ROUTES.SETTINGS },
  ];

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <h2>LOGITECH.AI</h2>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p className="user-info">Logged in as: {user?.name}</p>
          <button onClick={logout} className="btn-secondary">Logout</button>
        </div>
      </aside>

      <main className="app-main">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;